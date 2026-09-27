// Relative to the blanket's existing stool attachment; seat is local Y=.205.
export const BLANKET={
 seatY:.205,seatRadius:.26,seatOffsetZ:-.008,thickness:.006,hem:.0025,
 across:14,subdivisions:3,restRipple:.002,foldRipple:.008,tipRipple:.009,
 // [fixed Z, fraction of the round seat's front edge, height above seat].
 // Lower folded layer -> rounded return -> upper layer -> freely hanging end.
 profile:[
  [.100,0,.010],[-.110,0,.010],[-.142,0,.015],[-.153,0,.025],
  [-.145,0,.037],[-.119,0,.040],[-.065,0,.037],[0,0,.033],
  [0,.58,.030],[-.018,1,.027],[.006,1,.016],[.016,1,-.012],
  [.021,1,-.050],[.024,1,-.105],[.030,1,-.157],[.025,1,-.194]
 ]
};
