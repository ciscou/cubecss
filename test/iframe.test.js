// iframe.js on a page with the query strings iframes use (the library under test is ../cubecss.js).
const assert = require("assert");
const { load, make, page, run, hooks } = require("./harness");
const Cube = load();

const ok = m => console.log("ok -", m);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const GRAY = "#777";
const VECTOR = { up: [0, -1, 0], down: [0, 1, 0], right: [1, 0, 0], left: [-1, 0, 0], front: [0, 0, 1], back: [0, 0, -1] };

// [cubie name, face, count of gray stickers] for every gray sticker of a cube
const grays = cube => Object.entries(cube.cubies).flatMap(([n, c]) =>
  Object.entries(c.stickers).filter(([, s]) => s.style.backgroundColor === GRAY).map(([f]) => [n, f]));
// the direction (in the world) a sticker of piece `n` looks at
const looks = (cube, n, face) => { const R = cube.pieces()[n].rotation, v = VECTOR[face]; return Array.from(R, row => row[0]*v[0] + row[1]*v[1] + row[2]*v[2]); };
const pos = (cube, n) => cube.pieces()[n].position.join();
// the cubie of a cube (by pieces(), not by cubieAt) that sits in `slot` once `moves` are done
const sitting = (layers, moves, slot) => { const c = make(Cube, layers); const h = c.pieces()[slot].position.join(); run(c, moves); return Object.entries(c.pieces()).find(([, p]) => p.position.join() === h)[0]; };

