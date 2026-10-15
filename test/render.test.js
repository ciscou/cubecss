// Rendering checks that need no browser.
//
// 1. Ray-casts the cube with all 6 faces on every shell piece (the original rendering)
// versus the faces the code really keeps in the DOM (lazy faces + backface culling),
// at several moments of several animated turns, from several camera angles.
const assert = require("assert");
const { load, make, run, hooks, DOMMatrix } = require("./harness");
const Cube = load();

const sub = (a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cross = (a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot = (a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const norm = a => { const l = Math.hypot(...a); return a.map(v=>v/l); };

function parseMatrix(str) {
  const nums = str.match(/matrix3d\(([^)]*)\)/)[1].split(",").map(Number);
  return new DOMMatrix(nums);
}
function T(x,y,z){ return new DOMMatrix([1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]); }
function faceMatrix(str, size) { // CSS transform list -> matrix in cubie units
  let M = new DOMMatrix();
  const re = /(translate[XYZ]|rotate[XYZ])\(([-\d.e]+)(px|deg)\)/g; let t;
  while ((t = re.exec(str))) {
    const v = parseFloat(t[2]), k = t[1];
    if (k.startsWith("translate")) { const a = v / size; M = M.multiply(T(k.endsWith("X")?a:0, k.endsWith("Y")?a:0, k.endsWith("Z")?a:0)); }
    else M = M.multiply(new DOMMatrix().rotateAxisAngle(k.endsWith("X")?1:0, k.endsWith("Y")?1:0, k.endsWith("Z")?1:0, v));
  }
  return M;
}
const pt = (M, p) => { const q = M.transformPoint({ x: p[0], y: p[1], z: p[2] }); return [q.x, q.y, q.z]; };

// transforms of a face of each kind, from a cube that keeps all faces
const probe = make(Cube, 3, { lazyFaces: false, hideBackfaces: false });
const probePiece = Object.values(probe.cubies)[0];
const SIZE = 50;
const FACE_T = {};
Object.entries(probePiece.faces).forEach(([n, f]) => FACE_T[n] = f.style.transform);
const FACES = Object.keys(FACE_T);

// quads (corner list + facing info) for a piece, given its current matrix M and a face name
function quad(c, name, M, size, culled) {
  const Mf = faceMatrix(FACE_T[name], 100); // probe cube: 3 layers -> 100px cubies
  const h = 0.5, C = [c.x, c.y, c.z];
  const local = [[-h,-h,0],[h,-h,0],[h,h,0],[-h,h,0]].map(p => { const q = pt(Mf, p); return [C[0]+q[0], C[1]+q[1], C[2]+q[2]]; });
  const corners = local.map(p => pt(M, p));
  const n = pt(M, (() => { const o = pt(Mf, [0,0,1]), z = pt(Mf, [0,0,0]); return sub(o, z); })());
  const zero = pt(M, [0,0,0]);
  return { corners, normal: sub(n, zero), culled, color: c.stickers[name] ? c.stickers[name].style.backgroundColor : null };
}

function hit(quads, o, d) {
  let best = null;
  for (const q of quads) {
    if (q.culled && dot(q.normal, d) >= 0) continue; // seen from behind
    const [P0,P1,P2,P3] = q.corners;
    for (const [A,B,Cc,mode] of [[P0,P1,P2,1],[P0,P2,P3,2]]) {
      const e1 = sub(B,A), e2 = sub(Cc,A), p = cross(d,e2), det = dot(e1,p);
      if (Math.abs(det) < 1e-12) continue;
      const inv = 1/det, s = sub(o,A), w1 = dot(s,p)*inv; if (w1 < -1e-9 || w1 > 1+1e-9) continue;
      const qv = cross(s,e1), w2 = dot(d,qv)*inv; if (w2 < -1e-9 || w1+w2 > 1+1e-9) continue;
      const t = dot(e2,qv)*inv; if (t <= 1e-9) continue;
      if (best === null || t < best.t - 1e-9) {
        const a = mode === 1 ? w1 + w2 : w1, b = mode === 1 ? w2 : w1 + w2;
        const inner = Math.abs(a-0.5) <= 0.45 && Math.abs(b-0.5) <= 0.45;
        best = { t, color: inner && q.color ? q.color : "black" };
      }
    }
  }
  return best ? best.color : "none";
}

function cameraRays(N, yaw, pitch, R) {
  const D = 3.2 * N, cp = Math.cos(pitch), fwd = norm([-Math.sin(yaw)*cp, Math.sin(pitch), -Math.cos(yaw)*cp].map(v => -v));
  // eye looks at the origin from direction -fwd
  const eye = fwd.map(v => -v * D);
  let right = norm(cross(fwd, [0,1,0])); const up = norm(cross(right, fwd)); const a = (N*0.95)/D;
  const rays = [];
  for (let i = 0; i < R; i++) for (let j = 0; j < R; j++) {
    const u = (i/(R-1))*2-1, v = (j/(R-1))*2-1;
    rays.push({ o: eye, d: norm(fwd.map((f,k) => f + right[k]*u*a + up[k]*v*a)) });
  }
  return rays;
}

let seed = 4242; const rnd = n => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n;

async function scenario(N, prelude, turn) {
  hooks.manual = true; hooks.log.length = 0;
  const c = make(Cube, N);
  run(c, prelude);                         // scramble (not animated)
  hooks.log.length = 0;
  c[turn]();                               // animated
  await new Promise(r => setTimeout(r, 30));
  const recs = hooks.log.slice();
  assert(recs.length > 0, "no animation recorded for " + turn);

  const whole = recs.length === 1 && recs[0].el === c.el;
  const byEl = new Map(recs.map(r => [r.el, r]));
  const pieces = Object.values(c.cubies);

  const pose = (p, t) => { // matrix of a piece at fraction t of the animation
    if (whole) { const m = /rotate([XYZ])\((-?[\d.]+)deg\)/.exec(recs[0].kf[1].transform); const ax = {X:[1,0,0],Y:[0,1,0],Z:[0,0,1]}[m[1]];
      return new DOMMatrix().rotateAxisAngle(...ax, parseFloat(m[2])*t).multiply(p.m); }
    const r = byEl.get(p.el); if (!r) return p.m;
    const m = /rotate([XYZ])\((-?[\d.]+)deg\) (matrix3d\([^)]*\))/.exec(r.kf[1].transform); const ax = {X:[1,0,0],Y:[0,1,0],Z:[0,0,1]}[m[1]];
    return new DOMMatrix().rotateAxisAngle(...ax, parseFloat(m[2])*t).multiply(parseMatrix(m[3]));
  };

  let bad = 0, total = 0, faces = 0;
  pieces.forEach(p => faces += Object.keys(p.faces).length);
  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    const full = [], reduced = [];
    for (const p of pieces) {
      const M = pose(p, t);
      for (const n of FACES) full.push(quad(p, n, M, 1, false));
      for (const n of Object.keys(p.faces)) {
        const f = p.faces[n]; reduced.push(quad(p, n, M, 1, !!f.style.backfaceVisibility));
      }
    }
    for (const [yaw, pitch] of [[0.6,0.35],[-2.4,0.5],[3.0,-0.4],[1.5,1.0],[0.0,-1.2]]) {
      for (const { o, d } of cameraRays(N, yaw, pitch, 36)) {
        total++;
        if (hit(full, o, d) !== hit(reduced, o, d)) bad++;
      }
    }
  }
  recs.forEach(r => r.release());
  await new Promise(r => setTimeout(r, 30));
  hooks.manual = false;
  return { bad, total, faces, c };
}

