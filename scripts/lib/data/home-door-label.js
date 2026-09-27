export const DOOR_LABEL={width:.25,height:.077,fromLatchEdge:.43,pastLatchEdge:.16,bottom:1.33,surface:.30,near:1.45};
export function labelId(leaf,side){return leaf+'/handle-label-'+(side<0?'front':'back');}
export function labelPosition(width,side){return {x:-width+DOOR_LABEL.fromLatchEdge,y:DOOR_LABEL.bottom,z:side*DOOR_LABEL.surface};}
export function edgeLabelPosition(width){return {x:-width-DOOR_LABEL.pastLatchEdge,y:DOOR_LABEL.bottom,z:0};}
// Cream words on a dark pill, so the prompt reads on a cream wall and on a dark one. Depth testing stays on.
export const DOOR_PROMPT_VECTOR=`<svg viewBox="0 0 156 48" width="${DOOR_LABEL.width}m" billboard="full">
  <g id="use">
    <rect x="1" y="2" width="124" height="44" rx="22" fill="#1d1712" fill-opacity="0.86" stroke="#f2e6cf" stroke-opacity="0.35" stroke-width="1.5" />
    <circle cx="24" cy="24" r="15" fill="none" stroke="#f2e6cf" stroke-width="1.8" />
    <text x="24" y="31" text-anchor="middle" font-family="sans-serif" font-size="19" fill="#f2e6cf">E</text>
    <text x="48" y="32" font-family="serif" font-size="26" fill="#f7eedd">{{ state.verb }}</text>
  </g>
</svg>`;
