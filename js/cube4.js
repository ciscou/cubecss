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

    var LAYERS = 4;

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

      cubie.style.transform = "translate3d(" + (x * CUBIE_SIZE) + "px, " + (y * CUBIE_SIZE) + "px, " + (z * CUBIE_SIZE - CUBIE_SIZE * 1.5) + "px)";
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

      if(
        (x === 1 || x === 2) &&
        (y === 1 || y === 2) &&
        (z === 1 || z === 2)
      ) return cubieContainer; // core piece

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
    var UL1  = { el: cubieContainers[1]  };
    var UL2  = { el: cubieContainers[2]  };
    var ULF  = { el: cubieContainers[3]  };
    var LB1  = { el: cubieContainers[4]  };
    var L1   = { el: cubieContainers[5]  };
    var L2   = { el: cubieContainers[6]  };
    var LF1  = { el: cubieContainers[7]  };
    var LB2  = { el: cubieContainers[8]  };
    var L3   = { el: cubieContainers[9]  };
    var L4   = { el: cubieContainers[10]  };
    var LF2  = { el: cubieContainers[11]  };
    var DLB  = { el: cubieContainers[12]  };
    var DL1  = { el: cubieContainers[13]  };
    var DL2  = { el: cubieContainers[14]  };
    var DLF  = { el: cubieContainers[15]  };

    var UB1  = { el: cubieContainers[16]  };
    var U1   = { el: cubieContainers[17]  };
    var U3   = { el: cubieContainers[18]  };
    var UF1  = { el: cubieContainers[19]  };
    var B3   = { el: cubieContainers[20]  };
    var F1   = { el: cubieContainers[23]  };
    var B1   = { el: cubieContainers[24]  };
    var F3   = { el: cubieContainers[27]  };
    var DB1  = { el: cubieContainers[28]  };
    var D3   = { el: cubieContainers[29]  };
    var D1   = { el: cubieContainers[30]  };
    var DF1  = { el: cubieContainers[31]  };

    var UB2  = { el: cubieContainers[32]  };
    var U2   = { el: cubieContainers[33]  };
    var U4   = { el: cubieContainers[34]  };
    var UF2  = { el: cubieContainers[35]  };
    var B4   = { el: cubieContainers[36]  };
    var F2   = { el: cubieContainers[39]  };
    var B2   = { el: cubieContainers[40]  };
    var F4   = { el: cubieContainers[43]  };
    var DB2  = { el: cubieContainers[44]  };
    var D4   = { el: cubieContainers[45]  };
    var D2   = { el: cubieContainers[46]  };
    var DF2  = { el: cubieContainers[47]  };

    var URB  = { el: cubieContainers[48]  };
    var UR1  = { el: cubieContainers[49]  };
    var UR2  = { el: cubieContainers[50]  };
    var URF  = { el: cubieContainers[51]  };
    var RB1  = { el: cubieContainers[52]  };
    var R1   = { el: cubieContainers[53]  };
    var R2   = { el: cubieContainers[54]  };
    var RF1  = { el: cubieContainers[55]  };
    var RB2  = { el: cubieContainers[56]  };
    var R3   = { el: cubieContainers[57]  };
    var R4   = { el: cubieContainers[58]  };
    var RF2  = { el: cubieContainers[59]  };
    var DRB  = { el: cubieContainers[60]  };
    var DR1  = { el: cubieContainers[61]  };
    var DR2  = { el: cubieContainers[62]  };
    var DRF  = { el: cubieContainers[63]  };

    this.cubies = {
      ULB: ULB,
      UL1: UL1,
      UL2: UL2,
      ULF: ULF,
      LB1: LB1,
      LB2: LB2,
      L1: L1,
      L2: L2,
      L3: L3,
      L4: L4,
      LF1: LF1,
      LF2: LF2,
      DLB: DLB,
      DL1: DL1,
      DL2: DL2,
      DLF: DLF,
      UB1: UB1,
      UB2: UB2,
      U1: U1,
      U2: U2,
      U3: U3,
      U4: U4,
      UF1: UF1,
      UF2: UF2,
      B1: B1,
      B2: B2,
      B3: B3,
      B4: B4,
      F1: F1,
      F2: F2,
      F3: F3,
      F4: F4,
      DB1: DB1,
      DB2: DB2,
      D1: D1,
      D2: D2,
      D3: D3,
      D4: D4,
      DF1: DF1,
      DF2: DF2,
      URB: URB,
      UR1: UR1,
      UR2: UR2,
      URF: URF,
      RB1: RB1,
      RB2: RB2,
      R1: R1,
      R2: R2,
      R3: R3,
      R4: R4,
      RF1: RF1,
      RF2: RF2,
      DRB: DRB,
      DR1: DR1,
      DR2: DR2,
      DRF: DRF
    }

    Object.values(this.cubies).forEach(function(cc) {
      if(!cc.el) return;

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

    /*
    Object.values(DB1.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "lightgray";
    })

    Object.values(D3.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "darkgray";
    })

    Object.values(D1.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "gray";
    })

    Object.values(DF1.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "dimgray";
    })

    Object.values(UB2.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "lightgray";
    })

    Object.values(U2.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "darkgray";
    })

    Object.values(U4.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "gray";
    })

    Object.values(UF2.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "dimgray";
    })

    Object.values(B4.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "lightgray";
    })

    Object.values(F2.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "dimgray";
    })

    Object.values(B2.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "lightgray";
    })

    Object.values(F4.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "dimgray";
    })

    Object.values(DB2.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "lightgray";
    })

    Object.values(D4.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "darkgray";
    })

    Object.values(D2.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "gray";
    })

    Object.values(DF2.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "dimgray";
    })

    Object.values(URB.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "lightgray";
    })

    Object.values(UR1.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "darkgray";
    })

    Object.values(UR2.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "gray";
    })

    Object.values(URF.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "dimgray";
    })

    Object.values(RB1.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "lightgray";
    })

    Object.values(R1.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "darkgray";
    })

    Object.values(R2.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "gray";
    })

    Object.values(RF1.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "dimgray";
    })

    Object.values(RB2.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "lightgray";
    })

    Object.values(R3.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "darkgray";
    })

    Object.values(R4.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "gray";
    })

    Object.values(RF2.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "dimgray";
    })

    Object.values(DRB.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "lightgray";
    })

    Object.values(DR1.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "darkgray";
    })

    Object.values(DR2.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "gray";
    })

    Object.values(DRF.stickers).forEach((sticker) => {
      sticker.style.backgroundColor = "dimgray";
    })
    */

    var USLICE = [
      ULB,
      UL1,
      UL2,
      ULF,
      UB1,
      UB2,
      U1,
      U2,
      U3,
      U4,
      UF1,
      UF2,
      URB,
      UR1,
      UR2,
      URF
    ];

    var DSLICE = [
      DLB,
      DL1,
      DL2,
      DLF,
      DB1,
      DB2,
      D1,
      D2,
      D3,
      D4,
      DF1,
      DF2,
      DRB,
      DR1,
      DR2,
      DRF
    ];

    var LSLICE = [
      ULB,
      UL1,
      UL2,
      ULF,
      LB1,
      LB2,
      L1,
      L2,
      L3,
      L4,
      LF1,
      LF2,
      DLB,
      DL1,
      DL2,
      DLF,
    ];

    var RSLICE = [
      URB,
      UR1,
      UR2,
      URF,
      RB1,
      RB2,
      R1,
      R2,
      R3,
      R4,
      RF1,
      RF2,
      DRB,
      DR1,
      DR2,
      DRF
    ];

    var FSLICE = [
      ULF,
      LF1,
      LF2,
      DLF,
      UF1,
      UF2,
      F1,
      F2,
      F3,
      F4,
      DF1,
      DF2,
      URF,
      RF1,
      RF2,
      DRF
    ];

    var BSLICE = [
      ULB,
      LB1,
      LB2,
      DLB,
      UB1,
      UB2,
      B1,
      B2,
      B3,
      B4,
      DB1,
      DB2,
      URB,
      RB1,
      RB2,
      DRB
    ];

    var M1SLICE = [
      U1, U3, F1, F3, D1, D3, B1, B3,
      UB1, UF1, DB1, DF1
    ];

    var M2SLICE = [
      U2, U4, F2, F4, D2, D4, B2, B4,
      UB2, UF2, DB2, DF2
    ];

    var ESLICE = [
      L1, L2, F1, R1, B1,
      LF1, LB1, RF1, RB1
    ];

    var SSLICE = [
      U1, R1, D1, L1,
      UL1, UR1, DL1, DR1
    ];

    this.slices = {
      U: USLICE,
      D: DSLICE,
      R: RSLICE,
      L: LSLICE,
      F: FSLICE,
      B: BSLICE,
      M1: M1SLICE,
      M2: M2SLICE,
      E: ESLICE,
      S: SSLICE
    }

    window.slices = this.slices;

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

    function turnM1Callback(qts) {
      var cycles = turnsToCycles(-qts);
      var tmp;

      for(var i=0; i<cycles; i++) {
        tmp = U1.stickers.up.style.backgroundColor;
        U1.stickers.up.style.backgroundColor = F1.stickers.front.style.backgroundColor;
        F1.stickers.front.style.backgroundColor = D1.stickers.down.style.backgroundColor;
        D1.stickers.down.style.backgroundColor = B1.stickers.back.style.backgroundColor;
        B1.stickers.back.style.backgroundColor = tmp;

        tmp = U3.stickers.up.style.backgroundColor;
        U3.stickers.up.style.backgroundColor = F3.stickers.front.style.backgroundColor;
        F3.stickers.front.style.backgroundColor = D3.stickers.down.style.backgroundColor;
        D3.stickers.down.style.backgroundColor = B3.stickers.back.style.backgroundColor;
        B3.stickers.back.style.backgroundColor = tmp;

        tmp = UB1.stickers.up.style.backgroundColor;
        UB1.stickers.up.style.backgroundColor = UF1.stickers.front.style.backgroundColor;
        UF1.stickers.front.style.backgroundColor = DF1.stickers.down.style.backgroundColor;
        DF1.stickers.down.style.backgroundColor = DB1.stickers.back.style.backgroundColor;
        DB1.stickers.back.style.backgroundColor = tmp;

        tmp = UB1.stickers.back.style.backgroundColor;
        UB1.stickers.back.style.backgroundColor = UF1.stickers.up.style.backgroundColor;
        UF1.stickers.up.style.backgroundColor = DF1.stickers.front.style.backgroundColor;
        DF1.stickers.front.style.backgroundColor = DB1.stickers.down.style.backgroundColor;
        DB1.stickers.down.style.backgroundColor = tmp;
      }
    }

    function turnM2Callback(qts) {
      var cycles = turnsToCycles(-qts);
      var tmp;

      for(var i=0; i<cycles; i++) {
        tmp = U2.stickers.up.style.backgroundColor;
        U2.stickers.up.style.backgroundColor = F2.stickers.front.style.backgroundColor;
        F2.stickers.front.style.backgroundColor = D2.stickers.down.style.backgroundColor;
        D2.stickers.down.style.backgroundColor = B2.stickers.back.style.backgroundColor;
        B2.stickers.back.style.backgroundColor = tmp;

        tmp = U4.stickers.up.style.backgroundColor;
        U4.stickers.up.style.backgroundColor = F4.stickers.front.style.backgroundColor;
        F4.stickers.front.style.backgroundColor = D4.stickers.down.style.backgroundColor;
        D4.stickers.down.style.backgroundColor = B4.stickers.back.style.backgroundColor;
        B4.stickers.back.style.backgroundColor = tmp;

        tmp = UB2.stickers.up.style.backgroundColor;
        UB2.stickers.up.style.backgroundColor = UF2.stickers.front.style.backgroundColor;
        UF2.stickers.front.style.backgroundColor = DF2.stickers.down.style.backgroundColor;
        DF2.stickers.down.style.backgroundColor = DB2.stickers.back.style.backgroundColor;
        DB2.stickers.back.style.backgroundColor = tmp;

        tmp = UB2.stickers.back.style.backgroundColor;
        UB2.stickers.back.style.backgroundColor = UF2.stickers.up.style.backgroundColor;
        UF2.stickers.up.style.backgroundColor = DF2.stickers.front.style.backgroundColor;
        DF2.stickers.front.style.backgroundColor = DB2.stickers.down.style.backgroundColor;
        DB2.stickers.down.style.backgroundColor = tmp;
      }
    }

    function turnE1Callback(qts) {
      var cycles = turnsToCycles(-qts);
      var tmp;

      for(var i=0; i<cycles; i++) {
        tmp = F.stickers.front.style.backgroundColor;
        F.stickers.front.style.backgroundColor = R.stickers.right.style.backgroundColor;
        R.stickers.right.style.backgroundColor = B.stickers.back.style.backgroundColor;
        B.stickers.back.style.backgroundColor = L.stickers.left.style.backgroundColor;
        L.stickers.left.style.backgroundColor = tmp;

        tmp = LF.stickers.left.style.backgroundColor;
        LF.stickers.left.style.backgroundColor = RF.stickers.front.style.backgroundColor;
        RF.stickers.front.style.backgroundColor = RB.stickers.right.style.backgroundColor;
        RB.stickers.right.style.backgroundColor = LB.stickers.back.style.backgroundColor;
        LB.stickers.back.style.backgroundColor = tmp;

        tmp = LF.stickers.front.style.backgroundColor;
        LF.stickers.front.style.backgroundColor = RF.stickers.right.style.backgroundColor;
        RF.stickers.right.style.backgroundColor = RB.stickers.back.style.backgroundColor;
        RB.stickers.back.style.backgroundColor = LB.stickers.left.style.backgroundColor;
        LB.stickers.left.style.backgroundColor = tmp;
      }
    }

    function turnE2Callback(qts) {
      var cycles = turnsToCycles(-qts);
      var tmp;

      for(var i=0; i<cycles; i++) {
        tmp = F.stickers.front.style.backgroundColor;
        F.stickers.front.style.backgroundColor = R.stickers.right.style.backgroundColor;
        R.stickers.right.style.backgroundColor = B.stickers.back.style.backgroundColor;
        B.stickers.back.style.backgroundColor = L.stickers.left.style.backgroundColor;
        L.stickers.left.style.backgroundColor = tmp;

        tmp = LF.stickers.left.style.backgroundColor;
        LF.stickers.left.style.backgroundColor = RF.stickers.front.style.backgroundColor;
        RF.stickers.front.style.backgroundColor = RB.stickers.right.style.backgroundColor;
        RB.stickers.right.style.backgroundColor = LB.stickers.back.style.backgroundColor;
        LB.stickers.back.style.backgroundColor = tmp;

        tmp = LF.stickers.front.style.backgroundColor;
        LF.stickers.front.style.backgroundColor = RF.stickers.right.style.backgroundColor;
        RF.stickers.right.style.backgroundColor = RB.stickers.back.style.backgroundColor;
        RB.stickers.back.style.backgroundColor = LB.stickers.left.style.backgroundColor;
        LB.stickers.left.style.backgroundColor = tmp;
      }
    }

    function turnSCallback(qts) {
      var cycles = turnsToCycles(qts);
      var tmp;

      for(var i=0; i<cycles; i++) {
        tmp = U.stickers.up.style.backgroundColor;
        U.stickers.up.style.backgroundColor = L.stickers.left.style.backgroundColor;
        L.stickers.left.style.backgroundColor = D.stickers.down.style.backgroundColor;
        D.stickers.down.style.backgroundColor = R.stickers.right.style.backgroundColor;
        R.stickers.right.style.backgroundColor = tmp;

        tmp = UL.stickers.up.style.backgroundColor;
        UL.stickers.up.style.backgroundColor = DL.stickers.left.style.backgroundColor;
        DL.stickers.left.style.backgroundColor = DR.stickers.down.style.backgroundColor;
        DR.stickers.down.style.backgroundColor = UR.stickers.right.style.backgroundColor;
        UR.stickers.right.style.backgroundColor = tmp;

        tmp = UL.stickers.left.style.backgroundColor;
        UL.stickers.left.style.backgroundColor = DL.stickers.down.style.backgroundColor;
        DL.stickers.down.style.backgroundColor = DR.stickers.right.style.backgroundColor;
        DR.stickers.right.style.backgroundColor = UR.stickers.up.style.backgroundColor;
        UR.stickers.up.style.backgroundColor = tmp;
      }
    }

    function turnX(qts) {
      var cb = function() {
        turnLCallback(-qts);
        turnM1Callback(-qts);
        turnM2Callback(-qts);
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
        turnE1Callback(-qts);
        turnE2Callback(-qts);
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
        turnSCallback( qts);
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
        tmp = U1.stickers.up.style.backgroundColor;
        U1.stickers.up.style.backgroundColor = U3.stickers.up.style.backgroundColor;
        U3.stickers.up.style.backgroundColor = U4.stickers.up.style.backgroundColor;
        U4.stickers.up.style.backgroundColor = U2.stickers.up.style.backgroundColor;
        U2.stickers.up.style.backgroundColor = tmp;

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

        tmp = UL1.stickers.up.style.backgroundColor;
        UL1.stickers.up.style.backgroundColor = UF1.stickers.up.style.backgroundColor;
        UF1.stickers.up.style.backgroundColor = UR2.stickers.up.style.backgroundColor;
        UR2.stickers.up.style.backgroundColor = UB2.stickers.up.style.backgroundColor;
        UB2.stickers.up.style.backgroundColor = tmp;

        tmp = UL1.stickers.left.style.backgroundColor;
        UL1.stickers.left.style.backgroundColor  = UF1.stickers.front.style.backgroundColor;
        UF1.stickers.front.style.backgroundColor = UR2.stickers.right.style.backgroundColor;
        UR2.stickers.right.style.backgroundColor = UB2.stickers.back.style.backgroundColor;
        UB2.stickers.back.style.backgroundColor  = tmp;

        tmp = UL2.stickers.up.style.backgroundColor;
        UL2.stickers.up.style.backgroundColor = UF2.stickers.up.style.backgroundColor;
        UF2.stickers.up.style.backgroundColor = UR1.stickers.up.style.backgroundColor;
        UR1.stickers.up.style.backgroundColor = UB1.stickers.up.style.backgroundColor;
        UB1.stickers.up.style.backgroundColor = tmp;

        tmp = UL2.stickers.left.style.backgroundColor;
        UL2.stickers.left.style.backgroundColor  = UF2.stickers.front.style.backgroundColor;
        UF2.stickers.front.style.backgroundColor = UR1.stickers.right.style.backgroundColor;
        UR1.stickers.right.style.backgroundColor = UB1.stickers.back.style.backgroundColor;
        UB1.stickers.back.style.backgroundColor  = tmp;
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

    function turn2U(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnUCallback( qts);
        turnE1Callback(-qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        USLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElY(cubieContainer.el, -qts, cb);
        });
        ESLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElY(cubieContainer.el, -qts, cb);
        });
      } else {
        remaining++;
        cb();
      }
    }

    function turn3U(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnUCallback( qts);
        turnE1Callback(-qts);
        turnE2Callback(-qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        USLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElY(cubieContainer.el, -qts, cb);
        });
        ESLICE.forEach(function(cubieContainer) {
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

        tmp = DL.stickers.down.style.backgroundColor;
        DL.stickers.down.style.backgroundColor = DF.stickers.down.style.backgroundColor;
        DF.stickers.down.style.backgroundColor = DR.stickers.down.style.backgroundColor;
        DR.stickers.down.style.backgroundColor = DB.stickers.down.style.backgroundColor;
        DB.stickers.down.style.backgroundColor = tmp;

        tmp = DL.stickers.left.style.backgroundColor;
        DL.stickers.left.style.backgroundColor  = DF.stickers.front.style.backgroundColor;
        DF.stickers.front.style.backgroundColor = DR.stickers.right.style.backgroundColor;
        DR.stickers.right.style.backgroundColor = DB.stickers.back.style.backgroundColor;
        DB.stickers.back.style.backgroundColor  = tmp;
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

    function turn2D(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnDCallback(qts);
        turnE2Callback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        DSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElY(cubieContainer.el, qts, cb);
        });
        ESLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElY(cubieContainer.el, qts, cb);
        });
      } else {
        remaining++;
        cb();
      }
    }

    function turn3D(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnDCallback(qts);
        turnE1Callback(qts);
        turnE2Callback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        DSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElY(cubieContainer.el, qts, cb);
        });
        ESLICE.forEach(function(cubieContainer) {
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

        tmp = UL1.stickers.left.style.backgroundColor;
        UL1.stickers.left.style.backgroundColor = LF1.stickers.left.style.backgroundColor;
        LF1.stickers.left.style.backgroundColor = DL2.stickers.left.style.backgroundColor;
        DL2.stickers.left.style.backgroundColor = LB2.stickers.left.style.backgroundColor;
        LB2.stickers.left.style.backgroundColor = tmp;

        tmp = UL1.stickers.up.style.backgroundColor;
        UL1.stickers.up.style.backgroundColor    = LF1.stickers.front.style.backgroundColor;
        LF1.stickers.front.style.backgroundColor = DL2.stickers.down.style.backgroundColor;
        DL2.stickers.down.style.backgroundColor  = LB2.stickers.back.style.backgroundColor;
        LB2.stickers.back.style.backgroundColor  = tmp;

        tmp = UL2.stickers.left.style.backgroundColor;
        UL2.stickers.left.style.backgroundColor = LF2.stickers.left.style.backgroundColor;
        LF2.stickers.left.style.backgroundColor = DL1.stickers.left.style.backgroundColor;
        DL1.stickers.left.style.backgroundColor = LB1.stickers.left.style.backgroundColor;
        LB1.stickers.left.style.backgroundColor = tmp;

        tmp = UL2.stickers.up.style.backgroundColor;
        UL2.stickers.up.style.backgroundColor    = LF2.stickers.front.style.backgroundColor;
        LF2.stickers.front.style.backgroundColor = DL1.stickers.down.style.backgroundColor;
        DL1.stickers.down.style.backgroundColor  = LB1.stickers.back.style.backgroundColor;
        LB1.stickers.back.style.backgroundColor  = tmp;
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

    function turn2L(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnLCallback(qts);
        turnM1Callback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        LSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElX(cubieContainer.el, -qts, cb);
        });
        M1SLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElX(cubieContainer.el, -qts, cb);
        });
      } else {
        remaining++;
        cb();
      }
    }

    function turn3L(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnLCallback(qts);
        turnM1Callback(qts);
        turnM2Callback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        LSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElX(cubieContainer.el, -qts, cb);
        });
        M1SLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElX(cubieContainer.el, -qts, cb);
        });
        M2SLICE.forEach(function(cubieContainer) {
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
        tmp = R1.stickers.right.style.backgroundColor;
        R1.stickers.right.style.backgroundColor = R2.stickers.right.style.backgroundColor;
        R2.stickers.right.style.backgroundColor = R4.stickers.right.style.backgroundColor;
        R4.stickers.right.style.backgroundColor = R3.stickers.right.style.backgroundColor;
        R3.stickers.right.style.backgroundColor = tmp;

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

        tmp = UR1.stickers.right.style.backgroundColor;
        UR1.stickers.right.style.backgroundColor = RF1.stickers.right.style.backgroundColor;
        RF1.stickers.right.style.backgroundColor = DR2.stickers.right.style.backgroundColor;
        DR2.stickers.right.style.backgroundColor = RB2.stickers.right.style.backgroundColor;
        RB2.stickers.right.style.backgroundColor = tmp;

        tmp = UR1.stickers.up.style.backgroundColor;
        UR1.stickers.up.style.backgroundColor    = RF1.stickers.front.style.backgroundColor;
        RF1.stickers.front.style.backgroundColor = DR2.stickers.down.style.backgroundColor;
        DR2.stickers.down.style.backgroundColor  = RB2.stickers.back.style.backgroundColor;
        RB2.stickers.back.style.backgroundColor  = tmp;

        tmp = UR2.stickers.right.style.backgroundColor;
        UR2.stickers.right.style.backgroundColor = RF2.stickers.right.style.backgroundColor;
        RF2.stickers.right.style.backgroundColor = DR1.stickers.right.style.backgroundColor;
        DR1.stickers.right.style.backgroundColor = RB1.stickers.right.style.backgroundColor;
        RB1.stickers.right.style.backgroundColor = tmp;

        tmp = UR2.stickers.up.style.backgroundColor;
        UR2.stickers.up.style.backgroundColor    = RF2.stickers.front.style.backgroundColor;
        RF2.stickers.front.style.backgroundColor = DR1.stickers.down.style.backgroundColor;
        DR1.stickers.down.style.backgroundColor  = RB1.stickers.back.style.backgroundColor;
        RB1.stickers.back.style.backgroundColor  = tmp;
      }
    }

    function turnM1(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnM1Callback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        M1SLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElX(cubieContainer.el, -qts, cb);
        });
      } else {
        remaining++;
        cb();
      }
    }

    function turnM2(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnM2Callback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        M2SLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElX(cubieContainer.el, -qts, cb);
        });
      } else {
        remaining++;
        cb();
      }
    }

    function turnE1(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnE1Callback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        ESLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElY(cubieContainer.el, qts, cb);
        });
      } else {
        remaining++;
        cb();
      }
    }

    function turnE2(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnE2Callback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        ESLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElY(cubieContainer.el, qts, cb);
        });
      } else {
        remaining++;
        cb();
      }
    }

    function turnS1(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnS1Callback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        SSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElZ(cubieContainer.el, qts, cb);
        });
      } else {
        remaining++;
        cb();
      }
    }

    function turnS2(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnS2Callback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        SSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElZ(cubieContainer.el, qts, cb);
        });
      } else {
        remaining++;
        cb();
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

    function turn2R(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnRCallback( qts);
        turnM2Callback(-qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        RSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElX(cubieContainer.el, qts, cb);
        });
        M2SLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElX(cubieContainer.el, qts, cb);
        });
      } else {
        remaining++;
        cb();
      }
    }

    function turn3R(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnRCallback( qts);
        turnM1Callback(-qts);
        turnM2Callback(-qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        RSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElX(cubieContainer.el, qts, cb);
        });
        M1SLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElX(cubieContainer.el, qts, cb);
        });
        M2SLICE.forEach(function(cubieContainer) {
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
        tmp = F1.stickers.front.style.backgroundColor;
        F1.stickers.front.style.backgroundColor = F3.stickers.front.style.backgroundColor;
        F3.stickers.front.style.backgroundColor = F4.stickers.front.style.backgroundColor;
        F4.stickers.front.style.backgroundColor = F2.stickers.front.style.backgroundColor;
        F2.stickers.front.style.backgroundColor = tmp;

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

        tmp = UF1.stickers.front.style.backgroundColor;
        UF1.stickers.front.style.backgroundColor = LF2.stickers.front.style.backgroundColor;
        LF2.stickers.front.style.backgroundColor = DF2.stickers.front.style.backgroundColor;
        DF2.stickers.front.style.backgroundColor = RF1.stickers.front.style.backgroundColor;
        RF1.stickers.front.style.backgroundColor = tmp;

        tmp = UF1.stickers.up.style.backgroundColor;
        UF1.stickers.up.style.backgroundColor    = LF2.stickers.left.style.backgroundColor;
        LF2.stickers.left.style.backgroundColor  = DF2.stickers.down.style.backgroundColor;
        DF2.stickers.down.style.backgroundColor  = RF1.stickers.right.style.backgroundColor;
        RF1.stickers.right.style.backgroundColor = tmp;

        tmp = UF2.stickers.front.style.backgroundColor;
        UF2.stickers.front.style.backgroundColor = LF1.stickers.front.style.backgroundColor;
        LF1.stickers.front.style.backgroundColor = DF1.stickers.front.style.backgroundColor;
        DF1.stickers.front.style.backgroundColor = RF2.stickers.front.style.backgroundColor;
        RF2.stickers.front.style.backgroundColor = tmp;

        tmp = UF2.stickers.up.style.backgroundColor;
        UF2.stickers.up.style.backgroundColor    = LF1.stickers.left.style.backgroundColor;
        LF1.stickers.left.style.backgroundColor  = DF1.stickers.down.style.backgroundColor;
        DF1.stickers.down.style.backgroundColor  = RF2.stickers.right.style.backgroundColor;
        RF2.stickers.right.style.backgroundColor = tmp;
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

    function turn2F(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnFCallback(qts);
        turnSCallback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        FSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElZ(cubieContainer.el, qts, cb);
        });
        SSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElZ(cubieContainer.el, qts, cb);
        });
      } else {
        remaining++;
        cb();
      }
    }

    function turn3F(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnFCallback(qts);
        turnSCallback(qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        FSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElZ(cubieContainer.el, qts, cb);
        });
        SSLICE.forEach(function(cubieContainer) {
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

        tmp = UB.stickers.back.style.backgroundColor;
        UB.stickers.back.style.backgroundColor = LB.stickers.back.style.backgroundColor;
        LB.stickers.back.style.backgroundColor = DB.stickers.back.style.backgroundColor;
        DB.stickers.back.style.backgroundColor = RB.stickers.back.style.backgroundColor;
        RB.stickers.back.style.backgroundColor = tmp;

        tmp = UB.stickers.up.style.backgroundColor;
        UB.stickers.up.style.backgroundColor    = LB.stickers.left.style.backgroundColor;
        LB.stickers.left.style.backgroundColor  = DB.stickers.down.style.backgroundColor;
        DB.stickers.down.style.backgroundColor  = RB.stickers.right.style.backgroundColor;
        RB.stickers.right.style.backgroundColor = tmp;
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

    function turn2B(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnBCallback( qts);
        turnSCallback(-qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        BSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElZ(cubieContainer.el, -qts, cb);
        });
        SSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElZ(cubieContainer.el, -qts, cb);
        });
      } else {
        remaining++;
        cb();
      }
    }

    function turn3B(qts) {
      var remaining = 0;
      var cb = function() {
        if(--remaining !== 0) return;

        turnBCallback( qts);
        turnSCallback(-qts);

        turning = false;
        handleQueue();
      }

      if(animating) {
        BSLICE.forEach(function(cubieContainer) {
          remaining++;
          rotateElZ(cubieContainer.el, -qts, cb);
        });
        SSLICE.forEach(function(cubieContainer) {
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
      "2u": turn2U,
      "2r": turn2R,
      "2f": turn2F,
      "2d": turn2D,
      "2l": turn2L,
      "2b": turn2B,
      "3u": turn3U,
      "3r": turn3R,
      "3f": turn3F,
      "3d": turn3D,
      "3l": turn3L,
      "3b": turn3B,
      uw: turn2U,
      rw: turn2R,
      fw: turn2F,
      dw: turn2D,
      lw: turn2L,
      bw: turn2B,
      x:  turnX,
      y:  turnY,
      z:  turnZ,
      m1:  turnM1,
      m2:  turnM2,
      e1:  turnE1,
      e2:  turnE2,
      s1:  turnS1,
      s2:  turnS2
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
