import { TAU, face, box, prism, frustum, orb, strut, ngon, annulus, ringPts, paint } from "./hearth-mesh.js";
// Hearthmere's houses, one family: cream plaster over honey timber framing, round amber windows, deep thatch or red tile.
// params: width (x), depth (z), floors 1-3, roof thatch|tile, interior "" | tavern | bakery | workshop | home (enterable: door hole, floor, furnishings).
// Origin mid-floor at ground, door centred in the -Z face, ridge along X.
const H = 2.8, T = 0.3, DOOR = 0.6, DOORH = 2.3;
function dims(P) {
  const w = +P.width || 7, d = +P.depth || 6, F = Math.max(1, Math.min(3, Math.round(+P.floors || 1)));
  const j = F > 1 ? 0.28 : 0, top = H * F, ew = w / 2 + j, ed = d / 2 + j;
  return { w, d, F, j, top, ew, ed, rise: ed * 1.08, o: 0.6, gx: ew + 0.45, roof: P.roof === "tile" ? "tile" : "thatch", kind: P.interior || "" };
}
function faces(hx, hz) {
  return [
    { o: [0, -hz], u: [1, 0], n: [0, -1], L: 2 * hx, front: true },
    { o: [0, hz], u: [-1, 0], n: [0, 1], L: 2 * hx },
    { o: [hx, 0], u: [0, 1], n: [1, 0], L: 2 * hz },
    { o: [-hx, 0], u: [0, -1], n: [-1, 0], L: 2 * hz },
  ];
}
const at = (f, s, y, off) => [f.o[0] + f.u[0] * s + f.n[0] * off, y, f.o[1] + f.u[1] * s + f.n[1] * off];
function fbox(ctx, f, s0, s1, y0, y1, o0, o1) { const a = at(f, s0, y0, o0), b = at(f, s1, y1, o1); box(ctx, a[0], a[1], a[2], b[0], b[1], b[2]); }
function shell(ctx, w, d) { // the enterable ground floor: four wall slabs, the door cut in the front one
  box(ctx, -w / 2, 0, d / 2 - T, w / 2, H, d / 2);
  box(ctx, -w / 2, 0, -d / 2 + T, -w / 2 + T, H, d / 2 - T);
  box(ctx, w / 2 - T, 0, -d / 2 + T, w / 2, H, d / 2 - T);
  box(ctx, -w / 2, 0, -d / 2, -DOOR, H, -d / 2 + T);
  box(ctx, DOOR, 0, -d / 2, w / 2, H, -d / 2 + T);
  box(ctx, -DOOR, DOORH, -d / 2, DOOR, H, -d / 2 + T);
}
function roofShell(ctx, D, detail) {
  const { top, ed, rise, o, gx, roof } = D, s = rise / ed, th = roof === "thatch" ? 0.45 : 0.16;
  const yE = top - o * s, yR = top + rise;
  paint(ctx, roof);
  for (const g of [-1, 1]) {
    const zE = g * (ed + o), n = [0, ed, g * rise];
    face(ctx, [[-gx, yE, zE], [gx, yE, zE], [gx, yR, 0], [-gx, yR, 0]], n);
    face(ctx, [[-gx, yE - th, zE], [gx, yE - th, zE], [gx, yR - th, 0], [-gx, yR - th, 0]], [0, -n[1], -n[2]]);
    face(ctx, [[-gx, yE, zE], [gx, yE, zE], [gx, yE - th, zE], [-gx, yE - th, zE]], [0, 0, g]);
    for (const x of [-gx, gx]) face(ctx, [[x, yE, zE], [x, yR, 0], [x, yR - th, 0], [x, yE - th, zE]], [Math.sign(x), 0, 0]);
    if (detail && roof === "thatch") strut(ctx, [-gx, yE - th * 0.4, zE], [gx, yE - th * 0.4, zE], 0.26, 0.26, 5);
    if (detail && roof === "tile") for (let k = 1; k < 9; k++) { const t = k / 9, z = zE * (1 - t), y = yE + (yR - yE) * t + 0.03; strut(ctx, [-gx, y, z], [gx, y, z], 0.04, 0.04, 3); }
  }
  if (roof === "thatch") { paint(ctx, detail ? "moss" : "thatch"); strut(ctx, [-gx - 0.05, yR + 0.02, 0], [gx + 0.05, yR + 0.02, 0], 0.32, 0.32, 6); }
  else strut(ctx, [-gx - 0.05, yR + 0.02, 0], [gx + 0.05, yR + 0.02, 0], 0.14, 0.14, 4);
  return { yR, s };
}
function gables(ctx, D) {
  const { ew, ed, top, rise } = D;
  paint(ctx, "plaster");
  for (const x of [-ew, ew]) face(ctx, [[x, top, -ed], [x, top, ed], [x, top + rise, 0]], [Math.sign(x), 0, 0]);
}
// ---------- interiors: data rows, drawn and (the solid ones) collided ----------
function interior(D) {
  const { w, d, F, kind } = D, ix = w / 2 - T, iz = d / 2 - T, I = [];
  const B = (p, b, solid) => I.push({ k: "box", p, b, solid }), C = (p, c, y, r, solid, n) => I.push({ k: "cyl", p, c, y, r, solid, n });
  const O = (p, c, r, seg, lat) => I.push({ k: "orb", p, c, r, seg, lat }), S = (p, a, b, r) => I.push({ k: "strut", p, a, b, r });
  B("plank", [-ix, 0, -iz, ix, 0.12, iz], true); B("plank", [-DOOR, 0, -d / 2 - 0.02, DOOR, 0.12, -iz], true);
  for (const x of [-ix * 0.5, 0, ix * 0.5]) B("darkwood", [x - 0.12, H - 0.3, -iz, x + 0.12, H - (F > 1 ? 0 : 0.05), iz]);
  if (kind === "tavern") {
    B("stone", [-1.2, 0.12, iz - 0.85, 1.2, 1.5, iz], true); B("soot", [-0.62, 0.18, iz - 0.87, 0.62, 0.95, iz - 0.84]);
    B("darkwood", [-1.4, 1.5, iz - 1.0, 1.4, 1.64, iz - 0.5]); B("stone", [-0.85, 1.64, iz - 0.62, 0.85, H, iz]);
    B("darkwood", [ix - 2.1, 0.12, -1.6, ix - 1.55, 1.05, 2.4], true); B("timber", [ix - 2.25, 1.05, -1.7, ix - 1.45, 1.12, 2.5]);
    for (const z of [-0.9, 0.5, 1.9]) { C("darkwood", [ix - 0.55, z], [0.12, 1.05], [0.42, 0.42], true, 8); C("iron", [ix - 0.55, z], [0.3, 0.38], [0.44, 0.44], false, 8); C("iron", [ix - 0.55, z], [0.8, 0.88], [0.44, 0.44], false, 8); }
    for (const z of [-0.6, 0.4, 1.4]) C("bronze", [ix - 1.85, z], [1.12, 1.3], [0.07, 0.07], false, 6);
    for (const [x, z] of [[-2.8, -1.3], [-2.6, 1.4], [0.4, -1.3]]) {
      C("darkwood", [x, z], [0.12, 0.72], [0.1, 0.1], false, 6); C("timber", [x, z], [0.72, 0.8], [0.78, 0.78], true, 10);
      for (let k = 0; k < 3; k++) { const a = k * TAU / 3 + x; C("timber", [x + Math.cos(a) * 1.15, z + Math.sin(a) * 1.15], [0.12, 0.48], [0.24, 0.2], false, 6); }
      C("bronze", [x + 0.2, z - 0.1], [0.8, 0.97], [0.07, 0.07], false, 6);
    }
    B("rug", [-1.5, 0.12, iz - 2.6, 1.5, 0.14, iz - 1.1]);
    O("lanternglow", [-ix + 0.25, 2.0, 0], [0.18, 0.24, 0.18], 6, 3); O("lanternglow", [ix - 0.25, 2.0, -2.6], [0.18, 0.24, 0.18], 6, 3);
  } else if (kind === "bakery") {
    B("stone", [-1.5, 0.12, iz - 1.6, 1.5, 0.95, iz], true); O("stone", [0, 0.95, iz - 0.8], [1.3, 1.05, 0.8], 8, 4);
    B("ember", [-0.38, 0.98, iz - 1.64, 0.38, 1.4, iz - 1.58]); C("stone", [0, iz - 0.6], [1.8, F > 1 ? H : H + 1], [0.22, 0.22], false, 6);
    B("timber", [-2.4, 0.12, -0.7, 1.4, 0.95, -0.15], true); B("plank", [-2.5, 0.95, -0.78, 1.5, 1.02, -0.07]);
    for (let i = 0; i < 6; i++) O("bread", [-2.1 + i * 0.6, 1.1, -0.42], [0.24, 0.11, 0.13], 6, 3);
    for (const y of [0.95, 1.5, 2.05]) { B("timber", [-ix, y, -1.6, -ix + 0.45, y + 0.05, 1.6]); for (let k = 0; k < 3; k++) O("bread", [-ix + 0.22, y + 0.14, -1.1 + k * 1.1], [0.13, 0.1, 0.22], 6, 3); }
    B("timber", [-ix, 0.12, -1.66, -ix + 0.45, 2.2, -1.56], true); B("timber", [-ix, 0.12, 1.56, -ix + 0.45, 2.2, 1.66], true);
    O("linen", [ix - 0.5, 0.45, iz - 0.5], [0.35, 0.4, 0.3], 6, 3); O("linen", [ix - 0.55, 0.4, iz - 1.3], [0.32, 0.36, 0.3], 6, 3);
    C("timber", [1.6, 1.4], [0.12, 0.7], [0.5, 0.5], true, 8); for (let k = 0; k < 4; k++) O("bread", [1.6 + Math.cos(k * 1.6) * 0.25, 0.8, 1.4 + Math.sin(k * 1.6) * 0.25], [0.12, 0.09, 0.12], 5, 3);
  } else if (kind === "workshop") {
    B("timber", [-2.6, 0.12, iz - 0.85, 2.6, 0.88, iz], true); B("darkwood", [-2.7, 0.88, iz - 0.95, 2.7, 0.95, iz]);
    const L = [[-2, -1], [0, -1.5], [2, -1], [-1, 0.6], [1.2, 0.4], [-2.4, 1.6], [2.2, 1.8]], G = ["lanternglow", "lanternrose", "lanterngold"];
    L.forEach(([x, z], i) => { const y = 1.95 + (i % 3) * 0.18; S("iron", [x, y + 0.28, z], [x, H, z], 0.015); O(G[i % 3], [x, y, z], [0.22, 0.3, 0.22], 6, 3); });
    O("paperrose", [-1.6, 1.15, iz - 0.4], [0.18, 0.22, 0.18], 6, 3); O("lanterngold", [-0.6, 1.13, iz - 0.45], [0.16, 0.2, 0.16], 6, 3);
    B("darkwood", [0.6, 0.95, iz - 0.6, 0.64, 1.35, iz - 0.56]); B("darkwood", [0.9, 0.95, iz - 0.6, 0.94, 1.35, iz - 0.56]); B("darkwood", [0.6, 1.33, iz - 0.6, 0.94, 1.37, iz - 0.3]);
    C("paperrose", [1.8, iz - 0.45], [0.95, 1.45], [0.09, 0.09], false, 6); C("papergold", [2.05, iz - 0.4], [0.95, 1.35], [0.09, 0.09], false, 6); C("linen", [2.3, iz - 0.45], [0.95, 1.5], [0.09, 0.09], false, 6);
    B("timber", [ix - 0.45, 1.4, -1.8, ix, 1.45, 1.2]); for (let k = 0; k < 4; k++) O(G[k % 3], [ix - 0.22, 1.62, -1.4 + k * 0.8], [0.16, 0.2, 0.16], 6, 3);
    C("timber", [0, iz - 1.5], [0.12, 0.55], [0.24, 0.2], false, 6);
  } else if (kind === "home") {
    B("darkwood", [-ix, 0.12, iz - 2.1, -ix + 1.4, 0.45, iz], true); B("darkwood", [-ix, 0.12, iz - 0.1, -ix + 1.4, 1.1, iz]);
    B("linen", [-ix + 0.05, 0.45, iz - 2.05, -ix + 1.35, 0.62, iz - 0.1]); B("blanket", [-ix + 0.02, 0.62, iz - 2.08, -ix + 1.38, 0.7, iz - 0.65]);
    O("linen", [-ix + 0.7, 0.72, iz - 0.38], [0.45, 0.1, 0.2], 6, 3);
    C("darkwood", [0.9, -0.4], [0.12, 0.7], [0.1, 0.1], false, 6); C("timber", [0.9, -0.4], [0.7, 0.77], [0.62, 0.62], true, 10); O("rug", [0.9, 0.87, -0.4], [0.12, 0.1, 0.12], 6, 3);
    for (const g of [-1, 1]) { const x = 0.9 + g * 1.05; B("timber", [x - 0.22, 0.12, -0.62, x + 0.22, 0.46, -0.18], true); B("timber", [x + g * 0.18 - 0.04, 0.46, -0.62, x + g * 0.18 + 0.04, 1.0, -0.18]); }
    C("rug", [0.6, 0.5], [0.12, 0.135], [1.3, 1.3], false, 12);
    B("iron", [ix - 0.9, 0.12, iz - 0.85, ix - 0.1, 0.9, iz - 0.1], true); B("ember", [ix - 0.7, 0.3, iz - 0.87, ix - 0.3, 0.6, iz - 0.85]); C("iron", [ix - 0.5, iz - 0.45], [0.9, H + 1], [0.1, 0.1], false, 6);
    B("timber", [ix - 0.35, 1.5, -1.5, ix, 1.55, 0.8]); C("rug", [ix - 0.18, -1.1], [1.55, 1.8], [0.1, 0.12], false, 6); C("bronze", [ix - 0.18, -0.4], [1.55, 1.72], [0.08, 0.08], false, 6); O("leaf", [ix - 0.18, 1.72, 0.3], [0.16, 0.14, 0.16], 5, 3);
    O("lanternglow", [-ix + 0.2, 2.0, -1.2], [0.15, 0.2, 0.15], 6, 3);
  }
  return I;
}
function drawItem(ctx, it, col) {
  if (col && !it.solid) return;
  if (!col) paint(ctx, it.p);
  if (it.k === "box") box(ctx, ...it.b);
  else if (it.k === "cyl") { if (col) prism(ctx, ringPts(it.c[0], it.c[1], it.r[0], 6), it.y[0], it.y[1]); else frustum(ctx, it.c[0], it.c[1], it.y[0], it.y[1], it.r[0], it.r[1] ?? it.r[0], it.n || 8); }
  else if (it.k === "orb" && !col) orb(ctx, ...it.c, ...it.r, it.seg || 6, it.lat || 3);
  else if (it.k === "strut" && !col) strut(ctx, it.a, it.b, it.r, it.r, 4);
}
// ---------- the house ----------
function storey(ctx, D, hx, hz, y0, y1, ground, lod, wins) {
  for (const f of faces(hx, hz)) {
    let n = Math.max(1, Math.round(f.L / 2.4)); if (n % 2 === 0) n++;
    const pw = f.L / n, L2 = f.L / 2, door = ground && f.front;
    paint(ctx, "timber");
    fbox(ctx, f, -L2 - 0.08, -L2 + 0.16, y0, y1, -0.08, 0.07);
    fbox(ctx, f, -L2, L2, y1 - 0.2, y1, 0, 0.06);
    const b0 = y0 + (ground ? 0.42 : 0), b1 = y0 + (ground ? 0.58 : 0.18);
    if (door) { fbox(ctx, f, -L2, -DOOR - 0.1, b0, b1, 0, 0.06); fbox(ctx, f, DOOR + 0.1, L2, b0, b1, 0, 0.06); } else fbox(ctx, f, -L2, L2, b0, b1, 0, 0.06);
    for (let k = 1; k < n; k++) { const s = -L2 + k * pw; fbox(ctx, f, s - 0.08, s + 0.08, y0, y1, 0, 0.06); }
    for (let k = 0; k < n; k++) {
      const sc = -L2 + (k + 0.5) * pw;
      if (door && k === (n - 1) / 2) continue;
      if (ctx.random() < 0.74) wins.push({ f, s: sc, y: y0 + (ground ? 1.6 : 1.45), r: Math.min(0.46, pw / 2 - 0.3) });
      else if (lod <= 2) { const flip = ctx.random() < 0.5, sA = sc - pw / 2 + 0.12, sB = sc + pw / 2 - 0.12; strut(ctx, at(f, flip ? sB : sA, b1, 0.03), at(f, flip ? sA : sB, y1 - 0.2, 0.03), 0.07, 0.07, 4); }
    }
  }
}
export function geometry(ctx) {
  const D = dims(ctx.params), lod = ctx.lod, { w, d, F, top, ew, ed, kind } = D;
  if (lod >= 4) {
    paint(ctx, "plaster"); box(ctx, -w / 2, 0, -d / 2, w / 2, H, d / 2, "b"); if (F > 1) box(ctx, -ew, H, -ed, ew, top, ed, "b");
    gables(ctx, D); roofShell(ctx, D, false);
    if (lod === 4) { paint(ctx, "glass"); for (let f = 0; f < F; f++) for (const x of [-w / 4, w / 4]) ngon(ctx, [x, H * f + 1.6, -(f ? ed : d / 2) - 0.05], [1, 0, 0], [0, 1, 0], 0.42, 4, [0, 0, -1]); }
    return;
  }
  // walls
  paint(ctx, "plaster");
  if (kind) shell(ctx, w, d); else box(ctx, -w / 2, 0, -d / 2, w / 2, H, d / 2, "b");
  for (let f = 1; f < F; f++) box(ctx, -ew, H * f, -ed, ew, H * (f + 1), ed, f > 1 ? "b" : "");
  gables(ctx, D);
  // stone plinth
  paint(ctx, "stone");
  box(ctx, -w / 2 - 0.08, 0, d / 2 - 0.01, w / 2 + 0.08, 0.42, d / 2 + 0.08, "b");
  box(ctx, -w / 2 - 0.08, 0, -d / 2 + 0.01, -w / 2 + 0.01, 0.42, d / 2 - 0.01, "b");
  box(ctx, w / 2 - 0.01, 0, -d / 2 + 0.01, w / 2 + 0.08, 0.42, d / 2 - 0.01, "b");
  box(ctx, -w / 2 - 0.08, 0, -d / 2 - 0.08, -DOOR - 0.15, 0.42, -d / 2 + 0.01, "b");
  box(ctx, DOOR + 0.15, 0, -d / 2 - 0.08, w / 2 + 0.08, 0.42, -d / 2 + 0.01, "b");
  box(ctx, -0.95, 0, -d / 2 - 0.55, 0.95, 0.12, -d / 2 - 0.08, "b"); // door step
  // timber framing + windows
  const wins = [];
  storey(ctx, D, w / 2, d / 2, 0, H, true, lod, wins);
  for (let f = 1; f < F; f++) {
    storey(ctx, D, ew, ed, H * f, H * (f + 1), false, lod, wins);
    paint(ctx, "darkwood"); box(ctx, -ew - 0.05, H * f - 0.12, -ed - 0.05, ew + 0.05, H * f + 0.14, ed + 0.05, ""); // jetty beam
  }
  for (const W of wins) {
    const u = [W.f.u[0], 0, W.f.u[1]], v = [0, 1, 0], nn = [W.f.n[0], 0, W.f.n[1]];
    paint(ctx, "glass"); ngon(ctx, at(W.f, W.s, W.y, 0.05), u, v, W.r, 8, nn, Math.PI / 8);
    paint(ctx, "timber"); annulus(ctx, at(W.f, W.s, W.y, 0.08), u, v, W.r, W.r + 0.11, 8, nn, Math.PI / 8);
    if (lod === 1) { strut(ctx, at(W.f, W.s - W.r, W.y, 0.07), at(W.f, W.s + W.r, W.y, 0.07), 0.025, 0.025, 4); strut(ctx, at(W.f, W.s, W.y - W.r, 0.07), at(W.f, W.s, W.y + W.r, 0.07), 0.025, 0.025, 4); }
  }
  // gable-end attic windows
  paint(ctx, "glass"); for (const x of [-ew, ew]) ngon(ctx, [x + Math.sign(x) * 0.04, top + D.rise * 0.38, 0], [0, 0, 1], [0, 1, 0], 0.32, 8, [Math.sign(x), 0, 0]);
  // door
  const f0 = faces(w / 2, d / 2)[0];
  paint(ctx, "timber");
  fbox(ctx, f0, -DOOR - 0.16, -DOOR, 0, DOORH + 0.02, -0.01, 0.1); fbox(ctx, f0, DOOR, DOOR + 0.16, 0, DOORH + 0.02, -0.01, 0.1);
  fbox(ctx, f0, -DOOR - 0.25, DOOR + 0.25, DOORH, DOORH + 0.2, -0.01, 0.12);
  paint(ctx, "darkwood"); fbox(ctx, f0, -DOOR - 0.45, DOOR + 0.45, DOORH + 0.35, DOORH + 0.45, 0, 0.75); // hood
  if (kind) {
    paint(ctx, "timber"); box(ctx, -DOOR - 0.02, 0.12, -d / 2, -DOOR, DOORH, -d / 2 + T); box(ctx, DOOR, 0.12, -d / 2, DOOR + 0.02, DOORH, -d / 2 + T);
    paint(ctx, "darkwood"); box(ctx, -DOOR, 0.12, -d / 2 + T, -DOOR + 0.07, DOORH - 0.05, -d / 2 + T + 1.15); // leaf swung in
  } else {
    paint(ctx, "darkwood"); fbox(ctx, f0, -DOOR, DOOR, 0.12, DOORH, 0, 0.05);
    paint(ctx, "bronze"); orb(ctx, ...at(f0, DOOR - 0.2, 1.1, 0.09), 0.05, 0.05, 0.05, 5, 3);
  }
  paint(ctx, "lanternglow"); orb(ctx, ...at(f0, DOOR + 0.55, 2.0, 0.25), 0.14, 0.19, 0.14, 6, 3);
  // roof + chimney
  const { yR, s } = roofShell(ctx, D, lod <= 2);
  if (kind === "tavern" || kind === "bakery" || kind === "home" || ctx.random() < 0.55) {
    const cx = ew * 0.5 * (ctx.random() < 0.5 ? -1 : 1), cz = ed * 0.35, ytop = yR - cz * s + 1.1;
    paint(ctx, "stone"); box(ctx, cx - 0.42, top - 0.6, cz - 0.42, cx + 0.42, ytop, cz + 0.42, "b"); box(ctx, cx - 0.52, ytop, cz - 0.52, cx + 0.52, ytop + 0.14, cz + 0.52);
  }
  if (kind && lod <= 2) for (const it of interior(D)) drawItem(ctx, it, false);
}
export function collider(ctx) {
  const D = dims(ctx.params), { w, d, F, top, ew, ed, kind } = D;
  if (!kind) { box(ctx, -w / 2, 0, -d / 2, w / 2, top, d / 2, "b"); return; }
  shell(ctx, w, d);
  if (F > 1) box(ctx, -ew, H, -ed, ew, top, ed); else box(ctx, -w / 2, H, -d / 2, w / 2, H + 0.1, d / 2);
  for (const it of interior(D)) drawItem(ctx, it, true);
}
