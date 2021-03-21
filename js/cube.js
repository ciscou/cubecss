(function() {
  function CubeCSS(options) {
    options ||= {};

    options.container  ||= document.querySelector("body");

    options.colorUp    ||= "#ffd500";
    options.colorDown  ||= "#ffffff";
    options.colorRight ||= "#b71234";
    options.colorLeft  ||= "#ff5800";
    options.colorFront ||= "#0046ad";
    options.colorBack  ||= "#009b48";

    options.cubieSize ||= 100;

    var CONTAINER = options.container;

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
      sticker.style.top = "10%";
      sticker.style.left = "10%";
      sticker.style.right = "10%";
      sticker.style.bottom = "10%";
      sticker.style.borderRadius = "10%";

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
      cubieContainer.style.transition = "transform 500ms ease-out";
      cubieContainer.style.position = "absolute";
      cubieContainer.style.width = "" + (CUBIE_SIZE * 3) + "px";
      cubieContainer.style.height = "" + (CUBIE_SIZE * 3) + "px";
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
      cube.style.transition = "transform 300ms ease-out";

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
    CONTAINER.appendChild(cube);

    var rx = -20;
    var ry = -20;
    var rz = 0;

    cube.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg)";

    /*
    var rotateWholeCube = function() {
      cube.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
      // ry -= 10;
      // rx -= 10;
    }

    setInterval(rotateWholeCube, 500);
    */

    var cubieContainers = cube.querySelectorAll(".cubie-container");

    var ULB  = cubieContainers[0];
    var UL   = cubieContainers[1];
    var ULF  = cubieContainers[2];
    var LB   = cubieContainers[3];
    var L    = cubieContainers[4];
    var LF   = cubieContainers[5];
    var DLB  = cubieContainers[6];
    var DL   = cubieContainers[7];
    var DLF  = cubieContainers[8];
    var UB   = cubieContainers[9];
    var U    = cubieContainers[10];
    var UF   = cubieContainers[11];
    var B    = cubieContainers[12];
    var CORE = cubieContainers[13];
    var F    = cubieContainers[14];
    var DB   = cubieContainers[15];
    var D    = cubieContainers[16];
    var DF   = cubieContainers[17];
    var URB  = cubieContainers[18];
    var UR   = cubieContainers[19];
    var URF  = cubieContainers[20];
    var RB   = cubieContainers[21];
    var R    = cubieContainers[22];
    var RF   = cubieContainers[23];
    var DRB  = cubieContainers[24];
    var DR   = cubieContainers[25];
    var DRF  = cubieContainers[26];

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

    function turnU(n) {
      var remaining = 9;
      var cb = function() {
        remaining--;
        if(remaining > 0) return;

        var tmp;

        for(var i=0; i<(n < 0 ? 3 : n); i++) {
          tmp = ULB.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          ULB.querySelector(".cubie .face.up .sticker").style.backgroundColor = ULF.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          ULF.querySelector(".cubie .face.up .sticker").style.backgroundColor = URF.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          URF.querySelector(".cubie .face.up .sticker").style.backgroundColor = URB.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          URB.querySelector(".cubie .face.up .sticker").style.backgroundColor = tmp;

          tmp = ULB.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          ULB.querySelector(".cubie .face.left .sticker").style.backgroundColor  = ULF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          ULF.querySelector(".cubie .face.front .sticker").style.backgroundColor = URF.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          URF.querySelector(".cubie .face.right .sticker").style.backgroundColor = URB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          URB.querySelector(".cubie .face.back .sticker").style.backgroundColor  = tmp;

          tmp = ULB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          ULB.querySelector(".cubie .face.back .sticker").style.backgroundColor  = ULF.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          ULF.querySelector(".cubie .face.left .sticker").style.backgroundColor  = URF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          URF.querySelector(".cubie .face.front .sticker").style.backgroundColor = URB.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          URB.querySelector(".cubie .face.right .sticker").style.backgroundColor = tmp;

          tmp = UL.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          UL.querySelector(".cubie .face.up .sticker").style.backgroundColor = UF.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          UF.querySelector(".cubie .face.up .sticker").style.backgroundColor = UR.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          UR.querySelector(".cubie .face.up .sticker").style.backgroundColor = UB.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          UB.querySelector(".cubie .face.up .sticker").style.backgroundColor = tmp;

          tmp = UL.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          UL.querySelector(".cubie .face.left .sticker").style.backgroundColor  = UF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          UF.querySelector(".cubie .face.front .sticker").style.backgroundColor = UR.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          UR.querySelector(".cubie .face.right .sticker").style.backgroundColor = UB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          UB.querySelector(".cubie .face.back .sticker").style.backgroundColor  = tmp;
        }

        turning = false;
        handleQueue();
      }

      USLICE.forEach(function(cubieContainer) {
        rotateCubieContainerY(cubieContainer, -n, cb);
      });
    }

    function turnD(n) {
      var remaining = 9;
      var cb = function() {
        remaining--;
        if(remaining > 0) return;

        var tmp;

        for(var i=0; i<(n < 0 ? 1 : 4 - n); i++) {
          tmp = DLB.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DLB.querySelector(".cubie .face.down .sticker").style.backgroundColor = DLF.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DLF.querySelector(".cubie .face.down .sticker").style.backgroundColor = DRF.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DRF.querySelector(".cubie .face.down .sticker").style.backgroundColor = DRB.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DRB.querySelector(".cubie .face.down .sticker").style.backgroundColor = tmp;

          tmp = DLB.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          DLB.querySelector(".cubie .face.left .sticker").style.backgroundColor  = DLF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          DLF.querySelector(".cubie .face.front .sticker").style.backgroundColor = DRF.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          DRF.querySelector(".cubie .face.right .sticker").style.backgroundColor = DRB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          DRB.querySelector(".cubie .face.back .sticker").style.backgroundColor  = tmp;

          tmp = DLB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          DLB.querySelector(".cubie .face.back .sticker").style.backgroundColor  = DLF.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          DLF.querySelector(".cubie .face.left .sticker").style.backgroundColor  = DRF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          DRF.querySelector(".cubie .face.front .sticker").style.backgroundColor = DRB.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          DRB.querySelector(".cubie .face.right .sticker").style.backgroundColor = tmp;

          tmp = DL.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DL.querySelector(".cubie .face.down .sticker").style.backgroundColor = DF.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DF.querySelector(".cubie .face.down .sticker").style.backgroundColor = DR.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DR.querySelector(".cubie .face.down .sticker").style.backgroundColor = DB.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DB.querySelector(".cubie .face.down .sticker").style.backgroundColor = tmp;

          tmp = DL.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          DL.querySelector(".cubie .face.left .sticker").style.backgroundColor  = DF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          DF.querySelector(".cubie .face.front .sticker").style.backgroundColor = DR.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          DR.querySelector(".cubie .face.right .sticker").style.backgroundColor = DB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          DB.querySelector(".cubie .face.back .sticker").style.backgroundColor  = tmp;
        }

        turning = false;
        handleQueue();
      }

      DSLICE.forEach(function(cubieContainer) {
        rotateCubieContainerY(cubieContainer, n, cb);
      });
    }

    function turnL(n) {
      var remaining = 9;
      var cb = function() {
        remaining--;
        if(remaining > 0) return;

        var tmp;

        for(var i=0; i<(n < 0 ? 1 : 4 - n); i++) {
          tmp = ULF.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          ULF.querySelector(".cubie .face.left .sticker").style.backgroundColor = DLF.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          DLF.querySelector(".cubie .face.left .sticker").style.backgroundColor = DLB.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          DLB.querySelector(".cubie .face.left .sticker").style.backgroundColor = ULB.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          ULB.querySelector(".cubie .face.left .sticker").style.backgroundColor = tmp;

          tmp = ULF.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          ULF.querySelector(".cubie .face.up .sticker").style.backgroundColor    = DLF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          DLF.querySelector(".cubie .face.front .sticker").style.backgroundColor = DLB.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DLB.querySelector(".cubie .face.down .sticker").style.backgroundColor  = ULB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          ULB.querySelector(".cubie .face.back .sticker").style.backgroundColor  = tmp;

          tmp = ULF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          ULF.querySelector(".cubie .face.front .sticker").style.backgroundColor = DLF.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DLF.querySelector(".cubie .face.down .sticker").style.backgroundColor  = DLB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          DLB.querySelector(".cubie .face.back .sticker").style.backgroundColor  = ULB.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          ULB.querySelector(".cubie .face.up .sticker").style.backgroundColor    = tmp;

          tmp = UL.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          UL.querySelector(".cubie .face.left .sticker").style.backgroundColor = LF.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          LF.querySelector(".cubie .face.left .sticker").style.backgroundColor = DL.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          DL.querySelector(".cubie .face.left .sticker").style.backgroundColor = LB.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          LB.querySelector(".cubie .face.left .sticker").style.backgroundColor = tmp;

          tmp = UL.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          UL.querySelector(".cubie .face.up .sticker").style.backgroundColor    = LF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          LF.querySelector(".cubie .face.front .sticker").style.backgroundColor = DL.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DL.querySelector(".cubie .face.down .sticker").style.backgroundColor  = LB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          LB.querySelector(".cubie .face.back .sticker").style.backgroundColor  = tmp;
        }

        turning = false;
        handleQueue();
      }

      LSLICE.forEach(function(cubieContainer) {
        rotateCubieContainerX(cubieContainer, -n, cb);
      });
    }

    function turnR(n) {
      var remaining = 9;
      var cb = function() {
        remaining--;
        if(remaining > 0) return;

        var tmp;

        for(var i=0; i<(n < 0 ? 3 : n); i++) {
          tmp = URF.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          URF.querySelector(".cubie .face.right .sticker").style.backgroundColor = DRF.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          DRF.querySelector(".cubie .face.right .sticker").style.backgroundColor = DRB.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          DRB.querySelector(".cubie .face.right .sticker").style.backgroundColor = URB.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          URB.querySelector(".cubie .face.right .sticker").style.backgroundColor = tmp;

          tmp = URF.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          URF.querySelector(".cubie .face.up .sticker").style.backgroundColor    = DRF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          DRF.querySelector(".cubie .face.front .sticker").style.backgroundColor = DRB.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DRB.querySelector(".cubie .face.down .sticker").style.backgroundColor  = URB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          URB.querySelector(".cubie .face.back .sticker").style.backgroundColor  = tmp;

          tmp = URF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          URF.querySelector(".cubie .face.front .sticker").style.backgroundColor = DRF.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DRF.querySelector(".cubie .face.down .sticker").style.backgroundColor  = DRB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          DRB.querySelector(".cubie .face.back .sticker").style.backgroundColor  = URB.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          URB.querySelector(".cubie .face.up .sticker").style.backgroundColor    = tmp;

          tmp = UR.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          UR.querySelector(".cubie .face.right .sticker").style.backgroundColor = RF.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          RF.querySelector(".cubie .face.right .sticker").style.backgroundColor = DR.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          DR.querySelector(".cubie .face.right .sticker").style.backgroundColor = RB.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          RB.querySelector(".cubie .face.right .sticker").style.backgroundColor = tmp;

          tmp = UR.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          UR.querySelector(".cubie .face.up .sticker").style.backgroundColor    = RF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          RF.querySelector(".cubie .face.front .sticker").style.backgroundColor = DR.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DR.querySelector(".cubie .face.down .sticker").style.backgroundColor  = RB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          RB.querySelector(".cubie .face.back .sticker").style.backgroundColor  = tmp;
        }

        turning = false;
        handleQueue();
      }

      RSLICE.forEach(function(cubieContainer) {
        rotateCubieContainerX(cubieContainer, n, cb);
      });
    }

    function turnF(n) {
      var remaining = 9;
      var cb = function() {
        remaining--;
        if(remaining > 0) return;

        var tmp;

        for(var i=0; i<(n < 0 ? 3 : n); i++) {
          tmp = ULF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          ULF.querySelector(".cubie .face.front .sticker").style.backgroundColor = DLF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          DLF.querySelector(".cubie .face.front .sticker").style.backgroundColor = DRF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          DRF.querySelector(".cubie .face.front .sticker").style.backgroundColor = URF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          URF.querySelector(".cubie .face.front .sticker").style.backgroundColor = tmp;

          tmp = ULF.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          ULF.querySelector(".cubie .face.up .sticker").style.backgroundColor    = DLF.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          DLF.querySelector(".cubie .face.left .sticker").style.backgroundColor  = DRF.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DRF.querySelector(".cubie .face.down .sticker").style.backgroundColor  = URF.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          URF.querySelector(".cubie .face.right .sticker").style.backgroundColor = tmp;

          tmp = ULF.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          ULF.querySelector(".cubie .face.left .sticker").style.backgroundColor  = DLF.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DLF.querySelector(".cubie .face.down .sticker").style.backgroundColor  = DRF.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          DRF.querySelector(".cubie .face.right .sticker").style.backgroundColor = URF.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          URF.querySelector(".cubie .face.up .sticker").style.backgroundColor    = tmp;

          tmp = UF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          UF.querySelector(".cubie .face.front .sticker").style.backgroundColor = LF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          LF.querySelector(".cubie .face.front .sticker").style.backgroundColor = DF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          DF.querySelector(".cubie .face.front .sticker").style.backgroundColor = RF.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          RF.querySelector(".cubie .face.front .sticker").style.backgroundColor = tmp;

          tmp = UF.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          UF.querySelector(".cubie .face.up .sticker").style.backgroundColor    = LF.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          LF.querySelector(".cubie .face.left .sticker").style.backgroundColor  = DF.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DF.querySelector(".cubie .face.down .sticker").style.backgroundColor  = RF.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          RF.querySelector(".cubie .face.right .sticker").style.backgroundColor = tmp;
        }

        turning = false;
        handleQueue();
      }

      FSLICE.forEach(function(cubieContainer) {
        rotateCubieContainerZ(cubieContainer, n, cb);
      });
    }

    function turnB(n) {
      var remaining = 9;
      var cb = function() {
        remaining--;
        if(remaining > 0) return;

        var tmp;

        for(var i=0; i<(n < 0 ? 3 : n); i++) {
          tmp = ULB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          ULB.querySelector(".cubie .face.back .sticker").style.backgroundColor = DLB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          DLB.querySelector(".cubie .face.back .sticker").style.backgroundColor = DRB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          DRB.querySelector(".cubie .face.back .sticker").style.backgroundColor = URB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          URB.querySelector(".cubie .face.back .sticker").style.backgroundColor = tmp;

          tmp = ULB.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          ULB.querySelector(".cubie .face.up .sticker").style.backgroundColor    = DLB.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          DLB.querySelector(".cubie .face.left .sticker").style.backgroundColor  = DRB.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DRB.querySelector(".cubie .face.down .sticker").style.backgroundColor  = URB.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          URB.querySelector(".cubie .face.right .sticker").style.backgroundColor = tmp;

          tmp = ULB.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          ULB.querySelector(".cubie .face.left .sticker").style.backgroundColor  = DLB.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DLB.querySelector(".cubie .face.down .sticker").style.backgroundColor  = DRB.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          DRB.querySelector(".cubie .face.right .sticker").style.backgroundColor = URB.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          URB.querySelector(".cubie .face.up .sticker").style.backgroundColor    = tmp;

          tmp = UB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          UB.querySelector(".cubie .face.back .sticker").style.backgroundColor = LB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          LB.querySelector(".cubie .face.back .sticker").style.backgroundColor = DB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          DB.querySelector(".cubie .face.back .sticker").style.backgroundColor = RB.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          RB.querySelector(".cubie .face.back .sticker").style.backgroundColor = tmp;

          tmp = UB.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          UB.querySelector(".cubie .face.up .sticker").style.backgroundColor    = LB.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          LB.querySelector(".cubie .face.left .sticker").style.backgroundColor  = DB.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          DB.querySelector(".cubie .face.down .sticker").style.backgroundColor  = RB.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          RB.querySelector(".cubie .face.right .sticker").style.backgroundColor = tmp;
        }

        turning = false;
        handleQueue();
      }

      BSLICE.forEach(function(cubieContainer) {
        rotateCubieContainerZ(cubieContainer, n, cb);
      });
    }

    var queue = [];
    var turning = false;

    function handleQueue() {
      if(!turning) {
        if(queue.length > 0) {
          turning = true;
          var fq = queue.shift();
          setTimeout(function() { fq[0](fq[1]) });
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
  }

  var cubeCSS = new CubeCSS({cubieSize: 50});
  window.cubeCSS = cubeCSS;

  document.addEventListener("keypress", function(e) {
    switch(e.key) {
      case "u":
        queue.push([turnU, 1]);
        break;
      case "d":
        queue.push([turnD, 1]);
        break;
      case "l":
        queue.push([turnL, 1]);
        break;
      case "r":
        queue.push([turnR, 1]);
        break;
      case "f":
        queue.push([turnF, 1]);
        break;
      case "b":
        queue.push([turnB, 1]);
        break;
    }

    handleQueue();
  }, false);

  setTimeout(function() {
    cubeCSS.r();
    cubeCSS.u();
    cubeCSS.ri();
    cubeCSS.ui();
    cubeCSS.ri();
    cubeCSS.f();
    cubeCSS.r2();
    cubeCSS.ui();
    cubeCSS.ri();
    cubeCSS.ui();
    cubeCSS.r();
    cubeCSS.u();
    cubeCSS.ri();
    cubeCSS.fi();
  }, 500);
})();
