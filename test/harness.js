// Minimal DOM / DOMMatrix shims so cubecss.js can run in node, without a browser.
// `hooks.manual = true` makes element.animate() calls wait until `rec.release()`;
// every call is recorded in `hooks.log`.
const vm = require("vm"), fs = require("fs"), path = require("path");

class DOMPoint { constructor(x=0,y=0,z=0,w=1){ this.x=x; this.y=y; this.z=z; this.w=w; } }

class DOMMatrix {
  constructor(a) {
    this.a = a && a.length === 16 ? a.slice() : [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; // column-major
  }
  get m11(){return this.a[0]} get m12(){return this.a[1]} get m13(){return this.a[2]}  get m14(){return this.a[3]}
  get m21(){return this.a[4]} get m22(){return this.a[5]} get m23(){return this.a[6]}  get m24(){return this.a[7]}
  get m31(){return this.a[8]} get m32(){return this.a[9]} get m33(){return this.a[10]} get m34(){return this.a[11]}
  get m41(){return this.a[12]} get m42(){return this.a[13]} get m43(){return this.a[14]} get m44(){return this.a[15]}
  multiply(o) { // this x o
    const A = this.a, B = o.a, C = new Array(16).fill(0);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++) C[c*4+r] += A[k*4+r] * B[c*4+k];
    return new DOMMatrix(C);
  }
  rotateAxisAngle(x, y, z, deg) {
    const n = Math.hypot(x,y,z); x/=n; y/=n; z/=n;
    const t = deg*Math.PI/180, c = Math.cos(t), s = Math.sin(t), u = 1-c;
    const R = [[u*x*x+c, u*x*y-s*z, u*x*z+s*y],[u*x*y+s*z, u*y*y+c, u*y*z-s*x],[u*x*z-s*y, u*y*z+s*x, u*z*z+c]];
    const M = new DOMMatrix([R[0][0],R[1][0],R[2][0],0, R[0][1],R[1][1],R[2][1],0, R[0][2],R[1][2],R[2][2],0, 0,0,0,1]);
    return this.multiply(M);
  }
  transformPoint(p) {
    const a = this.a;
    return new DOMPoint(a[0]*p.x+a[4]*p.y+a[8]*p.z+a[12], a[1]*p.x+a[5]*p.y+a[9]*p.z+a[13], a[2]*p.x+a[6]*p.y+a[10]*p.z+a[14]);
  }
  toString() { return "matrix3d(" + this.a.join(", ") + ")"; }
}

const hooks = { manual: false, log: [] };

function el(tag) {
  const e = { tag, style: {}, classes: [], children: [],
    classList: { add: c => e.classes.push(c) },
    appendChild(c) { e.children.push(c); return c; },
    addEventListener() {},
    removeChild(c) { const i = e.children.indexOf(c); if (i >= 0) e.children.splice(i, 1); return c; },
    animate(kf, opts) {
      const rec = { el: e, kf, opts, cancelled: false };
      rec.finished = new Promise(r => { rec.release = r; });
      if (!hooks.manual) rec.release();
      hooks.log.push(rec);
      return { finished: rec.finished, cancel() { rec.cancelled = true; } };
    } };
  const desc = (root, out=[]) => { root.children.forEach(c => { out.push(c); desc(c, out); }); return out; };
  const matches = (n, part) => part.split(".").filter(Boolean).every(c => n.classes.includes(c));
  e.querySelectorAll = sel => {
    let cur = [e];
    sel.split(" ").forEach(part => {
      const next = [];
      cur.forEach(r => desc(r).forEach(d => { if (matches(d, part) && !next.includes(d)) next.push(d); }));
      cur = next;
    });
    return cur;
  };
  e.querySelector = sel => e.querySelectorAll(sel)[0] || null;
  return e;
}

// Loads cubecss.js (or the file in $CUBECSS) into a fake browser and returns CubeCSS.
function load(file) {
  file = file || path.resolve(__dirname, process.env.CUBECSS || "../js/cuben.js");
  const ctx = { DOMMatrix, DOMPoint, document: { createElement: el }, setTimeout, Promise, console };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, "utf8"), ctx);
  return ctx.CubeCSS;
}

function make(CubeCSS, layers, extra) {
  const container = el("div"); container.offsetWidth = 600;
  return new CubeCSS(Object.assign({ container }, layers ? { layers } : {}, extra || {}));
}

const state = cube => Object.entries(cube.cubies).map(([n, c]) => [n, c.m.toString()]);
const run = (cube, seq) => cube.withoutAnimation(() => seq.forEach(m => cube[m]()));

module.exports = { load, make, state, run, hooks, DOMMatrix, DOMPoint, el };
