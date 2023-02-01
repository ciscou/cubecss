(function() {
  EventEmitter = function() {
    var listeners = {};

    this.on = function(event, callback) {
      listeners[event] ||= [];
      listeners[event].push(callback)
    }

    this.emit = function(event) {
      listeners[event] ||= [];
      listeners[event].forEach(function(callback) {
        callback();
      })
    }
  }

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

    var LAYERS = 2;

    options.cubieSize ||= Math.floor(CONTAINER.offsetWidth / (LAYERS * 2));
    options.cubieSize ||= 40;

    var COLOR_BY_FACE = {
      up: options.colorUp,
      down: options.colorDown,
      right: options.colorRight,
      left: options.colorLeft,
      front: options.colorFront,
      back:options.colorBack
    };

    var CUBIE_SIZE = options.cubieSize;

    options.transition ||= "transform 350ms ease-out 150ms";
    options.perspective ||= CUBIE_SIZE * 12;

    function buildSticker(position) {
      var sticker = document.createElement("div");

      sticker.classList.add("sticker");
      sticker.style.backgroundColor = COLOR_BY_FACE[position];
      sticker.style.width = "100%";
      sticker.style.height = "100%";
      sticker.style.borderRadius = "10%"; // TODO configurable???

      return sticker;
    }

    function hasSticker(x, y, z, position) {
      if((x === 0) && (position === "left"))
        return true;
      if((x === LAYERS - 1) && (position === "right"))
        return true;
      if((y === 0) && (position === "up"))
        return true;
      if((y === LAYERS - 1) && (position === "down"))
        return true;
      if((z === LAYERS - 1) && (position === "front"))
        return true;
      if((z === 0) && (position === "back"))
        return true;

      return false;
    }

    function buildFace(x, y, z, position) {
      var face = document.createElement("div");

      face.classList.add("face");
      face.classList.add(position);

      face.style.position = "absolute";
      face.style.padding = "5%"; // TODO configurable???
      face.style.width = "" + CUBIE_SIZE + "px";
      face.style.height = "" + CUBIE_SIZE + "px";
      face.style.backgroundColor = options.colorPlastic;

      switch(position) {
        case "up":
          face.style.transform = "translateY(-" + (CUBIE_SIZE / 2) + "px) rotateX(90deg)";
          break;
        case "down":
          face.style.transform = "translateY(" + (CUBIE_SIZE / 2) + "px) rotateX(-90deg)";
          break;
        case "right":
          face.style.transform = "translateX(" + (CUBIE_SIZE / 2) + "px) rotateY(90deg)";
          break;
        case "left":
          face.style.transform = "translateX(-" + (CUBIE_SIZE / 2) + "px) rotateY(-90deg)";
          break;
        case "front":
          face.style.transform = "translateZ(" + (CUBIE_SIZE / 2) + "px)";
          break;
        case "back":
          face.style.transform = "translateZ(-" + (CUBIE_SIZE / 2) + "px)";
          break;
      }

      if(hasSticker(x, y, z, position)) {
        face.appendChild(buildSticker(position));
      }

      return face;
    }

    function buildCubie(x, y, z) {
      var cubie = document.createElement("div");

      cubie.classList.add("cubie");

      cubie.style.transform = "translate3d(" + (x * CUBIE_SIZE) + "px, " + (y * CUBIE_SIZE) + "px, " + (z * CUBIE_SIZE - CUBIE_SIZE / 2) + "px)";
      cubie.style.transformStyle = "preserve-3d";
      cubie.style.width = "" + CUBIE_SIZE + "px";
      cubie.style.height = "" + CUBIE_SIZE + "px";

      ["up", "down", "right", "left", "front", "back"].forEach(function(face) {
        cubie.appendChild(buildFace(x, y, z, face));
      });

      return cubie;
    }

    function buildCubieContainer(x, y, z) {
      var cubieContainer = document.createElement("div");

      cubieContainer.classList.add("cubie-container");

      cubieContainer.style.transition = options.transition;
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
      cube.style.width = "" + (CUBIE_SIZE * LAYERS) + "px";
      cube.style.height = "" + (CUBIE_SIZE * LAYERS) + "px";
      cube.style.transformStyle = "preserve-3d";
      cube.style.transition = options.transition;

      for(var x=0; x<LAYERS; x++) {
        for(var y=0; y<LAYERS; y++) {
          for(var z=0; z<LAYERS; z++) {
            cube.appendChild(buildCubieContainer(x, y, z));
          }
        }
      }

      return cube;
    };

    function buildCubeWrapper() {
      var rx = RX;
      var ry = RY;
      var rz = RZ;

      var perspective = options.perspective;

      cubeWrapper = document.createElement("div");

      cubeWrapper.style.display = "flex";
      cubeWrapper.style.justifyContent = "center";
      cubeWrapper.style.alignItems = "center";
      cubeWrapper.style.height = (CUBIE_SIZE * LAYERS * 1.75) + "px"
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
      }

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

        lastTouchX = e.touches ? e.touches[0].clientX : e.clientX;
        lastTouchY = e.touches ? e.touches[0].clientY : e.clientY;

        cubeWrapper.style.transform = "perspective(" + perspective + "px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) rotateZ(" + rz + "deg)";
      }

      var handleTouchEnd = function(e) {
        e.preventDefault();
        e.stopPropagation();

        dragging = false;
      }

      CONTAINER.addEventListener("touchstart", handleTouchStart, false);
      CONTAINER.addEventListener("touchmove", handleTouchMove, false);
      CONTAINER.addEventListener("touchend", handleTouchEnd, false);

      CONTAINER.addEventListener("mousedown", handleTouchStart, false);
      CONTAINER.addEventListener("mousemove", handleTouchMove, false);
      CONTAINER.addEventListener("mouseleave", handleTouchEnd, false);
      CONTAINER.addEventListener("mouseup", handleTouchEnd, false);

      return cubeWrapper;
    }

    function rotateEl(el, qts, axis, cb) {
      var transitionend = function() {
        cb();

        transitionWas = el.style.transition;
        el.style.transition = "none";
        el.style.transform = "";

        setTimeout(function() {
          el.style.transition = transitionWas;
        });

        el.removeEventListener("transitionend", transitionend, false);
      }

      el.addEventListener("transitionend", transitionend, false);

      var transform = "rotate" + axis + "(" + (qts / 4) + "turn)";
      el.style.transform = transform;
    }

    function rotateElX(el, qts, cb) {
      rotateEl(el, qts, "X", cb);
    }

    function rotateElY(el, qts, cb) {
      rotateEl(el, qts, "Y", cb);
    }

    function rotateElZ(el, qts, cb) {
      rotateEl(el, qts, "Z", cb);
    }

    var cube = buildCube();
    var cubeWrapper = buildCubeWrapper();

    cubeWrapper.appendChild(cube);
    CONTAINER.appendChild(cubeWrapper);

    this.el = cube;

    var cubieContainers = cube.querySelectorAll(".cubie-container");

    var ULB  = { el: cubieContainers[0]  };
    var ULF  = { el: cubieContainers[1]  };
    var DLB  = { el: cubieContainers[2]  };
    var DLF  = { el: cubieContainers[3]  };
    var URB  = { el: cubieContainers[4] };
    var URF  = { el: cubieContainers[5] };
    var DRB  = { el: cubieContainers[6] };
    var DRF  = { el: cubieContainers[7] };

    this.cubies = {
      ULB: ULB,
      ULF: ULF,
      DLB: DLB,
      DLF: DLF,
      URB: URB,
      URF: URF,
      DRB: DRB,
      DRF: DRF
    }

    Object.values(this.cubies).forEach(function(cc) {
      cc.stickers = {};

      cc.stickers.up    = cc.el.querySelector(".cubie .face.up .sticker");
      cc.stickers.down  = cc.el.querySelector(".cubie .face.down .sticker");
      cc.stickers.right = cc.el.querySelector(".cubie .face.right .sticker");
      cc.stickers.left  = cc.el.querySelector(".cubie .face.left .sticker");
      cc.stickers.front = cc.el.querySelector(".cubie .face.front .sticker");
      cc.stickers.back  = cc.el.querySelector(".cubie .face.back .sticker");

      if(!cc.stickers.up)    delete cc.stickers.up;
      if(!cc.stickers.down)  delete cc.stickers.down;
      if(!cc.stickers.right) delete cc.stickers.right;
      if(!cc.stickers.left)  delete cc.stickers.left;
      if(!cc.stickers.front) delete cc.stickers.front;
      if(!cc.stickers.back)  delete cc.stickers.back;
    });

    var USLICE = [
      ULB,
      ULF,
      URB,
      URF
    ];

    var DSLICE = [
      DLB,
      DLF,
      DRB,
      DRF
    ];

    var LSLICE = [
      ULB,
      ULF,
      DLB,
      DLF
    ];

    var RSLICE = [
      URB,
      URF,
      DRB,
      DRF
    ];

    var FSLICE = [
      ULF,
      DLF,
      URF,
      DRF
    ];

    var BSLICE = [
      ULB,
      DLB,
      URB,
      DRB
    ];

    this.slices = {
      U: USLICE,
      D: DSLICE,
      R: RSLICE,
      L: LSLICE,
      F: FSLICE,
      B: BSLICE,
    }

    function turnsToCycles(qts) {
      switch(qts) {
        case -1:
          return 3;
          break;
        case 1:
          return 1;
          break;
        case 2:
        case -2:
          return 2;
          break;
        default:
          throw `Invalid number of turns: ${qts}`;
          break;
      }
    }

    function turnX(qts) {
      var cb = function() {
        turnLCallback(-qts);
        turnRCallback( qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        rotateElX(cube, qts, cb);
      } else {
        cb();
      }
    }

    function turnY(qts) {
      var cb = function() {
        turnDCallback(-qts);
        turnUCallback( qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        rotateElY(cube, -qts, cb);
      } else {
        cb();
      }
    }

    function turnZ(qts) {
      var cb = function() {
        turnBCallback(-qts);
        turnFCallback( qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        rotateElZ(cube, qts, cb);
      } else {
        cb();
      }
    }

    function turnUCallback(qts) {
      var cycles = turnsToCycles(qts);
      var tmp;

      for(var i=0; i<cycles; i++) {
        tmp = ULB.stickers.up.style.backgroundColor;
        ULB.stickers.up.style.backgroundColor = ULF.stickers.up.style.backgroundColor;
        ULF.stickers.up.style.backgroundColor = URF.stickers.up.style.backgroundColor;
        URF.stickers.up.style.backgroundColor = URB.stickers.up.style.backgroundColor;
        URB.stickers.up.style.backgroundColor = tmp;

        tmp = ULB.stickers.left.style.backgroundColor;
        ULB.stickers.left.style.backgroundColor  = ULF.stickers.front.style.backgroundColor;
        ULF.stickers.front.style.backgroundColor = URF.stickers.right.style.backgroundColor;
        URF.stickers.right.style.backgroundColor = URB.stickers.back.style.backgroundColor;
        URB.stickers.back.style.backgroundColor  = tmp;

        tmp = ULB.stickers.back.style.backgroundColor;
        ULB.stickers.back.style.backgroundColor  = ULF.stickers.left.style.backgroundColor;
        ULF.stickers.left.style.backgroundColor  = URF.stickers.front.style.backgroundColor;
        URF.stickers.front.style.backgroundColor = URB.stickers.right.style.backgroundColor;
        URB.stickers.right.style.backgroundColor = tmp;
      }
    }

    function turnU(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnUCallback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        USLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElY(cubieContainer.el, -qts, cb);
        });
      } else {
        remaining++;
        cb();
      }
    }

    function turnDCallback(qts) {
      var cycles = turnsToCycles(-qts);
      var tmp;

      for(var i=0; i<cycles; i++) {
        tmp = DLB.stickers.down.style.backgroundColor;
        DLB.stickers.down.style.backgroundColor = DLF.stickers.down.style.backgroundColor;
        DLF.stickers.down.style.backgroundColor = DRF.stickers.down.style.backgroundColor;
        DRF.stickers.down.style.backgroundColor = DRB.stickers.down.style.backgroundColor;
        DRB.stickers.down.style.backgroundColor = tmp;

        tmp = DLB.stickers.left.style.backgroundColor;
        DLB.stickers.left.style.backgroundColor  = DLF.stickers.front.style.backgroundColor;
        DLF.stickers.front.style.backgroundColor = DRF.stickers.right.style.backgroundColor;
        DRF.stickers.right.style.backgroundColor = DRB.stickers.back.style.backgroundColor;
        DRB.stickers.back.style.backgroundColor  = tmp;

        tmp = DLB.stickers.back.style.backgroundColor;
        DLB.stickers.back.style.backgroundColor  = DLF.stickers.left.style.backgroundColor;
        DLF.stickers.left.style.backgroundColor  = DRF.stickers.front.style.backgroundColor;
        DRF.stickers.front.style.backgroundColor = DRB.stickers.right.style.backgroundColor;
        DRB.stickers.right.style.backgroundColor = tmp;
      }
    }

    function turnD(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnDCallback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        DSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElY(cubieContainer.el, qts, cb);
        });
      } else {
        remaining++;
        cb();
      }
    }

    function turnLCallback(qts) {
      var cycles = turnsToCycles(-qts);
      var tmp;

      for(var i=0; i<cycles; i++) {
        tmp = ULF.stickers.left.style.backgroundColor;
        ULF.stickers.left.style.backgroundColor = DLF.stickers.left.style.backgroundColor;
        DLF.stickers.left.style.backgroundColor = DLB.stickers.left.style.backgroundColor;
        DLB.stickers.left.style.backgroundColor = ULB.stickers.left.style.backgroundColor;
        ULB.stickers.left.style.backgroundColor = tmp;

        tmp = ULF.stickers.up.style.backgroundColor;
        ULF.stickers.up.style.backgroundColor    = DLF.stickers.front.style.backgroundColor;
        DLF.stickers.front.style.backgroundColor = DLB.stickers.down.style.backgroundColor;
        DLB.stickers.down.style.backgroundColor  = ULB.stickers.back.style.backgroundColor;
        ULB.stickers.back.style.backgroundColor  = tmp;

        tmp = ULF.stickers.front.style.backgroundColor;
        ULF.stickers.front.style.backgroundColor = DLF.stickers.down.style.backgroundColor;
        DLF.stickers.down.style.backgroundColor  = DLB.stickers.back.style.backgroundColor;
        DLB.stickers.back.style.backgroundColor  = ULB.stickers.up.style.backgroundColor;
        ULB.stickers.up.style.backgroundColor    = tmp;
      }
    }

    function turnL(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnLCallback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        LSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElX(cubieContainer.el, -qts, cb);
        });
      } else {
        remaining++;
        cb();
      }
    }

    function turnRCallback(qts) {
      var cycles = turnsToCycles(qts);
      var tmp;

      for(var i=0; i<cycles; i++) {
        tmp = URF.stickers.right.style.backgroundColor;
        URF.stickers.right.style.backgroundColor = DRF.stickers.right.style.backgroundColor;
        DRF.stickers.right.style.backgroundColor = DRB.stickers.right.style.backgroundColor;
        DRB.stickers.right.style.backgroundColor = URB.stickers.right.style.backgroundColor;
        URB.stickers.right.style.backgroundColor = tmp;

        tmp = URF.stickers.up.style.backgroundColor;
        URF.stickers.up.style.backgroundColor    = DRF.stickers.front.style.backgroundColor;
        DRF.stickers.front.style.backgroundColor = DRB.stickers.down.style.backgroundColor;
        DRB.stickers.down.style.backgroundColor  = URB.stickers.back.style.backgroundColor;
        URB.stickers.back.style.backgroundColor  = tmp;

        tmp = URF.stickers.front.style.backgroundColor;
        URF.stickers.front.style.backgroundColor = DRF.stickers.down.style.backgroundColor;
        DRF.stickers.down.style.backgroundColor  = DRB.stickers.back.style.backgroundColor;
        DRB.stickers.back.style.backgroundColor  = URB.stickers.up.style.backgroundColor;
        URB.stickers.up.style.backgroundColor    = tmp;
      }
    }

    function turnR(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnRCallback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        RSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElX(cubieContainer.el, qts, cb);
        });
      } else {
        remaining++;
        cb();
      }
    }

    function turnFCallback(qts) {
      var cycles = turnsToCycles(qts);
      var tmp;

      for(var i=0; i<cycles; i++) {
        tmp = ULF.stickers.front.style.backgroundColor;
        ULF.stickers.front.style.backgroundColor = DLF.stickers.front.style.backgroundColor;
        DLF.stickers.front.style.backgroundColor = DRF.stickers.front.style.backgroundColor;
        DRF.stickers.front.style.backgroundColor = URF.stickers.front.style.backgroundColor;
        URF.stickers.front.style.backgroundColor = tmp;

        tmp = ULF.stickers.up.style.backgroundColor;
        ULF.stickers.up.style.backgroundColor    = DLF.stickers.left.style.backgroundColor;
        DLF.stickers.left.style.backgroundColor  = DRF.stickers.down.style.backgroundColor;
        DRF.stickers.down.style.backgroundColor  = URF.stickers.right.style.backgroundColor;
        URF.stickers.right.style.backgroundColor = tmp;

        tmp = ULF.stickers.left.style.backgroundColor;
        ULF.stickers.left.style.backgroundColor  = DLF.stickers.down.style.backgroundColor;
        DLF.stickers.down.style.backgroundColor  = DRF.stickers.right.style.backgroundColor;
        DRF.stickers.right.style.backgroundColor = URF.stickers.up.style.backgroundColor;
        URF.stickers.up.style.backgroundColor    = tmp;
      }
    }

    function turnF(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnFCallback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        FSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElZ(cubieContainer.el, qts, cb);
        });
      } else {
        remaining++;
        cb();
      }
    }

    function turnBCallback(qts) {
      var cycles = turnsToCycles(-qts);
      var tmp;

      for(var i=0; i<cycles; i++) {
        tmp = ULB.stickers.back.style.backgroundColor;
        ULB.stickers.back.style.backgroundColor = DLB.stickers.back.style.backgroundColor;
        DLB.stickers.back.style.backgroundColor = DRB.stickers.back.style.backgroundColor;
        DRB.stickers.back.style.backgroundColor = URB.stickers.back.style.backgroundColor;
        URB.stickers.back.style.backgroundColor = tmp;

        tmp = ULB.stickers.up.style.backgroundColor;
        ULB.stickers.up.style.backgroundColor    = DLB.stickers.left.style.backgroundColor;
        DLB.stickers.left.style.backgroundColor  = DRB.stickers.down.style.backgroundColor;
        DRB.stickers.down.style.backgroundColor  = URB.stickers.right.style.backgroundColor;
        URB.stickers.right.style.backgroundColor = tmp;

        tmp = ULB.stickers.left.style.backgroundColor;
        ULB.stickers.left.style.backgroundColor  = DLB.stickers.down.style.backgroundColor;
        DLB.stickers.down.style.backgroundColor  = DRB.stickers.right.style.backgroundColor;
        DRB.stickers.right.style.backgroundColor = URB.stickers.up.style.backgroundColor;
        URB.stickers.up.style.backgroundColor    = tmp;
      }
    }

    function turnB(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnBCallback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        BSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElZ(cubieContainer.el, -qts, cb);
        });
      } else {
        remaining++;
        cb();
      }
    }

    var queue = [];
    var queueIdx = 0;
    var turning = false;
    var animating = true;
    var playing = true;

    function handleQueue() {
      if(turning) return;

      if(!playing) {
        ee.emit("turned");
        return;
      }

      if(queueIdx < queue.length) {
        turning = true;
        ee.emit("turning");

        var [turn, qts] = queue[queueIdx++];
        if(animating) {
          setTimeout(function() { turn(qts) });
        } else {
          turn(qts);
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

        var [turn, qts] = queue[--queueIdx];
        if(animating) {
          setTimeout(function() { turn(-qts) });
        } else {
          turn(-qts);
        }
      }
    }

    var enqueue = function(turn, qts) {
      queue.push([turn, qts]);
      handleQueue();
    };

    var that = this;
    Object.entries({
      u:  turnU,
      r:  turnR,
      f:  turnF,
      d:  turnD,
      l:  turnL,
      b:  turnB,
      x:  turnX,
      y:  turnY,
      z:  turnZ,
    }).forEach(function([l, f]) {
      that[l]        = function() { enqueue(f,  1) }
      that[l + "2"]  = function() { enqueue(f,  2) }
      that[l + "i"]  = function() { enqueue(f, -1) }
      that[l + "2i"] = function() { enqueue(f, -2) }
    })

    this.withoutAnimation = function(cb) { var animatingWas = animating; animating = false; cb(); animating = animatingWas };
    this.pause = function() { playing = false; };
    this.play = function() { if(playing) return ; playing = true; handleQueue() };

    this.idx = function() { return queueIdx }
    this.undo = function() { undo() }
    this.playing = function() { return playing }
    this.turning = function() { return turning }

    this.on = function(e, cb) { ee.on(e, cb) };
  }

  window.CubeCSS = CubeCSS;
})();
