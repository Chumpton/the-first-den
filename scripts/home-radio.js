import {DEVICES as D,radioAudio} from './lib/data/home-devices.js';
import {RADIO_PROGRAM as R} from './lib/data/radio-program.js';
export function stationAt(s){return D.stations[s.station]||D.stations[0];}
export function songsAt(s){const station=stationAt(s);return station.songs||[{id:station.name,title:station.name,ref:station.ref,duration:null}];}
function indexAt(s){const n=songsAt(s).length;return ((s.songIndices?.[String(s.station)]??0)%n+n)%n;}
export function songAt(s){return s.guest&&D.guest?D.guest:songsAt(s)[indexAt(s)];}
function duration(ctx,entry){return entry.duration||ctx.world.assets[entry.ref]?.duration||R.unknownDurationSeconds;}
function put(s,key,value){if(s[key]!==value)s[key]=value;}
function nextIndex(s){if(!s.songIndices)s.songIndices={};s.songIndices[String(s.station)]=(indexAt(s)+1)%songsAt(s).length;}
// Once the station has played guestGap of its own songs since the guest song, a pick may land on it; the pick after it goes back to the station.
function pickNext(ctx){const s=ctx.self.state,gap=R.guestGap||0;if(s.guest){s.guest=null;s.sinceGuest=1;return;}nextIndex(s);const since=s.sinceGuest??gap;if(D.guest&&since>=gap&&ctx.random()<(R.guestChance||0)){s.guest=D.guest.id;return;}s.sinceGuest=since+1;}
export function retireRadioBroadcast(ctx){
 const music=ctx.music.now();if(!music)return;
 const layers=music.layers||{[music.layer||'default']:music};
 for(const [layer,voice] of Object.entries(layers))if(D.stations.some(st=>st.ref===voice.ref||(st.songs||[]).some(t=>t.ref===voice.ref)))ctx.music.stop({layer,fade:D.radio.migrationFade});
}
function refreshFace(ctx){
 const s=ctx.self.state,station=stationAt(s),track=songAt(s);
 put(s,'stationName',station.name);put(s,'frequency',station.frequency||(s.station===1?'104.8':'88.6'));
 put(s,'powerLabel',s.powered?'ON':'OFF');put(s,'indicator',s.powered?'#e8b860':'#665542');
 const lit=s.powered?1:0;if(ctx.self.fx&&ctx.self.fx.params.lit!==lit)ctx.self.fx.params.lit=lit;
 put(s,'songTitle',s.phase==='report'||s.phase==='fade'?'Lake weather':track.title);
 put(s,'songCount',songsAt(s).length);put(s,'songNumber',s.guest&&D.guest?'--':indexAt(s)+1);
 const status=!s.powered?'OFF':s.phase==='gap'?'BETWEEN SONGS':s.phase==='fuzz'?'TUNING':s.phase==='report'||s.phase==='fade'?'LOCAL FORECAST':'ON AIR';
 put(s,'broadcastLabel',status);
 ctx.self.bones.power.roll=s.powered?40:-40;ctx.self.bones.tune.roll=s.station===1?55:-55;
 ctx.interactPrompt(ctx.self.id,null);
}
function setPhase(ctx,phase,seconds,ref=''){
 const s=ctx.self.state;s.programToken=(s.programToken||0)+1;s.phase=phase;s.phaseAt=ctx.now();s.phaseUntil=seconds===null?null:ctx.now()+seconds*1000;s.activeRef=ref;
 refreshFace(ctx);
}
function clip(ctx,ref,gain,offset=0,loop=false){
 const a=radioAudio(true,ctx.self.state.station);
 ctx.self.audio={...a,clip:ref,loop,gain,time:offset,timeAt:ctx.now()};
}
function syncProgramAudio(ctx){
 const s=ctx.self.state;
 if(s.phase==='off'||s.phase==='gap'){if(ctx.self.audio)ctx.self.audio=null;return;}
 if(s.phase==='fade')return;
 const entry=s.phase==='music'?songAt(s):s.phase==='report'?D.reports?.[s.activeReport]:D.fuzz;
 if(!entry)return;
 const elapsed=Math.max(0,(ctx.now()-s.phaseAt)/1000)+(s.phase==='music'?(s.trackOffset||0):0);
 if(elapsed>=duration(ctx,entry))return;
 const gain=D.radio.volume*(s.phase==='report'?R.reportGain:s.phase==='fuzz'?R.fuzzGain:1);
 const a=ctx.self.audio,loop=!entry.duration&&!ctx.world.assets[entry.ref]?.duration;
 // A tree edit can restore an authored voice while the live programme keeps its clock.
 // Repair the voice at that clock's playhead, never rewind it.
 if(a?.clip!==entry.ref||!Number.isFinite(a.timeAt)){clip(ctx,entry.ref,gain,elapsed,loop);return;}
 for(const [key,value] of Object.entries({gain,loop,spatial:true,refDistance:D.radio.refDistance,maxDistance:D.radio.maxDistance,bus:'Music'}))if(a[key]!==value)ctx.self.audio[key]=value;
}
export function beginMusic(ctx,offset=0){
 const s=ctx.self.state,track=songAt(s),seconds=duration(ctx,track),at=Math.max(0,Math.min(offset,Math.max(0,seconds-.1)));
 setPhase(ctx,'music',seconds-at,track.ref);s.trackOffset=at;
 clip(ctx,track.ref,D.radio.volume,at,!track.duration&&!ctx.world.assets[track.ref]?.duration);
}
function silence(ctx,seconds){ctx.self.audio=null;setPhase(ctx,'gap',seconds);}
function finishMusic(ctx){pickNext(ctx);silence(ctx,R.gapMinSeconds+ctx.random()*(R.gapMaxSeconds-R.gapMinSeconds));}
function finishGap(ctx){
 const fuzz=D.fuzz;
 if(fuzz?.duration>0&&ctx.random()<R.fuzzChance){setPhase(ctx,'fuzz',fuzz.duration,fuzz.ref);clip(ctx,fuzz.ref,D.radio.volume*R.fuzzGain);}
 else beginMusic(ctx);
}
function goOff(ctx){
 const s=ctx.self.state;s.resumeSong=null;s.activeReport=null;ctx.self.audio=null;setPhase(ctx,'off',null);
}
function playReport(ctx){
 const s=ctx.self.state,report=D.reports?.[s.activeReport];
 if(s.resumeSong?.fadeAt!==undefined){s.resumeSong.offset+=(ctx.now()-s.resumeSong.fadeAt)/1000;delete s.resumeSong.fadeAt;}
 if(!report){resumeMusic(ctx);return;}
 setPhase(ctx,'report',duration(ctx,report)+R.reportTailSeconds,report.ref);
 clip(ctx,report.ref,D.radio.volume*R.reportGain);
}
function resumeMusic(ctx){
 const s=ctx.self.state,resume=s.resumeSong;s.resumeSong=null;s.activeReport=null;
 if(resume&&resume.station===s.station&&resume.index===indexAt(s)){
  if(resume.offset>=duration(ctx,songAt(s))-.1){finishMusic(ctx);return;}
  beginMusic(ctx,resume.offset);
 }else beginMusic(ctx);
}
function beginReport(ctx,rainAt){
 const s=ctx.self.state,reports=D.reports||[];if(!reports.length)return;
 const entry=(s.reportCount||0)%reports.length;if(!(reports[entry].duration>0))return;
 s.lastForecastAt=rainAt;s.activeReport=entry;s.reportCount=(s.reportCount||0)+1;
 const fading=s.phase==='music'&&!!ctx.self.audio;
 s.resumeSong=fading?{station:s.station,index:indexAt(s),offset:(s.trackOffset||0)+(ctx.now()-s.phaseAt)/1000,fadeAt:ctx.now()}:null;
 if(fading){setPhase(ctx,'fade',R.fadeSteps*R.fadeStepSeconds+.1);s.fadeStep=0;fadeForReport(ctx,{token:s.programToken});}
 else playReport(ctx);
}
export function fadeForReport(ctx,{token}){
 const s=ctx.self.state;if(token!==s.programToken||!s.powered||s.phase!=='fade')return;
 s.fadeStep=(s.fadeStep||0)+1;
 if(ctx.self.audio)ctx.self.audio.gain=D.radio.volume*Math.max(0,1-s.fadeStep/R.fadeSteps);
 if(s.fadeStep>=R.fadeSteps){playReport(ctx);return;}
 ctx.after(R.fadeStepSeconds,'fadeForReport',{token});
}
function forecast(ctx){
 const s=ctx.self.state,w=ctx.place.state.weather,now=ctx.now();
 if(!s.powered||!w||w.kind!=='clouding'||s.phase==='fade'||s.phase==='report')return;
 const lead=w.nextAt-now;
 if(lead>R.warningLeadMs||lead<R.minimumWarningLeadMs||s.lastForecastAt===w.nextAt)return;
 beginReport(ctx,w.nextAt);
}
function initialize(ctx){
 const s=ctx.self.state;
 if(s.powered===undefined)s.powered=true;
 if(!Number.isInteger(s.station)||!D.stations[s.station])s.station=0;
 if(!s.songIndices)s.songIndices={};
 if(s.audioMode!==D.radio.audioMode){retireRadioBroadcast(ctx);s.audioMode=D.radio.audioMode;}
 if(s.programVersion!==R.version||!s.phase){
  s.programVersion=R.version;
  if(s.powered&&ctx.self.audio?.clip===songAt(s).ref){
   // Adopt the existing loop without seeking or restarting it during this edit.
   const a=ctx.self.audio,now=ctx.now(),offset=Number.isFinite(a.timeAt)?Math.max(0,(a.time||0)+(now-a.timeAt)/1000)%duration(ctx,songAt(s)):0;
   setPhase(ctx,'music',duration(ctx,songAt(s))-offset,a.clip);s.trackOffset=offset;
  }else if(s.powered)beginMusic(ctx);else goOff(ctx);
 }
 refreshFace(ctx);
}
function press(ctx,by,action){
 const player=ctx.getObject(by);if(!player||!ctx.place.players.some(p=>p.id===player.id))return;
 const p=player.worldFeetPosition,q=ctx.self.worldFeetPosition;
 if(!p||Math.hypot(p.x-q.x,p.y-q.y,p.z-q.z)>D.radio.reach)return;
 const s=ctx.self.state,now=ctx.now();if(now-(s.pressedAt??-1000)<D.radio.debounceMs)return;
 s.pressedAt=now;s.resumeSong=null;s.activeReport=null;
 if(action==='tune'){s.station=(s.station+1)%D.stations.length;if(s.guest){s.guest=null;s.sinceGuest=1;}}
 else if(action==='next')pickNext(ctx);
 else s.powered=!s.powered;
 if(s.powered)beginMusic(ctx);else goOff(ctx);
 ctx.emit('playSound',{clip:D.click,position:q,volume:.075,maxDistance:4,mode:'restart'});
 forecast(ctx);
}
export function onSpawn(ctx){
 ctx.on('press',(ctx,{by})=>press(ctx,by,'power'));
 ctx.on('ui:power',(ctx,{by})=>press(ctx,by,'power'));
 ctx.on('ui:tune',(ctx,{by})=>press(ctx,by,'tune'));
 ctx.on('ui:next',(ctx,{by})=>press(ctx,by,'next'));
 ctx.self.state.listeners=['press','ui:power','ui:tune','ui:next'];initialize(ctx);syncProgramAudio(ctx);
}
export const updateSchedule={every:{seconds:1}};
export function update(ctx){
 const s=ctx.self.state;initialize(ctx);
 if(!s.powered){if(s.phase!=='off'||ctx.self.audio)goOff(ctx);return;}
 if(s.phase==='off'){beginMusic(ctx);return;}
 if(s.phase==='music'){
  const ends=s.phaseAt+Math.max(0,duration(ctx,songAt(s))-(s.trackOffset||0))*1000;
  put(s,'phaseUntil',ends);
 }
 forecast(ctx);
 if(s.phaseUntil!==null&&ctx.now()>=s.phaseUntil){
  if(s.phase==='music')finishMusic(ctx);
  else if(s.phase==='gap')finishGap(ctx);
  else if(s.phase==='fuzz')beginMusic(ctx);
  else if(s.phase==='fade')playReport(ctx);
  else if(s.phase==='report')resumeMusic(ctx);
 }
 syncProgramAudio(ctx);
}
