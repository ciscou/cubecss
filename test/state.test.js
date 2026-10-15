// State: facelets, isSolved, pieces, goTo, reset.
const assert = require("assert");
const { load, make, run, hooks } = require("./harness");
const Cube = load();

const ok = m => console.log("ok -", m);
// objects made inside the fake browser live in another realm: compare them as plain data
const plain = x => JSON.parse(JSON.stringify(x));
const same = (a, b, msg) => assert.deepStrictEqual(plain(a), plain(b), msg);
const differ = (a, b, msg) => assert.notDeepStrictEqual(plain(a), plain(b), msg);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const solved = n => ["U", "R", "F", "D", "L", "B"].map(l => l.repeat(n * n)).join("");

(async () => {
  // facelets
  for (const n of [2, 3, 4, 5]) assert.strictEqual(make(Cube, n).facelets(), solved(n));
  ok("facelets of a solved cube, 2..5 layers");

  // the standard solver strings after a single move (Kociemba facelet order)
  const after = m => { const c = make(Cube, 3); run(c, [m]); return c.facelets(); };
  assert.strictEqual(after("r"), "UUFUUFUUF" + "RRRRRRRRR" + "FFDFFDFFD" + "DDBDDBDDB" + "LLLLLLLLL" + "UBBUBBUBB");
  assert.strictEqual(after("u"), "UUUUUUUUU" + "BBBRRRRRR" + "RRRFFFFFF" + "DDDDDDDDD" + "FFFLLLLLL" + "LLLBBBBBB");
  assert.strictEqual(after("f"), "UUUUUULLL" + "URRURRURR" + "FFFFFFFFF" + "RRRDDDDDD" + "LLDLLDLLD" + "BBBBBBBBB");
  ok("facelets after R, U and F match the standard strings");

  // every sticker is accounted for, for any size
  for (const n of [3, 4, 5]) {
    const c = make(Cube, n); run(c, "r u fi 2r 3uw l2 d b x ri".split(" ").filter(m => c[m]));
    const f = c.facelets();
    assert.strictEqual(f.length, 6 * n * n);
    for (const l of "URFDLB") assert.strictEqual(f.split(l).length - 1, n * n, `${l} count n=${n}`);
  }
  ok("a scrambled cube still has n*n stickers of each color");

  // isSolved
  {
    const c = make(Cube, 3);
    assert(c.isSolved());
    run(c, ["r"]);                               assert(!c.isSolved());
    run(c, ["ri"]);                              assert(c.isSolved());
    run(c, ["x", "y2", "zi"]);                   assert(c.isSolved(), "orientation does not matter");
    run(c, Array(6).fill(["r", "u", "ri", "ui"]).flat()); assert(c.isSolved());
    run(c, ["r", "u"]);                          assert(!c.isSolved());
    const big = make(Cube, 5); assert(big.isSolved()); run(big, ["3r"]); assert(!big.isSolved()); run(big, ["3ri"]); assert(big.isSolved());
    ok("isSolved");
  }

  // colors changed in the DOM (e.g. stickerless pieces) do not matter
  {
    const c = make(Cube, 3);
    Object.values(c.cubies.URF.stickers).forEach(s => s.style.backgroundColor = "gray");
    assert(c.isSolved()); assert.strictEqual(c.facelets(), solved(3));
    ok("isSolved and facelets ignore recolored (stickerless) pieces");
  }

  // pieces
  {
    const c = make(Cube, 3), p0 = c.pieces();
    same(p0.ULB.position, [0, 0, 0]);
    same(p0.DRF.position, [2, 2, 2]);
    same(p0.URF.rotation, [[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
    run(c, ["r"]);
    const p1 = c.pieces();
    const moved = Object.keys(p1).filter(n => p1[n].position.join() !== p0[n].position.join());
    assert.strictEqual(moved.length, 8);                         // 4 corners + 4 edges; the center only turns
    differ(p1.R.rotation, p0.R.rotation);
    same(p1.R.position, p0.R.position);
    ok("pieces(): positions and rotations");
  }

  // goTo / reset / length
  {
    const seq = "r u ri ui f d2 l bi 2u r2 uw ei".split(" ");
    const c = make(Cube, 3); run(c, seq);
    assert.strictEqual(c.idx(), seq.length); assert.strictEqual(c.length(), seq.length);
    c.pause();
    let turned = 0; c.on("turned", () => turned++);

    for (const k of [5, 0, 12, 3, 9, 99, 4]) {
      c.goTo(k);
      const want = Math.min(k, seq.length);
      assert.strictEqual(c.idx(), want, `idx after goTo(${k})`);
      const fresh = make(Cube, 3); run(fresh, seq.slice(0, want));
      same(c.pieces(), fresh.pieces(), `pieces after goTo(${k})`);
      assert.strictEqual(c.facelets(), fresh.facelets(), `facelets after goTo(${k})`);
    }
    assert.strictEqual(turned, 7);
    ok("goTo jumps forwards and backwards to the same state as replaying");

    // faces are kept in sync with the lazy-faces optimization
    const eager = make(Cube, 3, { lazyFaces: false }); run(eager, seq.slice(0, 4));
    c.goTo(4);
    Object.keys(c.cubies).forEach(n => {
      Object.keys(c.cubies[n].stickers).forEach(f => assert(c.cubies[n].faces[f], "sticker face present"));
      same(c.cubies[n].m.a, eager.cubies[n].m.a);
    });

    c.goTo(seq.length); c.reset();
    assert.strictEqual(c.idx(), 0); assert.strictEqual(c.length(), 0);
    assert(c.isSolved()); assert.strictEqual(c.facelets(), solved(3));
    c.play(); run(c, ["r"]);                            // the cube was paused: play to run new moves
    assert.strictEqual(c.length(), 1); assert(!c.isSolved());
    ok("reset: solved cube, empty queue, still usable");
  }

  // goTo while playing carries on to the end; it is ignored while a turn animates
  {
    const seq = "r u f".split(" ");
    const c = make(Cube, 3); run(c, seq);                  // playing = true, queue exhausted
    const full = c.facelets();
    c.goTo(1);                                             // jumps, then plays on
    await sleep(100);
    assert.strictEqual(c.idx(), 3); assert.strictEqual(c.facelets(), full);

    hooks.manual = true; hooks.log.length = 0;
    const d = make(Cube, 3); d.r();
    await sleep(20);
    assert(d.turning());
    d.goTo(0); d.reset();                                  // ignored: a turn is in flight
    assert.strictEqual(d.idx(), 1); assert.strictEqual(d.length(), 1);
    hooks.log.forEach(r => r.release()); hooks.manual = false;
    await sleep(20);
    assert(!d.turning()); assert(!d.isSolved());
    ok("goTo resumes playback; goTo/reset are ignored mid-turn");
  }

  console.log("state: all tests passed");
})().catch(e => { console.error(e); process.exit(1); });
