// The den's own life from minute one: the birds, the fish and the butterflies are renderer effects that cost no tick.
// The weather controller dims the birds and butterflies at night and in rain.
export const gulls={tags:['den-life','den-birds'],physics:'none',fx:{script:'scripts/effects-den-birds.fx.js',params:{amount:1}}};
export const fish={tags:['den-life','den-fish'],physics:'none',fx:{script:'scripts/effects-den-fish.fx.js',params:{}}};
export const butterflies={tags:['den-life','den-butterflies'],physics:'none',fx:{script:'scripts/effects-den-butterflies.fx.js',params:{amount:1}}};
// The picture window's curtains: pleated linen whose breeze is its material's GPU sway (scripts/material-den-sway.js) — no tick, no row.
export const curtain={tags:['den-life','den-curtain'],physics:'none',castShadow:true,receiveShadow:true,primitive:{kind:'scripted',script:'scripts/gen/den-curtain.js',params:{width:.45,drop:1.84,folds:6,tone:'#e8dcc4'}},material:{kind:'scripted',script:'scripts/material-den-sway.js',params:{drop:1.84,reach:.035,speed:.9}}};
export const curtainRod={tags:['den-life','den-curtain'],physics:'none',castShadow:true,primitive:{kind:'scripted',script:'scripts/gen/den-curtain.js',params:{rod:1,width:3.05,reach:.21}},material:{pbr:true,color:'#ffffff',roughness:.4}};
