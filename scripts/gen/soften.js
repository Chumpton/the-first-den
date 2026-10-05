// Softens any geometry script without touching its shapes: every face it emits is recorded, and on return the
// lighting normals are rebuilt: foliage (green-dominant faces) swells out from the centre of the leaf mass it
// belongs to, so canopies, hedges and bushes light as soft pillows; smooth faces stay smooth; flat stay flat.
// Wrap: export const geometry = softened(function (ctx) { ... });
const parseHex = (s) => { if (typeof s !== "string" || s[0] !== "#") return null; let h = s.slice(1); if (h.length === 3) h = [...h].map((c) => c + c).join(""); const n = parseInt(h.slice(0, 6), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };
function parseColor(s) {
  if (typeof s !== "string") return null;
  const m = s.match(/oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/);
  if (m) { const L = Number(m[1]) / (m[2] ? 100 : 1), C = Number(m[3]), H = Number(m[4]); return { L, C, H }; }
  const c = parseHex(s); return c ? { rgb: c } : null;
}
const leafyAny = (c) => !c ? false : c.rgb ? leafy(c.rgb) : (c.C > 0.04 && c.H >= 105 && c.H <= 165 && c.L > 0.2);
const leafy = (c) => c && c[1] > c[0] * 1.08 && c[1] > c[2] * 1.05 && c[1] > 0.12;
const MAXRUN = 7; // metres: a leaf mass wider than this starts a new mass
export function softened(geometry) {
  return function (ctx) {
    const faces = []; let mode = "flat", col = null, run = null;
    const real = { tri: ctx.tri.bind(ctx), smooth: ctx.smooth.bind(ctx), flat: ctx.flat.bind(ctx), color: ctx.color.bind(ctx) };
    const over = {};
    const proxy = new Proxy(ctx, { get(t, k) { if (k in over) return over[k]; const v = t[k]; return typeof v === "function" ? v.bind(t) : v; } });
    over.color = (...a) => { col = a.length >= 3 && typeof a[0] === "number" ? { rgb: [a[0], a[1], a[2]] } : parseColor(a[0]); return real.color(...a); };
    over.smooth = () => { mode = "smooth"; return real.smooth(); };
    over.flat = () => { mode = "flat"; return real.flat(); };
    const emit = (a, b, c) => {
      real.tri(...a, ...b, ...c);
      let kind = mode, mass = null;
      if (leafyAny(col)) {
        const cx = (a[0] + b[0] + c[0]) / 3, cy = (a[1] + b[1] + c[1]) / 3, cz = (a[2] + b[2] + c[2]) / 3;
        if (!run || Math.hypot(cx - run.o[0], cy - run.o[1], cz - run.o[2]) > MAXRUN) run = { o: [cx, cy, cz], s: [0, 0, 0], n: 0 };
        run.s[0] += cx; run.s[1] += cy; run.s[2] += cz; run.n++; kind = "leaf"; mass = run;
      } else run = null;
      faces.push({ v: [a, b, c], kind, mass });
    };
    over.tri = (ax, ay, az, bx, by, bz, cx, cy, cz) => emit([ax, ay, az], [bx, by, bz], [cx, cy, cz]);
    over.quad = (ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz) => { emit([ax, ay, az], [bx, by, bz], [cx, cy, cz]); emit([ax, ay, az], [cx, cy, cz], [dx, dy, dz]); };
    const out = geometry(proxy) || {};
    if (out.normals || out.uvs) return out; // the script speaks its own normals / per-vertex rows: leave it whole
    const fn = (f) => { const [a, b, c] = f.v, u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]], l = Math.hypot(...n) || 1; return [n[0] / l, n[1] / l, n[2] / l]; };
    const key = (p) => p.map((x) => Math.round(x * 1000)).join(",");
    const acc = new Map();
    for (const f of faces) if (f.kind === "smooth") { const n = fn(f); for (const p of f.v) { const k = key(p), s = acc.get(k) || [0, 0, 0]; s[0] += n[0]; s[1] += n[1]; s[2] += n[2]; acc.set(k, s); } }
    const N = [];
    for (const f of faces) {
      if (f.kind === "flat") { const n = fn(f); N.push(...n, ...n, ...n); continue; }
      if (f.kind === "smooth") { for (const p of f.v) { const s = acc.get(key(p)), l = Math.hypot(...s) || 1; N.push(s[0] / l, s[1] / l, s[2] / l); } continue; }
      const m = f.mass, c = [m.s[0] / m.n, m.s[1] / m.n - 0.15, m.s[2] / m.n], fnn = fn(f);
      for (const p of f.v) { const d = [p[0] - c[0], p[1] - c[1], p[2] - c[2]], l = Math.hypot(...d) || 1;
        const v = [d[0] / l * 0.8 + fnn[0] * 0.2, d[1] / l * 0.8 + fnn[1] * 0.2, d[2] / l * 0.8 + fnn[2] * 0.2], k = Math.hypot(...v) || 1; N.push(v[0] / k, v[1] / k, v[2] / k); }
    }
    return { ...out, normals: N };
  };
}