(async () => {
  // stickerless = positions after the preseq (the behavior of the old versions)
  {
    const { cubeCSS, logs } = page("?preseq=R,Ui,Ri&seq=R,U,Ri&stickerless=URF");
    const g = grays(cubeCSS);
    assert.strictEqual(g.length, 3);
    const names = [...new Set(g.map(([n]) => n))];
    assert.strictEqual(names.length, 1);
    assert.strictEqual(pos(cubeCSS, names[0]), "2,0,2");                              // it is in the URF position...
    assert.strictEqual(names[0], sitting(3, ["r", "ui", "ri"], "URF"));               // ...and it is what the preseq put there
    assert.notStrictEqual(names[0], "URF");                                           // not the piece that started there
    assert.deepStrictEqual(logs, []);
    ok("stickerless=URF marks whatever the preseq leaves in the URF position");
  }

  // &follow marks the pieces that start there instead
  {
    const { cubeCSS } = page("?preseq=R,Ui,Ri&seq=R,U,Ri&stickerless=URF&follow=1");
    const g = grays(cubeCSS);
    assert.strictEqual(g.length, 3);
    assert(g.every(([n]) => n === "URF"));
    assert.notStrictEqual(pos(cubeCSS, "URF"), "2,0,2");
    ok("&follow marks the piece that started in URF");
  }

  // without a preseq both agree
  {
    const a = grays(page("?seq=R&stickerless=URF,UL,D").cubeCSS), b = grays(page("?seq=R&stickerless=URF,UL,D&follow=1").cubeCSS);
    assert.deepStrictEqual(a, b);
    assert.strictEqual(a.length, 3 + 2 + 1);
    ok("without a preseq, positions and pieces are the same thing");
  }

  // one sticker: a position and the side it looks at
  for (const [face, letter] of [["up", "U"], ["right", "R"], ["front", "F"]]) {
    const { cubeCSS } = page(`?preseq=R,Ui,Ri&stickerless=URF${letter}`);
    const g = grays(cubeCSS);
    assert.strictEqual(g.length, 1);
    assert.strictEqual(pos(cubeCSS, g[0][0]), "2,0,2");
    assert.deepStrictEqual(looks(cubeCSS, g[0][0], g[0][1]), VECTOR[face], `URF${letter}`);

    const f = page(`?preseq=R,Ui,Ri&stickerless=URF${letter}&follow=1`).cubeCSS;
    assert.deepStrictEqual(grays(f), [["URF", face]]);
  }
  ok("URFU / URFR / URFF mark the sticker looking that way in that position (or on that piece with &follow)");

  // bigger cubes
  {
    const { cubeCSS, logs } = page("?layers=4&preseq=R,Ui,2R&stickerless=UL1,U1,URFD");
    const g = grays(cubeCSS);
    assert.strictEqual(g.length, 2 + 1);                                   // UL1 has 2 stickers, U1 has 1; URFD is invalid
    assert.deepStrictEqual([...new Set(g.map(([n]) => pos(cubeCSS, n)))].sort(), ["0,0,1", "1,0,1"]);
    assert.deepStrictEqual(logs, ["Invalid stickerless cubie URFD"]);
    ok("4 layers: legacy names and positions, invalid sticker reported");
  }

  // invalid names are reported, nothing throws
  {
    const { logs } = page("?stickerless=FOO,FU,URFD,&seq=R");
    assert.deepStrictEqual(logs, ["Invalid stickerless cubie FOO", "Invalid stickerless cubie FU", "Invalid stickerless cubie URFD", "Invalid stickerless cubie "]);
    ok("invalid stickerless names are logged");
  }

  // colors
  {
    const { cubeCSS } = page("?stickerless=U&clrx=" + encodeURIComponent("#123456") + "&clru=red");
    assert.strictEqual(cubeCSS.cubies.U.stickers.up.style.backgroundColor, "#123456");
    assert.strictEqual(cubeCSS.cubies.UF.stickers.up.style.backgroundColor, "red");
    ok("clr* and clrx");
  }

  // moves: notation as typed in URLs, on every size
  for (const [layers, seq] of [
    [2, "R,U,F,r,x,Ri,U2"],
    [3, "R,r,Rw,M,E,S,x,y,z,Ri,R2,R2i,r2,Uw,l,f,B',D"],
    [4, "2R,2r,3Rw,Uw,u,2U,3r,2Lw,x,R'"],
    [5, "R,2R,3R,3Rw,4Rw,M,x,Uw"]
  ]) {
    const { cubeCSS, logs } = page(`?layers=${layers}&seq=${seq}`);
    assert.deepStrictEqual(logs, [], `layers=${layers}`);
    assert.strictEqual(cubeCSS.length(), seq.split(",").length);
  }
  ok("move notation of the query string is understood on 2..5 layers");

  // seq / preseq special values
  {
    const a = page("?seq=scramble").cubeCSS, b = page("?preseq=scramble&seq=R").cubeCSS;
    assert.strictEqual(a.length(), 50);
    assert.strictEqual(b.length(), 51); assert.strictEqual(b.idx(), 50);
    const q = page("?seq=R,U,2R,Fi&layers=4&preseq=qes"); q.click("finish");
    assert(q.cubeCSS.isSolved());
    ok("scramble and qes");
  }

  // timing and sizes from the query string
  {
    const timing = async (qs) => {
      hooks.manual = true; hooks.log.length = 0;
      const p = page("?seq=R" + qs); p.click("step-forward"); await sleep(20);
      const o = hooks.log[0].opts; hooks.log.forEach(r => r.release()); hooks.manual = false; await sleep(5);
      return [o.duration, o.delay, o.easing];
    };
    assert.deepStrictEqual(await timing(""), [350, 150, "ease-out"]);
    assert.deepStrictEqual(await timing("&transition=" + encodeURIComponent("transform 200ms linear 50ms")), [200, 50, "linear"]);
    assert.deepStrictEqual(await timing("&transition=" + encodeURIComponent("transform 0.6s ease-in-out")), [600, 0, "ease-in-out"]);
    const p = page("?cs=30&layers=3"); assert.strictEqual(p.cubeCSS.cubies.URF.el.style.width, "30px");
    ok("transition and cs query parameters");
  }

  // the controls
  {
    const A = make(Cube, 3), B = make(Cube, 3);
    run(A, ["r", "ui"]); run(B, ["r", "ui", "r", "u", "ri", "ui"]);
    const p = page("?preseq=R,Ui&seq=R,U,Ri,Ui"), c = p.cubeCSS, shows = cls => p.button(cls).style.display;

    assert.strictEqual(c.idx(), 2); assert.strictEqual(c.length(), 6);
    assert.strictEqual(c.facelets(), A.facelets());

    p.click("finish");
    assert.strictEqual(c.idx(), 6); assert.strictEqual(c.facelets(), B.facelets());
    assert.strictEqual(shows("replay"), "inline"); assert.strictEqual(shows("play"), "none");

    p.click("reset");
    assert.strictEqual(c.idx(), 2); assert.strictEqual(c.facelets(), A.facelets());
    assert.strictEqual(shows("play"), "inline"); assert.strictEqual(shows("replay"), "none");

    p.click("step-backward");                                      // already at the start: nothing
    assert.strictEqual(c.idx(), 2);

    p.click("step-forward"); await sleep(60);
    assert.strictEqual(c.idx(), 3);
    const one = make(Cube, 3); run(one, ["r", "ui", "r"]);
    assert.strictEqual(c.facelets(), one.facelets());

    p.click("step-backward"); await sleep(60);
    assert.strictEqual(c.idx(), 2); assert.strictEqual(c.facelets(), A.facelets());

    p.click("play"); await sleep(300);
    assert.strictEqual(c.idx(), 6); assert.strictEqual(c.facelets(), B.facelets());
    assert.strictEqual(shows("replay"), "inline");

    p.click("replay"); await sleep(300);                           // back to the preseq state, then plays again
    assert.strictEqual(c.idx(), 6); assert.strictEqual(c.facelets(), B.facelets());
    ok("controls: finish, reset, step-backward/forward, play, replay");
  }

  console.log("iframe: all tests passed");
})().catch(e => { console.error(e); process.exit(1); });
