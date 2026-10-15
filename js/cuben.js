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

      if(n > 2) moves[f + "w"] = moves["2" + f + "w"];
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

    var CUBIE_SIZE = options.cubieSize;

    // Height of the flex wrapper that centers the cube. Pass e.g.
    // `wrapperHeight: container.offsetWidth` for a square wrapper.
    options.wrapperHeight ||= CUBIE_SIZE * LAYERS * 1.75;

    options.duration ||= 350;
    options.delay    ||= 150;
    options.easing   ||= "ease-out";
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

      cubie.style.transform = "translate3d(" + (x * CUBIE_SIZE) + "px, " + (y * CUBIE_SIZE) + "px, " + ((z - CENTER) * CUBIE_SIZE) + "px)";
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

    function buildCubieContainer(x, y, z) {
      var cubieContainer = document.createElement("div");

      cubieContainer.classList.add("cubie-container");

      cubieContainer.style.transformStyle = "preserve-3d";
      cubieContainer.style.position = "absolute";
      cubieContainer.style.top = "0";
      cubieContainer.style.left = "0";
      cubieContainer.style.bottom = "0";
      cubieContainer.style.right = "0";

      cubieContainer.appendChild(buildCubie(x, y, z));

      return cubieContainer;
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

            cube.appendChild(buildCubieContainer(x, y, z));
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

    var cubieContainers = cube.querySelectorAll(".cubie-container");
    var allCubies = [];
    var next = 0;

    this.cubies = {};

    // same iteration order as buildCube()
    for(var x=0; x<LAYERS; x++) {
      for(var y=0; y<LAYERS; y++) {
        for(var z=0; z<LAYERS; z++) {
          if(isInterior(x, y, z)) continue;

          var el = cubieContainers[next++];
          var cubie = {
            el: el,
            body: el.querySelector(".cubie"),
            coords: { x: x, y: y, z: z },                // initial layer indices
            x: x - CENTER, y: y - CENTER, z: z - CENTER, // initial position, centered on the origin
            m: new DOMMatrix(),                          // accumulated rotation
            faces: {},
            stickers: {}
          };

          FACE_NAMES.forEach(function(position) {
            var face = cubie.body.querySelector(".face." + position);
            if(face) cubie.faces[position] = face;

            var sticker = el.querySelector(".cubie .face." + position + " .sticker");
            if(sticker) cubie.stickers[position] = sticker;
          });

          this.cubies[cubieName(x, y, z)] = cubie;
          allCubies.push(cubie);
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

    function rotate(move, qts, done) {
      var degrees = 90 * move.sign * qts;
      var v = AXIS_VECTOR[move.axis];
      var fn = "rotate" + move.axis.toUpperCase();
      var R = new DOMMatrix().rotateAxisAngle(v[0], v[1], v[2], degrees);
      var wholeCube = move.layers.length === LAYERS;

      var moving = allCubies.filter(function(c) {
        return move.layers.includes(positionOf(c)[move.axis]);
      });

      var apply = function(c) {
        c.m = snap(R.multiply(c.m));
        c.el.style.transform = c.m.toString();
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
        var from = c.m.toString();

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

    function turn(name) {
      return function(qts) {
        rotate(MOVES[name], qts, function() {
          turning = false;
          handleQueue();
        });
      };
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

        var [fn, qts] = queue[queueIdx++];
        if(animating) {
          setTimeout(function() { fn(qts); });
        } else {
          fn(qts);
        }
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

        var [fn, qts] = queue[--queueIdx];
        if(animating) {
          setTimeout(function() { fn(-qts); });
        } else {
          fn(-qts);
        }
      }
    }

    var enqueue = function(fn, qts) {
      queue.push([fn, qts]);
      handleQueue();
    };

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    var that = this;
    Object.keys(MOVES).forEach(function(l) {
      var f = turn(l);
      that[l]        = function() { enqueue(f,  1); };
      that[l + "2"]  = function() { enqueue(f,  2); };
      that[l + "i"]  = function() { enqueue(f, -1); };
      that[l + "2i"] = function() { enqueue(f, -2); };
    });

    this.withoutAnimation = function(cb) {
      var animatingWas = animating;
      animating = false;
      cb();
      animating = animatingWas;
    };
    this.pause = function() { playing = false; };
    this.play = function() { if(playing) return; playing = true; handleQueue(); };

    this.idx = function() { return queueIdx; };
    this.undo = function() { undo(); };
    this.playing = function() { return playing; };
    this.turning = function() { return turning; };

    this.on = function(e, cb) { ee.on(e, cb); };
  }

  window.EventEmitter = EventEmitter;
  window.CubeCSS = CubeCSS;
})();
