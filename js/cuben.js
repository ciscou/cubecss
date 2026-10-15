// TODO bring login from the iframe

(function() {
  var EventEmitter = function() {
    var listeners = {};

    this.on = function(event, callback) {
      listeners[event] ||= [];
      listeners[event].push(callback);
    };

    this.emit = function(event) {
      listeners[event] ||= [];
      listeners[event].forEach(function(callback) {
        callback();
      });
    };
  };

  // ---------------------------------------------------------------------------
  // Static tables
  // ---------------------------------------------------------------------------

  var FACE_NAMES = ["up", "down", "right", "left", "front", "back"];

  // Where each face lives on a cubie: translation along `axis` by `sign`
  // half cubies, plus the rotation needed to make it face outwards.
  // (CSS: x -> right, y -> down, z -> towards the viewer.)
  var FACE_PLACEMENT = {
    up:    { axis: "Y", sign: -1, rotate: "rotateX(90deg)"  },
    down:  { axis: "Y", sign:  1, rotate: "rotateX(-90deg)" },
    right: { axis: "X", sign:  1, rotate: "rotateY(90deg)"  },
    left:  { axis: "X", sign: -1, rotate: "rotateY(-90deg)" },
    front: { axis: "Z", sign:  1, rotate: ""                },
    back:  { axis: "Z", sign: -1, rotate: "rotateY(180deg)" } // flipped so its front side points outwards
  };

  // A cubie has a sticker on a face when it sits on that outer layer of the
  // cube: layer 0 (last: false) or layer LAYERS - 1 (last: true).
  var STICKER_AT = {
    left:  { coord: "x", last: false },
    right: { coord: "x", last: true  },
    up:    { coord: "y", last: false },
    down:  { coord: "y", last: true  },
    front: { coord: "z", last: true  },
    back:  { coord: "z", last: false }
  };

  // axis: CSS axis a face turns around.
  // sign: direction of +1 quarter turn; it is also the side of the cube the
  //       face is on (-1: layer 0, +1: last layer). In CSS Y points down, so U is -1.
  var FACES = {
    u: { axis: "y", sign: -1 },
    d: { axis: "y", sign:  1 },
    l: { axis: "x", sign: -1 },
    r: { axis: "x", sign:  1 },
    f: { axis: "z", sign:  1 },
    b: { axis: "z", sign: -1 }
  };

  var AXIS_VECTOR = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };

  // outward direction of each face of a cubie, and the reverse lookup
  var FACE_VECTOR = {
    up:    [ 0, -1,  0],
    down:  [ 0,  1,  0],
    right: [ 1,  0,  0],
    left:  [-1,  0,  0],
    front: [ 0,  0,  1],
    back:  [ 0,  0, -1]
  };
  var FACE_BY_VECTOR = {};
  FACE_NAMES.forEach(function(name) { FACE_BY_VECTOR[FACE_VECTOR[name].join(",")] = name; });

  // Facelet string (the format solvers use): faces in the order U R F D L B,
  // each one read row by row as seen from outside, with the cube unfolded as
  //
  //        U
  //      L F R B
  //        D
  var FACELET_FACES = ["up", "right", "front", "down", "left", "back"];
  var FACE_LETTER = { up: "U", right: "R", front: "F", down: "D", left: "L", back: "B" };

  // layer indices [x, y, z] of the cell at (row, col) of a face of an n x n x n cube
  var FACELET_CELL = {
    up:    function(row, col, n) { return [col,         0,       row        ]; },
    right: function(row, col, n) { return [n - 1,      row,     n - 1 - col]; },
    front: function(row, col, n) { return [col,        row,     n - 1      ]; },
    down:  function(row, col, n) { return [col,        n - 1,   n - 1 - row]; },
    left:  function(row, col, n) { return [0,          row,     col        ]; },
    back:  function(row, col, n) { return [n - 1 - col, row,    0          ]; }
  };

  // Names the 4x4x4 used before it was generalized (cubie index -> name,
  // where index = x * 16 + y * 4 + z). Other sizes get generated names.
  var LEGACY_NAMES_4 = {
     0: "ULB",  1: "UL1",  2: "UL2",  3: "ULF",  4: "LB1",  5: "L1",   6: "L2",   7: "LF1",
     8: "LB2",  9: "L3",  10: "L4",  11: "LF2", 12: "DLB", 13: "DL1", 14: "DL2", 15: "DLF",
    16: "UB1", 17: "U1",  18: "U3",  19: "UF1", 20: "B3",  23: "F1",  24: "B1",  27: "F3",
    28: "DB1", 29: "D3",  30: "D1",  31: "DF1",
    32: "UB2", 33: "U2",  34: "U4",  35: "UF2", 36: "B4",  39: "F2",  40: "B2",  43: "F4",
    44: "DB2", 45: "D4",  46: "D2",  47: "DF2",
    48: "URB", 49: "UR1", 50: "UR2", 51: "URF", 52: "RB1", 53: "R1",  54: "R2",  55: "RF1",
    56: "RB2", 57: "R3",  58: "R4",  59: "RF2", 60: "DRB", 61: "DR1", 62: "DR2", 63: "DRF"
  };

  // Rotation matrices only contain 0, 1 and -1: rounding avoids float drift.
  function snap(m) {
    var r = function(v) { return Math.round(v) + 0; }; // + 0 turns -0 into 0
    return new DOMMatrix([
      r(m.m11), r(m.m12), r(m.m13), 0,
      r(m.m21), r(m.m22), r(m.m23), 0,
      r(m.m31), r(m.m32), r(m.m33), 0,
      0, 0, 0, 1
    ]);
  }

  // Reads a CSS transition shorthand, e.g. "transform 350ms ease-out 150ms"
  // (what the `transition` option has always been), into duration, delay and easing.
  function parseTransition(str) {
    var out = { duration: 0, delay: 0, easing: "ease" };
    var times = [];

    (String(str).match(/(?:cubic-bezier|steps|linear)\([^)]*\)|\S+/g) || []).forEach(function(token) {
      var time = /^(-?[\d.]+)(ms|s)$/.exec(token);

      if(time) {
        times.push(parseFloat(time[1]) * (time[2] === "s" ? 1000 : 1));
      } else if(!/^(transform|all|none)$/.test(token)) {
        out.easing = token;
      }
    });

    if(times.length > 0) out.duration = times[0];
    if(times.length > 1) out.delay = times[1];

    return out;
  }

  // All the moves of an n x n x n cube.
  //
  //   u d l r f b     outer layer of a face
  //   2u 3u ...       only the 2nd, 3rd, ... layer counted from that face
  //   2uw 3uw ...     the first 2, 3, ... layers (uw is an alias of 2uw)
  //   x y z           the whole cube
  //   m e s           the middle slice (odd sizes only)
  //
  // `layers` are layer indices 0..n-1 along the move's axis.
  function buildMoves(n) {
    var moves = {};
    var all = [];
    for(var i=0; i<n; i++) all.push(i);

    // depths from..to (0-based) counted from the face
    function depths(sign, from, to) {
      var layers = [];
      for(var d=from; d<=to; d++) layers.push(sign < 0 ? d : n - 1 - d);
      return layers;
    }

    Object.keys(FACES).forEach(function(f) {
      var face = FACES[f];
      var move = function(layers) {
        return { axis: face.axis, sign: face.sign, layers: layers };
      };

      moves[f] = move(depths(face.sign, 0, 0));

      for(var k=2; k<n; k++) {
        moves[k + f]       = move(depths(face.sign, k - 1, k - 1));
        moves[k + f + "w"] = move(depths(face.sign, 0, k - 1));
      }

      // "uw" is 2 layers: the whole cube on a 2x2x2
      moves[f + "w"] = n > 2 ? moves["2" + f + "w"] : move(depths(face.sign, 0, 1));
    });

    moves.x = { axis: "x", sign:  1, layers: all };
    moves.y = { axis: "y", sign: -1, layers: all };
    moves.z = { axis: "z", sign:  1, layers: all };

    if(n % 2 === 1) {
      var mid = (n - 1) / 2;
      moves.m = { axis: "x", sign: -1, layers: [mid] };
      moves.e = { axis: "y", sign:  1, layers: [mid] };
      moves.s = { axis: "z", sign:  1, layers: [mid] };
    }

    return moves;
  }

  // ---------------------------------------------------------------------------
  // CubeCSS
  // ---------------------------------------------------------------------------

  function CubeCSS(options) {
    var ee = new EventEmitter();

    options ||= {};

    options.colorUp    ||= "#ffd500";
    options.colorDown  ||= "#ffffff";
    options.colorRight ||= "#b71234";
    options.colorLeft  ||= "#ff5800";
    options.colorFront ||= "#0046ad";
    options.colorBack  ||= "#009b48";

    options.colorPlastic ||= "black";

    var CONTAINER = options.container;

    var RX = -20;
    var RY = -20;
    var RZ = 0;

    if(options.hasOwnProperty("rx")) RX = parseInt(options.rx);
    if(options.hasOwnProperty("ry")) RY = parseInt(options.ry);
    if(options.hasOwnProperty("rz")) RZ = parseInt(options.rz);

    // Cube size: 2 (2x2x2), 3 (3x3x3), 4 (4x4x4), ...
    var LAYERS = parseInt(options.layers || 3, 10);
    if(!(LAYERS >= 2)) throw new Error("Invalid number of layers: " + options.layers);

    // Coordinates are centered on the middle of the cube, so they are half
    // integers for even sizes: layer index i sits at i - CENTER.
    var CENTER = (LAYERS - 1) / 2;

    var MOVES = buildMoves(LAYERS);

    options.cubieSize ||= Math.floor(CONTAINER.offsetWidth / (LAYERS * 2));
    options.cubieSize ||= 40;

    var COLOR_BY_FACE = {
      up: options.colorUp,
      down: options.colorDown,
      right: options.colorRight,
      left: options.colorLeft,
      front: options.colorFront,
      back: options.colorBack
    };

    var CUBIE_SIZE = parseFloat(options.cubieSize);

    // Height of the flex wrapper that centers the cube. Pass e.g.
    // `wrapperHeight: container.offsetWidth` for a square wrapper.
    options.wrapperHeight ||= CUBIE_SIZE * LAYERS * 1.75;

    // Timing of a turn. `transition` (a CSS shorthand) is still understood.
    if(options.transition !== undefined && options.transition !== null) {
      var transition = parseTransition(options.transition);

      if(options.duration === undefined) options.duration = transition.duration;
      if(options.delay    === undefined) options.delay    = transition.delay;
      if(options.easing   === undefined) options.easing   = transition.easing;
    }

    if(options.duration === undefined) options.duration = 350;
    if(options.delay    === undefined) options.delay    = 150;
    options.easing ||= "ease-out";
    options.perspective ||= CUBIE_SIZE * 12;

    // Performance options (both are visually lossless, big cubes need them):
    //  - hideBackfaces: faces turned away from the viewer are not drawn.
    //  - lazyFaces: a cubie only gets the faces that can ever be seen: the
    //    outer ones and those next to the empty core. The faces on the cut
    //    between two layers are added only while a turn is animating.
    if(options.hideBackfaces === undefined) options.hideBackfaces = true;
    if(options.lazyFaces === undefined) options.lazyFaces = true;

    // Pieces in the middle of the cube are never visible: they are not built.
    function isInterior(x, y, z) {
      return [x, y, z].every(function(v) { return v > 0 && v < LAYERS - 1; });
    }

    // Name of a cubie by its *initial* position (x, y, z in 0..LAYERS-1).
    function cubieName(x, y, z) {
      if(LAYERS === 4) return LEGACY_NAMES_4[x * 16 + y * 4 + z];

      var last = LAYERS - 1;
      var name =
        (y === 0 ? "U" : y === last ? "D" : "") +
        (x === 0 ? "L" : x === last ? "R" : "") +
        (z === 0 ? "B" : z === last ? "F" : "");

      // pieces that would share a name get their inner indices appended
      if(LAYERS > 3) {
        name += [x, y, z].filter(function(v) { return v > 0 && v < last; }).join("");
      }

      return name;
    }

    // Does a cubie need the face that looks at the cell (x, y, z) when that
    // cell is not part of the visible shell? (outside of the cube, or the core)
    function needsFace(x, y, z) {
      if(!options.lazyFaces) return true;

      var last = LAYERS - 1;
      if(x < 0 || y < 0 || z < 0 || x > last || y > last || z > last) return true;

      return isInterior(x, y, z);
    }

    // Translation that puts a cubie at its initial position (x, y, z are
    // centered coordinates, in cubies).
    function offsetOf(x, y, z) {
      return "translate3d(" + (x * CUBIE_SIZE) + "px, " + (y * CUBIE_SIZE) + "px, " + (z * CUBIE_SIZE) + "px)";
    }

    // -------------------------------------------------------------------------
    // Building the DOM
    // -------------------------------------------------------------------------

    function buildSticker(position) {
      var sticker = document.createElement("div");

      sticker.classList.add("sticker");
      sticker.style.backgroundColor = COLOR_BY_FACE[position];
      sticker.style.width = "100%";
      sticker.style.height = "100%";
      sticker.style.borderRadius = "10%"; // TODO configurable???

      return sticker;
    }

    function hasSticker(coords, position) {
      var at = STICKER_AT[position];
      return coords[at.coord] === (at.last ? LAYERS - 1 : 0);
    }

    function buildFace(coords, position) {
      var face = document.createElement("div");
      var placement = FACE_PLACEMENT[position];
      var offset = placement.sign * CUBIE_SIZE / 2;

      face.classList.add("face");
      face.classList.add(position);

      face.style.position = "absolute";
      face.style.padding = "5%"; // TODO configurable???
      face.style.width = CUBIE_SIZE + "px";
      face.style.height = CUBIE_SIZE + "px";
      face.style.backgroundColor = options.colorPlastic;
      if(options.hideBackfaces) {
        face.style.backfaceVisibility = "hidden";
        face.style.webkitBackfaceVisibility = "hidden";
      }
      face.style.transform = ("translate" + placement.axis + "(" + offset + "px) " + placement.rotate).trim();

      if(hasSticker(coords, position)) {
        face.appendChild(buildSticker(position));
      }

      return face;
    }

    function buildCubie(x, y, z) {
      var cubie = document.createElement("div");
      var coords = { x: x, y: y, z: z };

      cubie.classList.add("cubie");

      // One element per cubie: its box sits in the middle of the cube, so the
      // default transform origin is the center of the cube and the whole
      // transform is `matrix(rotation) translate(initial position)`.
      cubie.style.position = "absolute";
      cubie.style.left = (CENTER * CUBIE_SIZE) + "px";
      cubie.style.top = (CENTER * CUBIE_SIZE) + "px";
      cubie.style.transform = offsetOf(x - CENTER, y - CENTER, z - CENTER);
      cubie.style.transformStyle = "preserve-3d";
      cubie.style.width = CUBIE_SIZE + "px";
      cubie.style.height = CUBIE_SIZE + "px";

      FACE_NAMES.forEach(function(position) {
        var v = FACE_VECTOR[position];
        if(needsFace(x + v[0], y + v[1], z + v[2])) {
          cubie.appendChild(buildFace(coords, position));
        }
      });

      return cubie;
    }

    function buildCube() {
      var cube = document.createElement("div");

      cube.classList.add("cube");

      cube.style.position = "relative";
      cube.style.width = (CUBIE_SIZE * LAYERS) + "px";
      cube.style.height = (CUBIE_SIZE * LAYERS) + "px";
      cube.style.transformStyle = "preserve-3d";

      for(var x=0; x<LAYERS; x++) {
        for(var y=0; y<LAYERS; y++) {
          for(var z=0; z<LAYERS; z++) {
            if(isInterior(x, y, z)) continue;

            cube.appendChild(buildCubie(x, y, z));
          }
        }
      }

      return cube;
    }

    function buildCubeWrapper() {
      var rx = RX;
      var ry = RY;
      var rz = RZ;

      var perspective = options.perspective;

      var cubeWrapper = document.createElement("div");

      cubeWrapper.style.display = "flex";
      cubeWrapper.style.justifyContent = "center";
      cubeWrapper.style.alignItems = "center";
      cubeWrapper.style.height = options.wrapperHeight + "px";
      cubeWrapper.style.transformStyle = "preserve-3d";
      cubeWrapper.style.transform = "perspective(" + perspective + "px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) rotateZ(" + rz + "deg)";
      cubeWrapper.classList.add("cube-wrapper");

      var lastTouchX;
      var lastTouchY;
      var dragging;

      var handleTouchStart = function(e) {
        if(!e.cancelable) return;

        e.preventDefault();
        e.stopPropagation();

        dragging = true;
        lastTouchX = e.touches ? e.touches[0].clientX : e.clientX;
        lastTouchY = e.touches ? e.touches[0].clientY : e.clientY;
      };

      var handleTouchMove = function(e) {
        e.preventDefault();
        e.stopPropagation();

        if(!dragging) return;

        var touchX = e.touches ? e.touches[0].clientX : e.clientX;
        var touchY = e.touches ? e.touches[0].clientY : e.clientY;

        var dx = touchX - lastTouchX;
        var dy = touchY - lastTouchY;

        ry += dx / 2;
        rx -= dy / 2;

        if(rx < -75) rx = -75;
        if(rx >  75) rx =  75;

        lastTouchX = touchX;
        lastTouchY = touchY;

        cubeWrapper.style.transform = "perspective(" + perspective + "px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) rotateZ(" + rz + "deg)";
      };

      var handleTouchEnd = function(e) {
        e.preventDefault();
        e.stopPropagation();

        dragging = false;
      };

      CONTAINER.addEventListener("touchstart", handleTouchStart, false);
      CONTAINER.addEventListener("touchmove", handleTouchMove, false);
      CONTAINER.addEventListener("touchend", handleTouchEnd, false);

      CONTAINER.addEventListener("mousedown", handleTouchStart, false);
      CONTAINER.addEventListener("mousemove", handleTouchMove, false);
      CONTAINER.addEventListener("mouseleave", handleTouchEnd, false);
      CONTAINER.addEventListener("mouseup", handleTouchEnd, false);

      return cubeWrapper;
    }

    var cube = buildCube();
    var cubeWrapper = buildCubeWrapper();

    cubeWrapper.appendChild(cube);
    CONTAINER.appendChild(cubeWrapper);

    this.el = cube;

    // -------------------------------------------------------------------------
    // Cubies
    // -------------------------------------------------------------------------

    // Each cubie keeps its stickers forever; only its accumulated rotation `m`
    // changes. Names (ULB, UL, ...) refer to the cubie's *initial* position.

    var cubieEls = cube.querySelectorAll(".cubie");
    var allCubies = [];
    var next = 0;

    this.cubies = {};

    // same iteration order as buildCube()
    for(var x=0; x<LAYERS; x++) {
      for(var y=0; y<LAYERS; y++) {
        for(var z=0; z<LAYERS; z++) {
          if(isInterior(x, y, z)) continue;

          var el = cubieEls[next++];
          var cubie = {
            el: el,
            body: el,
            offset: offsetOf(x - CENTER, y - CENTER, z - CENTER),
            coords: { x: x, y: y, z: z },                // initial layer indices
            x: x - CENTER, y: y - CENTER, z: z - CENTER, // initial position, centered on the origin
            m: new DOMMatrix(),                          // accumulated rotation
            faces: {},
            stickers: {},
            colors: {} // the color each sticker was built with (the DOM color may be changed from outside)
          };

          FACE_NAMES.forEach(function(position) {
            var face = el.querySelector(".face." + position);
            if(face) cubie.faces[position] = face;

            var sticker = el.querySelector(".face." + position + " .sticker");
            if(sticker) {
              cubie.stickers[position] = sticker;
              cubie.colors[position] = COLOR_BY_FACE[position];
            }
          });

          this.cubies[cubieName(x, y, z)] = cubie;
          allCubies.push(cubie);
          el.style.transform = transformOf(cubie);
        }
      }
    }

    // -------------------------------------------------------------------------
    // Turning
    // -------------------------------------------------------------------------

    var queue = [];
    var queueIdx = 0;
    var turning = false;
    var animating = true;
    var playing = true;

    // full transform of a cubie: accumulated rotation, then its initial position
    function transformOf(cubie) {
      return cubie.m.toString() + " " + cubie.offset;
    }

    // current layer indices (0..LAYERS-1) of a cubie
    function positionOf(cubie) {
      var p = cubie.m.transformPoint(new DOMPoint(cubie.x, cubie.y, cubie.z));
      return {
        x: Math.round(p.x + CENTER),
        y: Math.round(p.y + CENTER),
        z: Math.round(p.z + CENTER)
      };
    }

    // direction in the world of a cubie's local direction v (m * v)
    function toWorld(m, v) {
      return [
        Math.round(v[0] * m.m11 + v[1] * m.m21 + v[2] * m.m31),
        Math.round(v[0] * m.m12 + v[1] * m.m22 + v[2] * m.m32),
        Math.round(v[0] * m.m13 + v[1] * m.m23 + v[2] * m.m33)
      ];
    }

    // face of a cubie that looks in the world direction d (mᵀ * d)
    function faceLooking(m, d) {
      return FACE_BY_VECTOR[[
        Math.round(d[0] * m.m11 + d[1] * m.m12 + d[2] * m.m13),
        Math.round(d[0] * m.m21 + d[1] * m.m22 + d[2] * m.m23),
        Math.round(d[0] * m.m31 + d[1] * m.m32 + d[2] * m.m33)
      ].join(",")];
    }

    function ensureFace(cubie, name) {
      if(cubie.faces[name]) return;

      cubie.faces[name] = cubie.body.appendChild(buildFace(cubie.coords, name));
    }

    function dropFace(cubie, name) {
      if(!cubie.faces[name] || cubie.stickers[name]) return;

      cubie.body.removeChild(cubie.faces[name]);
      delete cubie.faces[name];
    }

    // leave a cubie with just the faces it needs at its current position
    function syncFaces(cubie) {
      if(!options.lazyFaces) return;

      var p = positionOf(cubie);

      FACE_NAMES.forEach(function(name) {
        var w = toWorld(cubie.m, FACE_VECTOR[name]);

        if(needsFace(p.x + w[0], p.y + w[1], p.z + w[2])) {
          ensureFace(cubie, name);
        } else {
          dropFace(cubie, name);
        }
      });
    }

    // the faces looking at the cut between the turning layers and the rest
    function addCutFaces(cubie, move) {
      if(!options.lazyFaces) return;

      var layer = positionOf(cubie)[move.axis];

      [-1, 1].forEach(function(side) {
        var other = layer + side;
        if(other < 0 || other > LAYERS - 1) return;
        if(move.layers.includes(layer) === move.layers.includes(other)) return;

        var d = AXIS_VECTOR[move.axis].map(function(v) { return v * side; });
        ensureFace(cubie, faceLooking(cubie.m, d));
      });
    }

    function rotationOf(move, degrees) {
      var v = AXIS_VECTOR[move.axis];
      return new DOMMatrix().rotateAxisAngle(v[0], v[1], v[2], degrees);
    }

    // Applies a move at once, without animation and without touching the faces.
    function jumpMove(name, qts) {
      var move = MOVES[name];
      var R = rotationOf(move, 90 * move.sign * qts);

      allCubies.forEach(function(c) {
        if(!move.layers.includes(positionOf(c)[move.axis])) return;

        c.m = snap(R.multiply(c.m));
        c.el.style.transform = transformOf(c);
      });
    }

    function rotate(move, qts, done) {
      var degrees = 90 * move.sign * qts;
      var fn = "rotate" + move.axis.toUpperCase();
      var R = rotationOf(move, degrees);
      var wholeCube = move.layers.length === LAYERS;

      var moving = allCubies.filter(function(c) {
        return move.layers.includes(positionOf(c)[move.axis]);
      });

      var apply = function(c) {
        c.m = snap(R.multiply(c.m));
        c.el.style.transform = transformOf(c);
      };

      var finish = function() {
        allCubies.forEach(syncFaces);
        done();
      };

      var timing = {
        duration: options.duration,
        delay: options.delay,
        easing: options.easing
      };

      if(!animating || moving.length === 0) {
        moving.forEach(apply);
        finish();
        return;
      }

      if(wholeCube) {
        // one animation for the whole cube instead of one per cubie
        var spin = cube.animate([
          { transform: fn + "(0deg)" },
          { transform: fn + "(" + degrees + "deg)" }
        ], Object.assign({ fill: "both" }, timing));

        var end = function() {
          moving.forEach(apply);
          spin.cancel(); // same task as the new transforms: no flash
          finish();
        };

        spin.finished.then(end, end);
        return;
      }

      allCubies.forEach(function(c) { addCutFaces(c, move); });

      var animations = moving.map(function(c) {
        var from = transformOf(c);

        // The final state is applied right away; the animation only
        // disguises it while it lasts.
        apply(c);

        // Same function list in both keyframes -> clean interpolation.
        return c.el.animate([
          { transform: fn + "(0deg) " + from },
          { transform: fn + "(" + degrees + "deg) " + from }
        ], Object.assign({ fill: "backwards" }, timing)).finished;
      });

      Promise.all(animations).then(finish, finish);
    }

    function turn(name, qts) {
      rotate(MOVES[name], qts, function() {
        turning = false;
        handleQueue();
      });
    }

    function perform(name, qts) {
      if(animating) {
        setTimeout(function() { turn(name, qts); });
      } else {
        turn(name, qts);
      }
    }

    function handleQueue() {
      if(turning) return;

      if(!playing) {
        ee.emit("turned");
        return;
      }

      if(queueIdx < queue.length) {
        turning = true;
        ee.emit("turning");

        var move = queue[queueIdx++];
        perform(move.name, move.qts);
      } else {
        ee.emit("turned");
        ee.emit("finish");
      }
    }

    function undo() {
      if(turning) return;
      if(playing) return;

      if(queueIdx > 0) {
        turning = true;
        ee.emit("turning");

        var move = queue[--queueIdx];
        perform(move.name, -move.qts);
      }
    }

    var enqueue = function(name, qts) {
      queue.push({ name: name, qts: qts });
      handleQueue();
    };

    // Moves the cube to the state it has after `target` moves of the queue,
    // instantly (no animation), forwards or backwards.
    function jumpTo(target) {
      target = Math.max(0, Math.min(queue.length, target));

      var move;
      while(queueIdx > target) {
        move = queue[--queueIdx];
        jumpMove(move.name, -move.qts);
      }
      while(queueIdx < target) {
        move = queue[queueIdx++];
        jumpMove(move.name, move.qts);
      }

      allCubies.forEach(syncFaces);
    }

    function goTo(target) {
      if(turning) return;

      jumpTo(target);

      if(playing) {
        handleQueue(); // carries on from there
      } else {
        ee.emit("turned");
      }
    }

    function reset() {
      if(turning) return;

      jumpTo(0);
      queue.length = 0;

      ee.emit("turned");
    }

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    // True when every face of the cube shows a single color (a solved cube,
    // in any orientation).
    function isSolved() {
      var seen = {};

      return allCubies.every(function(c) {
        return Object.keys(c.colors).every(function(name) {
          var where = toWorld(c.m, FACE_VECTOR[name]).join(",");

          if(seen[where] === undefined) seen[where] = c.colors[name];
          return seen[where] === c.colors[name];
        });
      });
    }

    // The cube as a facelet string, e.g. "UUUUUUUUURRRRRRRRRFFF..." when solved.
    // Each letter is the face a sticker belongs to, so it is a standard solver
    // input for a 3x3x3 (faces U R F D L B, LAYERS * LAYERS stickers each).
    function facelets() {
      var at = {};
      allCubies.forEach(function(c) {
        var p = positionOf(c);
        at[[p.x, p.y, p.z].join(",")] = c;
      });

      return FACELET_FACES.map(function(face) {
        var out = "";

        for(var row=0; row<LAYERS; row++) {
          for(var col=0; col<LAYERS; col++) {
            var cell = FACELET_CELL[face](row, col, LAYERS);
            var c = at[cell.join(",")];
            var local = c && faceLooking(c.m, FACE_VECTOR[face]);

            out += (c && c.colors[local]) ? FACE_LETTER[local] : "?";
          }
        }

        return out;
      }).join("");
    }

    // The cubie that is *now* at the position where the cubie `name` started
    // (cubies[name] is the piece itself, wherever it has gone).
    function cubieAt(name) {
      var home = that.cubies[name];
      if(!home) return undefined;

      return allCubies.find(function(c) {
        var p = positionOf(c);
        return p.x === home.coords.x && p.y === home.coords.y && p.z === home.coords.z;
      });
    }

    // The sticker that is *now* at the position `name` looking up / down / left /
    // right / front / back (whichever cubie it belongs to).
    function stickerAt(name, face) {
      var c = cubieAt(name);
      if(!c || !FACE_VECTOR[face]) return undefined;

      return c.stickers[faceLooking(c.m, FACE_VECTOR[face])];
    }

    // Where every cubie is and how it is turned:
    // { ULB: { position: [x, y, z], rotation: [[...], [...], [...]] }, ... }
    // `position` are layer indices (0 = left / up / back); `rotation` is the
    // matrix that takes the cubie's own axes to the cube's (identity if untouched).
    function pieces() {
      var out = {};

      Object.keys(that.cubies).forEach(function(name) {
        var c = that.cubies[name];
        var p = positionOf(c);
        var m = c.m;

        out[name] = {
          position: [p.x, p.y, p.z],
          rotation: [
            [m.m11, m.m21, m.m31],
            [m.m12, m.m22, m.m32],
            [m.m13, m.m23, m.m33]
          ]
        };
      });

      return out;
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    var that = this;
    Object.keys(MOVES).forEach(function(l) {
      that[l]        = function() { enqueue(l,  1); };
      that[l + "2"]  = function() { enqueue(l,  2); };
      that[l + "i"]  = function() { enqueue(l, -1); };
      that[l + "2i"] = function() { enqueue(l, -2); };
    });

    this.withoutAnimation = function(cb) {
      var animatingWas = animating;
      animating = false;
      cb();
      animating = animatingWas;
    };
    this.pause = function() { playing = false; };
    this.play = function() { if(playing) return; playing = true; handleQueue(); };

    this.layers = LAYERS;

    this.idx = function() { return queueIdx; };
    this.length = function() { return queue.length; };
    this.undo = function() { undo(); };
    // Jump (without animation) to the state after `idx` moves of the queue.
    // Ignored while a turn is animating. If playing, it carries on from there.
    this.goTo = function(idx) { goTo(idx); };
    // Back to the solved state, with an empty queue.
    this.reset = function() { reset(); };

    this.isSolved = function() { return isSolved(); };
    this.facelets = function() { return facelets(); };
    this.pieces = function() { return pieces(); };
    this.cubieAt = function(name) { return cubieAt(name); };
    this.stickerAt = function(name, face) { return stickerAt(name, face); };
    this.playing = function() { return playing; };
    this.turning = function() { return turning; };

    this.on = function(e, cb) { ee.on(e, cb); };
  }

  window.EventEmitter = EventEmitter;
  window.CubeCSS = CubeCSS;
})();
