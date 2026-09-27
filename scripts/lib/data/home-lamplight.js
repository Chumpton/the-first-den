// Indoor practicals complement the existing sky. No clock, cycle or outdoor exposure is changed.
export const LAMPLIGHT = {
  pendant: { day: 1.6, night: 4, rainDim: .25, distance: 5.2, decay: 2 },
  sconce: { day: .23, night: .65, rainDim: .18, distance: 3.8, decay: .5 },
  dayColor: [238,226,211], nightColor: [255,224,182],
  writeStep: .01,
  sites: [
    ...['den','board','spare'].map(room=>({id:'home-root/furniture-pendant-'+room+'/warm-light',kind:'pendant'})),
    ...['den-back','den-hip','board','spare'].map(room=>({id:'home-root/home-sconce-'+room+'/home-sconce-'+room+'-light',kind:'sconce'}))
  ]
};
export function lampTargets(night=0,rain=0) {
  night=Math.max(0,Math.min(1,night)); rain=Math.max(0,Math.min(1,rain));
  const color='#'+LAMPLIGHT.dayColor.map((v,i)=>Math.round(v+(LAMPLIGHT.nightColor[i]-v)*night).toString(16).padStart(2,'0')).join('');
  const result={color};
  for(const kind of ['pendant','sconce']){
    const p=LAMPLIGHT[kind];
    result[kind]=Math.round((p.day+(p.night-p.day)*night)*(1-p.rainDim*rain)*100)/100;
  }
  return result;
}
