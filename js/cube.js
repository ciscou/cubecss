(function() {
  function CubeCSS(options) {
    options ||= {};

    options.colorUp    ||= "#ffd500";
    options.colorDown  ||= "#ffffff";
    options.colorRight ||= "#b71234";
    options.colorLeft  ||= "#ff5800";
    options.colorFront ||= "#0046ad";
    options.colorBack  ||= "#009b48";

    var CONTAINER = options.container;

    options.cubieSize ||= CONTAINER.offsetWidth / 6;

    var COLOR_BY_FACE = {
      up: options.colorUp,
      down: options.colorDown,
      right: options.colorRight,
      left: options.colorLeft,
      front: options.colorFront,
      back:options.colorBack
    };

    var CUBIE_SIZE = options.cubieSize;

    function buildSticker(position) {
      var sticker = document.createElement("div");
      sticker.classList.add("sticker");
      sticker.style.backgroundColor = COLOR_BY_FACE[position];
      sticker.style.position = "absolute";
      sticker.style.top = "8%";
      sticker.style.left = "8%";
      sticker.style.right = "8%";
      sticker.style.bottom = "8%";
      sticker.style.borderRadius = "8%";

      return sticker;
    }

    function hasSticker(x, y, z, position) {
      if((x === 0) && (position === "left"))
        return true;
      if((x === 2) && (position === "right"))
        return true;
      if((y === 0) && (position === "up"))
        return true;
      if((y === 2) && (position === "down"))
        return true;
      if((z === 2) && (position === "front"))
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
      face.style.width = "" + CUBIE_SIZE + "px";
      face.style.height = "" + CUBIE_SIZE + "px";
      face.style.backgroundColor = "black";
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

      cubie.style.transform = "translate3d(" + (x * CUBIE_SIZE) + "px, " + (y * CUBIE_SIZE) + "px, " + (z * CUBIE_SIZE - CUBIE_SIZE) + "px)";
      cubie.style.transformStyle = "preserve-3d";

      ["up", "down", "right", "left", "front", "back"].forEach(function(face) {
        cubie.appendChild(buildFace(x, y, z, face));
      });

      return cubie;
    }

    function buildCubieContainer(x, y, z) {
      var cubieContainer = document.createElement("div");
      cubieContainer.classList.add("cubie-container");
      cubieContainer.style.transition = "transform 350ms ease-out";
      cubieContainer.style.position = "absolute";
      cubieContainer.style.top = "0";
      cubieContainer.style.left = "0";
      cubieContainer.style.bottom = "0";
      cubieContainer.style.right = "0";
      cubieContainer.style.transformStyle = "preserve-3d";

      cubieContainer.appendChild(buildCubie(x, y, z));

      return cubieContainer;
    }

    function buildCube() {
      var cube = document.createElement("div");
      cube.classList.add("cube");

      cube.style.position = "relative";
      cube.style.width = "" + (CUBIE_SIZE * 3) + "px";
      cube.style.height = "" + (CUBIE_SIZE * 3) + "px";
      cube.style.transformStyle = "preserve-3d";

      var rx = -25;
      var ry = -45;
      var rz = 0;

      var lastTouchX;
      var lastTouchY;
      var dragging;

      cube.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg) rotateZ(" + rz + "deg)";

      var handleTouchStart = function(e) {
        e.preventDefault();
        e.stopPropagation();

        dragging = true;
        lastTouchX = e.clientX || e.touches[0].clientX;
        lastTouchY = e.clientY || e.touches[0].clientY;
      }

      var handleTouchMove = function(e) {
        e.preventDefault();
        e.stopPropagation();

        if(!dragging) return;

        var touchX = e.clientX || e.touches[0].clientX;
        var touchY = e.clientY || e.touches[0].clientY;

        var dx = touchX - lastTouchX;
        var dy = touchY - lastTouchY;

        ry += dx / 2;
        rx -= dy / 2;

        if(rx < -45) rx = -45;
        if(rx >  45) rx =  45;

        lastTouchX = e.clientX || e.touches[0].clientX;
        lastTouchY = e.clientY || e.touches[0].clientY;

        cube.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg) rotateZ(" + rz + "deg)";
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

      for(var x=0; x<3; x++) {
        for(var y=0; y<3; y++) {
          for(var z=0; z<3; z++) {
            cube.appendChild(buildCubieContainer(x, y, z));
          }
        }
      }

      return cube;
    };

    function rotateCubieContainer(cubieContainer, qts, axis, cb) {
      var transitionend = function() {
        cb();

        transitionWas = cubieContainer.style.transition;
        cubieContainer.style.transition = "none";
        cubieContainer.style.transform = "";

        setTimeout(function() {
          cubieContainer.style.transition = transitionWas;
        });

        cubieContainer.removeEventListener("transitionend", transitionend, false);
      }

      cubieContainer.addEventListener("transitionend", transitionend, false);

      var transform = "rotate" + axis + "(" + (qts / 4) + "turn)";
      cubieContainer.style.transform = transform;
    }

    function rotateCubieContainerX(cubieContainer, qts, cb) {
      rotateCubieContainer(cubieContainer, qts, "X", cb);
    }

    function rotateCubieContainerY(cubieContainer, qts, cb) {
      rotateCubieContainer(cubieContainer, qts, "Y", cb);
    }

    function rotateCubieContainerZ(cubieContainer, qts, cb) {
      rotateCubieContainer(cubieContainer, qts, "Z", cb);
    }

    var cube = buildCube();
    cubeWrapper = document.createElement("div");
    cubeWrapper.style.display = "flex";
    cubeWrapper.style.justifyContent = "center";
    cubeWrapper.style.alignItems = "center";
    cubeWrapper.style.height = (CUBIE_SIZE * 5.5) + "px"
    cubeWrapper.classList.add("cube-wrapper");
    cubeWrapper.appendChild(cube);
    CONTAINER.appendChild(cubeWrapper);

    this.el = cube;

    cube.style.transform = "rotateX(-25deg) rotateY(-45deg)";

    var cubieContainers = cube.querySelectorAll(".cubie-container");

    var ULB  = { el: cubieContainers[0]  };
    var UL   = { el: cubieContainers[1]  };
    var ULF  = { el: cubieContainers[2]  };
    var LB   = { el: cubieContainers[3]  };
    var L    = { el: cubieContainers[4]  };
    var LF   = { el: cubieContainers[5]  };
    var DLB  = { el: cubieContainers[6]  };
    var DL   = { el: cubieContainers[7]  };
    var DLF  = { el: cubieContainers[8]  };
    var UB   = { el: cubieContainers[9]  };
    var U    = { el: cubieContainers[10] };
    var UF   = { el: cubieContainers[11] };
    var B    = { el: cubieContainers[12] };
    var CORE = { el: cubieContainers[13] };
    var F    = { el: cubieContainers[14] };
    var DB   = { el: cubieContainers[15] };
    var D    = { el: cubieContainers[16] };
    var DF   = { el: cubieContainers[17] };
    var URB  = { el: cubieContainers[18] };
    var UR   = { el: cubieContainers[19] };
    var URF  = { el: cubieContainers[20] };
    var RB   = { el: cubieContainers[21] };
    var R    = { el: cubieContainers[22] };
    var RF   = { el: cubieContainers[23] };
    var DRB  = { el: cubieContainers[24] };
    var DR   = { el: cubieContainers[25] };
    var DRF  = { el: cubieContainers[26] };

    this.cubies = {
      ULB: ULB,
      UL: UL,
      ULF: ULF,
      LB: LB,
      L: L,
      LF: LF,
      DLB: DLB,
      DL: DL,
      DLF: DLF,
      UB: UB,
      U: U,
      UF: UF,
      B: B,
      CORE: CORE,
      F: F,
      DB: DB,
      D: D,
      DF: DF,
      URB: URB,
      UR: UR,
      URF: URF,
      RB: RB,
      R: R,
      RF: RF,
      DRB: DRB,
      DR: DR,
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
      UL,
      ULF,
      UB,
      U,
      UF,
      URB,
      UR,
      URF
    ];

    var DSLICE = [
      DLB,
      DL,
      DLF,
      DB,
      D,
      DF,
      DRB,
      DR,
      DRF
    ];

    var LSLICE = [
      ULB,
      UL,
      ULF,
      LB,
      L,
      LF,
      DLB,
      DL,
      DLF
    ];

    var RSLICE = [
      URB,
      UR,
      URF,
      RB,
      R,
      RF,
      DRB,
      DR,
      DRF
    ];

    var FSLICE = [
      ULF,
      LF,
      DLF,
      UF,
      F,
      DF,
      URF,
      RF,
      DRF
    ];

    var BSLICE = [
      ULB,
      LB,
      DLB,
      UB,
      B,
      DB,
      URB,
      RB,
      DRB
    ];

    this.slices = {
      U: USLICE,
      D: DSLICE,
      R: RSLICE,
      L: LSLICE,
      F: FSLICE,
      B: BSLICE
    }

    function turnU(n) {
      var remaining = 9;
      var cb = function() {
        remaining--;
        if((remaining > 0) && animating) return;

        var tmp;

        for(var i=0; i<(n < 0 ? 3 : n); i++) {
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

          tmp = UL.stickers.up.style.backgroundColor;
          UL.stickers.up.style.backgroundColor = UF.stickers.up.style.backgroundColor;
          UF.stickers.up.style.backgroundColor = UR.stickers.up.style.backgroundColor;
          UR.stickers.up.style.backgroundColor = UB.stickers.up.style.backgroundColor;
          UB.stickers.up.style.backgroundColor = tmp;

          tmp = UL.stickers.left.style.backgroundColor;
          UL.stickers.left.style.backgroundColor  = UF.stickers.front.style.backgroundColor;
          UF.stickers.front.style.backgroundColor = UR.stickers.right.style.backgroundColor;
          UR.stickers.right.style.backgroundColor = UB.stickers.back.style.backgroundColor;
          UB.stickers.back.style.backgroundColor  = tmp;
        }

        turning = false;
        handleQueue();
      }

      if(animating) {
        USLICE.forEach(function(cubieContainer) {
          rotateCubieContainerY(cubieContainer.el, -n, cb);
        });
      } else {
        cb();
      }
    }

    function turnD(n) {
      var remaining = 9;
      var cb = function() {
        remaining--;
        if((remaining > 0) && animating) return;

        var tmp;

        for(var i=0; i<(n < 0 ? 1 : 4 - n); i++) {
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

        turning = false;
        handleQueue();
      }

      if(animating) {
        DSLICE.forEach(function(cubieContainer) {
          rotateCubieContainerY(cubieContainer.el, n, cb);
        });
      } else {
        cb();
      }
    }

    function turnL(n) {
      var remaining = 9;
      var cb = function() {
        remaining--;
        if((remaining > 0) && animating) return;

        var tmp;

        for(var i=0; i<(n < 0 ? 1 : 4 - n); i++) {
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

          tmp = UL.stickers.left.style.backgroundColor;
          UL.stickers.left.style.backgroundColor = LF.stickers.left.style.backgroundColor;
          LF.stickers.left.style.backgroundColor = DL.stickers.left.style.backgroundColor;
          DL.stickers.left.style.backgroundColor = LB.stickers.left.style.backgroundColor;
          LB.stickers.left.style.backgroundColor = tmp;

          tmp = UL.stickers.up.style.backgroundColor;
          UL.stickers.up.style.backgroundColor    = LF.stickers.front.style.backgroundColor;
          LF.stickers.front.style.backgroundColor = DL.stickers.down.style.backgroundColor;
          DL.stickers.down.style.backgroundColor  = LB.stickers.back.style.backgroundColor;
          LB.stickers.back.style.backgroundColor  = tmp;
        }

        turning = false;
        handleQueue();
      }

      if(animating) {
        LSLICE.forEach(function(cubieContainer) {
          rotateCubieContainerX(cubieContainer.el, -n, cb);
        });
      } else {
        cb();
      }
    }

    function turnR(n) {
      var remaining = 9;
      var cb = function() {
        remaining--;
        if((remaining > 0) && animating) return;

        var tmp;

        for(var i=0; i<(n < 0 ? 3 : n); i++) {
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

          tmp = UR.stickers.right.style.backgroundColor;
          UR.stickers.right.style.backgroundColor = RF.stickers.right.style.backgroundColor;
          RF.stickers.right.style.backgroundColor = DR.stickers.right.style.backgroundColor;
          DR.stickers.right.style.backgroundColor = RB.stickers.right.style.backgroundColor;
          RB.stickers.right.style.backgroundColor = tmp;

          tmp = UR.stickers.up.style.backgroundColor;
          UR.stickers.up.style.backgroundColor    = RF.stickers.front.style.backgroundColor;
          RF.stickers.front.style.backgroundColor = DR.stickers.down.style.backgroundColor;
          DR.stickers.down.style.backgroundColor  = RB.stickers.back.style.backgroundColor;
          RB.stickers.back.style.backgroundColor  = tmp;
        }

        turning = false;
        handleQueue();
      }

      if(animating) {
        RSLICE.forEach(function(cubieContainer) {
          rotateCubieContainerX(cubieContainer.el, n, cb);
        });
      } else {
        cb();
      }
    }

    function turnF(n) {
      var remaining = 9;
      var cb = function() {
        remaining--;
        if((remaining > 0) && animating) return;

        var tmp;

        for(var i=0; i<(n < 0 ? 3 : n); i++) {
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

          tmp = UF.stickers.front.style.backgroundColor;
          UF.stickers.front.style.backgroundColor = LF.stickers.front.style.backgroundColor;
          LF.stickers.front.style.backgroundColor = DF.stickers.front.style.backgroundColor;
          DF.stickers.front.style.backgroundColor = RF.stickers.front.style.backgroundColor;
          RF.stickers.front.style.backgroundColor = tmp;

          tmp = UF.stickers.up.style.backgroundColor;
          UF.stickers.up.style.backgroundColor    = LF.stickers.left.style.backgroundColor;
          LF.stickers.left.style.backgroundColor  = DF.stickers.down.style.backgroundColor;
          DF.stickers.down.style.backgroundColor  = RF.stickers.right.style.backgroundColor;
          RF.stickers.right.style.backgroundColor = tmp;
        }

        turning = false;
        handleQueue();
      }

      if(animating) {
        FSLICE.forEach(function(cubieContainer) {
          rotateCubieContainerZ(cubieContainer.el, n, cb);
        });
      } else {
        cb();
      }
    }

    function turnB(n) {
      var remaining = 9;
      var cb = function() {
        remaining--;
        if((remaining > 0) && animating) return;

        var tmp;

        for(var i=0; i<(n < 0 ? 3 : n); i++) {
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

        turning = false;
        handleQueue();
      }

      if(animating) {
        BSLICE.forEach(function(cubieContainer) {
          rotateCubieContainerZ(cubieContainer.el, n, cb);
        });
      } else {
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
      if(!playing) return;

      if(queueIdx < queue.length) {
        turning = true;
        var fq = queue[queueIdx++];
        if(animating) {
          setTimeout(function() { fq[0](fq[1]) });
        } else {
          fq[0](fq[1]);
        }
      }
    }

    this.u = function()  { queue.push([turnU,  1]); handleQueue() };
    this.r = function()  { queue.push([turnR,  1]); handleQueue() };
    this.f = function()  { queue.push([turnF,  1]); handleQueue() };
    this.d = function()  { queue.push([turnD,  1]); handleQueue() };
    this.l = function()  { queue.push([turnL,  1]); handleQueue() };
    this.b = function()  { queue.push([turnB,  1]); handleQueue() };
    this.ui = function() { queue.push([turnU, -1]); handleQueue() };
    this.ri = function() { queue.push([turnR, -1]); handleQueue() };
    this.fi = function() { queue.push([turnF, -1]); handleQueue() };
    this.di = function() { queue.push([turnD, -1]); handleQueue() };
    this.li = function() { queue.push([turnL, -1]); handleQueue() };
    this.bi = function() { queue.push([turnB, -1]); handleQueue() };
    this.u2 = function() { queue.push([turnU,  2]); handleQueue() };
    this.r2 = function() { queue.push([turnR,  2]); handleQueue() };
    this.f2 = function() { queue.push([turnF,  2]); handleQueue() };
    this.d2 = function() { queue.push([turnD,  2]); handleQueue() };
    this.l2 = function() { queue.push([turnL,  2]); handleQueue() };
    this.b2 = function() { queue.push([turnB,  2]); handleQueue() };

    this.withoutAnimation = function(cb) { var animatingWas = animating; animating = false; cb(); animating = animatingWas };
    this.pause = function() { playing = false; };
    this.play = function() { playing = true; handleQueue() };
  }

  window.CubeCSS = CubeCSS;
})();
