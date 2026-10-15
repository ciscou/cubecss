// Moves: names, inverses, wide/slice notation, algorithms, queue.
const assert = require("assert");
const { load, make, state, run, hooks } = require("./harness");
const Cube = load();

const ID = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
const allId = c => Object.values(c.cubies).every(p => p.m.a.every((v, i) => v === ID[i]));
const ok = m => console.log("ok -", m);
// objects made inside the fake browser live in another realm: compare them as plain data
const plain = x => JSON.parse(JSON.stringify(x));
const same = (a, b, msg) => assert.deepStrictEqual(plain(a), plain(b), msg);
const differ = (a, b, msg) => assert.notDeepStrictEqual(plain(a), plain(b), msg);
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  // piece counts and unique names
  for (const n of [2, 3, 4, 5, 6, 10]) {
    const names = Object.keys(make(Cube, n).cubies);
    assert.strictEqual(new Set(names).size, names.length);
    assert.strictEqual(names.length, n ** 3 - Math.max(0, n - 2) ** 3);
  }
  ok("2..10 layers: only the shell is built, names are unique");

  // the 4x4x4 keeps the names it had before being generalized
  {
    const legacy = "ULB UL1 UL2 ULF LB1 L1 L2 LF1 LB2 L3 L4 LF2 DLB DL1 DL2 DLF UB1 U1 U3 UF1 B3 F1 B1 F3 DB1 D3 D1 DF1 UB2 U2 U4 UF2 B4 F2 B2 F4 DB2 D4 D2 DF2 URB UR1 UR2 URF RB1 R1 R2 RF1 RB2 R3 R4 RF2 DRB DR1 DR2 DRF".split(" ");
    same(Object.keys(make(Cube, 4).cubies).sort(), legacy.sort());
    ok("4x4 piece names are the legacy ones");
  }

  // inverses, quarter turns, sexy move
  for (const n of [2, 3, 4, 5]) {
    for (const f of ["u", "d", "l", "r", "f", "b"]) {
      let c = make(Cube, n); run(c, [f, f + "i"]);       assert(allId(c), `${f} ${f}' n=${n}`);
      c = make(Cube, n);     run(c, [f, f, f, f]);       assert(allId(c), `${f}^4 n=${n}`);
      c = make(Cube, n);     run(c, [f + "2", f + "2"]); assert(allId(c), `${f}2 ${f}2 n=${n}`);
    }
    const c = make(Cube, n); run(c, Array(6).fill(["r", "u", "ri", "ui"]).flat());
    assert(allId(c), `sexy^6 n=${n}`);
  }
  ok("inverses, 4 quarter turns and (R U R' U')x6 give identity on 2..5");

  // wide moves, slices and whole-cube turns are combinations of single layers
  for (const n of [3, 4, 5]) {
    const eq = (a, b, msg) => {
      const x = make(Cube, n), y = make(Cube, n); run(x, a); run(y, b);
      same(state(x), state(y), `n=${n} ${msg}`);
    };
    const slices = f => Array.from({ length: n - 2 }, (_, i) => (i + 2) + f);
    const opposite = { r: "l", l: "r", u: "d", d: "u", f: "b", b: "f" };
    for (const f of ["u", "d", "l", "r", "f", "b"]) {
      for (let k = 2; k < n; k++) {
        const parts = [f, ...slices(f).slice(0, k - 1)];
        eq([k + f + "w"], parts, `${k}${f}w = ${parts.join(" + ")}`);
      }
      const whole = { r: "x", u: "y", f: "z" }[f];
      if (whole) eq([whole], [f, ...slices(f), opposite[f] + "i"], `${whole} = ${f} + slices + ${opposite[f]}'`);
    }
    if (n === 3) {
      eq(["m"], ["2l"], "m = 2l"); eq(["e"], ["2d"], "e = 2d"); eq(["s"], ["2f"], "s = 2f");
      eq(["uw"], ["u", "ei"], "uw = u + e'");
    }
    if (n === 5) eq(["m"], ["3l"], "m = 3l");
  }
  ok("wide moves, slices and x/y/z are consistent (3..5)");

  // the T-perm only swaps UFR<->URB and UL<->UR: checks every sign of R, U and F
  {
    const c = make(Cube, 3), before = c.pieces();
    run(c, "r u ri ui ri f r2 ui ri ui r u ri fi".split(" "));
    const after = c.pieces();
    const moved = Object.keys(after).filter(n => after[n].position.join() !== before[n].position.join()).sort();
    same(moved, ["UL", "UR", "URB", "URF"]);
    same(after.URF.position, before.URB.position);
    same(after.UL.position, before.UR.position);
    ok("T-perm swaps exactly UFR<->URB and UL<->UR");
  }

  // 2x2, 4x4 and 5x5 have the right move sets
  {
    const has = (c, ms) => ms.every(m => typeof c[m] === "function");
    assert(has(make(Cube, 3), ["u", "uw", "2u", "x", "m", "e", "s"]));
    assert(has(make(Cube, 4), ["2u", "2uw", "3uw", "3rw", "uw", "x"]) && !make(Cube, 4).m);
    assert(has(make(Cube, 5), ["m", "3u", "4uw", "2rw"]));
    assert(has(make(Cube, 2), ["u", "x", "uw", "rw", "fw", "dw", "lw", "bw"]) && !make(Cube, 2).m && !make(Cube, 2)["2u"]);
    ok("move sets per size");

    // on a 2x2x2, "uw" (2 layers) is the whole cube
    const eq = (a, b) => { const x = make(Cube, 2), y = make(Cube, 2); run(x, a); run(y, b); same(state(x), state(y), a + " vs " + b); };
    eq(["uw"], ["y"]); eq(["rw"], ["x"]); eq(["fw"], ["z"]); eq(["dw"], ["yi"]); eq(["lw"], ["xi"]); eq(["bw"], ["zi"]);
    ok("2x2x2: uw/rw/fw/dw/lw/bw turn the whole cube");
  }

  // animated queue: play, events, pause, undo
  {
    const c = make(Cube, 4), events = [];
    c.on("turning", () => events.push("turning")); c.on("finish", () => events.push("finish"));
    c.r(); c.u(); c["2ri"](); c["3uw"](); c.x();
    await sleep(100);
    assert.strictEqual(c.idx(), 5);
    assert.strictEqual(events.filter(e => e === "turning").length, 5);
    assert(events.includes("finish"));
    c.pause();
    for (let i = 0; i < 5; i++) { c.undo(); await sleep(30); }
    assert.strictEqual(c.idx(), 0);
    assert(allId(c));
    ok("animated queue: play, pause, undo back to the start (incl. whole-cube turn)");
  }

  // timing: the old CSS-shorthand `transition` option still works
  {
    const timing = async extra => {
      hooks.manual = true; hooks.log.length = 0;
      const c = make(Cube, 3, extra); c.r(); await sleep(20);
      const o = hooks.log[0].opts; hooks.log.forEach(r => r.release()); hooks.manual = false; await sleep(5);
      return [o.duration, o.delay, o.easing];
    };
    same(await timing({}), [350, 150, "ease-out"]);
    same(await timing({ transition: "transform 350ms ease-out 150ms" }), [350, 150, "ease-out"]);
    same(await timing({ transition: "transform 200ms linear 50ms" }), [200, 50, "linear"]);
    same(await timing({ transition: "transform 0.5s ease-in 0.25s" }), [500, 250, "ease-in"]);
    same(await timing({ transition: "all 1s" }), [1000, 0, "ease"]);
    same(await timing({ transition: "transform 300ms cubic-bezier(0.1, 0.7, 1, 0.1)" }), [300, 0, "cubic-bezier(0.1, 0.7, 1, 0.1)"]);
    same(await timing({ transition: "none" }), [0, 0, "ease"]);
    same(await timing({ transition: "transform 200ms linear 50ms", duration: 99 }), [99, 50, "linear"]);
    same(await timing({ delay: 0 }), [350, 0, "ease-out"]);
    ok("duration / delay / easing options and the legacy transition shorthand");
  }

  // cubieSize may arrive as a string (query string)
  {
    const c = make(Cube, 3, { cubieSize: "30" });
    assert.strictEqual(c.cubies.URF.el.style.width, "30px");
    ok("cubieSize as a string");
  }

  console.log("moves: all tests passed");
})().catch(e => { console.error(e); process.exit(1); });