(async () => {
  const moveSets = { 3: ["r","u","2u","uw","m","x","f","d2","bi","e"], 4: ["r","2r","3uw","2uw","x","y","l","2f","bw"], 6: ["r","3u","2rw","4lw","z","f","bi","3bw"] };
  let worst = 0;
  for (const N of [3, 4, 6]) {
    const all = ["u","d","l","r","f","b"];
    for (let k = 0; k < (N === 6 ? 4 : 5); k++) {
      const prelude = Array.from({ length: 6 }, () => all[rnd(6)] + ["", "i", "2"][rnd(3)]);
      const turn = moveSets[N][rnd(moveSets[N].length)] + ["", "i"][rnd(2)];
      const { bad, total, faces } = await scenario(N, prelude, turn);
      worst = Math.max(worst, bad);
      console.log(`N=${N} after [${prelude.join(" ")}] turn ${turn}: ${bad}/${total} differing rays, ${faces} faces at rest`);
      assert.strictEqual(bad, 0, `holes/mismatch N=${N} ${turn}`);
    }
  }
  const scramble = ["r","u","fi","l2","d","b","ri","u2"];
  const cases = [[3, ["x","y","z","e","s","m"]], [4, ["x","z","2l","3r","2bw"]], [6, ["x","y","2u","3r","4f","2uw","3rw","4lw","5dw","bi","l2"]]];
  for (const [N, turns] of cases) for (const turn of turns) {
    const { bad, total } = await scenario(N, scramble, turn);
    console.log(`N=${N} turn ${turn}: ${bad}/${total} differing rays`);
    assert.strictEqual(bad, 0, `holes/mismatch N=${N} ${turn}`);
  }

  // faces at rest are exactly the needed ones after any sequence (animated path included)
  {
    const all = ["u","d","l","r","f","b","2u","3r","uw","x","z"], sfx = ["", "i", "2"];
    for (const N of [3, 4, 6]) {
      const c = make(Cube, N); hooks.manual = false;
      const seq = Array.from({ length: 25 }, () => all[rnd(all.length)].replace(/^(\d)?(.*)$/, (m, d, r) => (d && +d >= N ? "" : d || "") + r) + sfx[rnd(3)]);
      c.pause(); c.play();
      for (const m of seq) { if (c[m]) c[m](); }
      await new Promise(r => setTimeout(r, 400));
      const ref = make(Cube, N, { lazyFaces: false }); run(ref, seq.filter(m => ref[m]));
      for (const [n, p] of Object.entries(c.cubies)) {
        assert.deepStrictEqual(p.m.toString(), ref.cubies[n].m.toString(), "pose " + n);
        const want = Object.keys(p.faces).sort();
        assert.strictEqual(new Set(want).size, want.length);
        Object.keys(p.stickers).forEach(k => assert(p.faces[k], "sticker face kept"));
      }
      console.log(`N=${N}: ${seq.length} animated moves -> same poses as the eager cube, stickers intact`);
    }
  }

  // face counts
  for (const N of [2, 3, 4, 5, 6, 8]) {
    const lazy = Object.values(make(Cube, N).cubies).reduce((s, p) => s + Object.keys(p.faces).length, 0);
    const eager = Object.values(make(Cube, N, { lazyFaces: false }).cubies).reduce((s, p) => s + Object.keys(p.faces).length, 0);
    console.log(`N=${N}: ${eager} faces -> ${lazy} faces (${(eager/lazy).toFixed(1)}x fewer)`);
  }
  
  // 2. Where the single element of each cubie ends up: the box is centered on the cube and
  //    `matrix(rotation) translate(offset)` is the same as turning the piece about the cube's center.
  {
    const num = "([-\\d.e]+)";
    const tr = str => new RegExp("translate3d\\(" + num + "px, " + num + "px, " + num + "px\\)").exec(str).slice(1, 4).map(Number);
    const add = (a, b) => a.map((v, i) => v + b[i]), minus = (a, b) => a.map((v, i) => v - b[i]);
    for (const N of [2, 3, 4, 6]) {
      const c = make(Cube, N), size = Math.floor(600 / (2 * N)), C = (N - 1) / 2, O = [N*size/2, N*size/2, 0];
      run(c, "r u fi 2r uw x l2 d bi z".split(" ").filter(m => c[m]));
      for (const [name, p] of Object.entries(c.cubies)) {
        const left = parseFloat(p.el.style.left), top = parseFloat(p.el.style.top);
        const ec = [left + size/2, top + size/2, 0];
        assert.deepStrictEqual(ec, O, `box of ${name} is not centered on the cube (N=${N})`);
        const M = parseMatrix(p.el.style.transform);
        const world = add(ec, pt(M, tr(p.el.style.transform)));
        // a piece built at layer indices (x, y, z) sits at ((x + .5) * size, (y + .5) * size, (z - C) * size)
        const cell = [(p.coords.x + 0.5) * size, (p.coords.y + 0.5) * size, (p.coords.z - C) * size];
        const expected = add(O, pt(M, minus(cell, O)));
        world.forEach((v, i) => assert(Math.abs(v - expected[i]) < 1e-6, `${name} N=${N}: ${world} vs ${expected}`));
        assert(p.el.children.every(f => f.classes.includes("face")), "only faces inside a cubie");
      }
      console.log(`N=${N}: ${Object.keys(c.cubies).length} cubies are where a container-plus-cubie pair would put them`);
    }
  }

  console.log("render: all tests passed");
})().catch(e => { console.error(e); process.exit(1); });
