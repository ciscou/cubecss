(function() {
  var FACES = ["up", "down", "right", "left", "front", "back"];
  var COLOR_BY_FACE = {
    up: "#ffd500",
    down: "#ffffff",
    right: "#b71234",
    left: "#ff5800",
    front: "#0046ad",
    back: "#009b48"
  };

  function buildSticker(position) {
    var sticker = document.createElement("div");
    sticker.classList.add("sticker");
    sticker.style.backgroundColor = COLOR_BY_FACE[position];

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

    if(hasSticker(x, y, z, position)) {
      face.appendChild(buildSticker(position));
    }

    return face;
  }

  function buildCubie(x, y, z) {
    var cubie = document.createElement("div");
    cubie.classList.add("cubie");

    cubie.style.transform = "translate3d(" + (x * 50) + "px, " + (y * 50) + "px, " + (z * 50 - 50) + "px)";

    FACES.forEach(function(face) {
      cubie.appendChild(buildFace(x, y, z, face));
    });

    return cubie;
  }

  function buildCubieContainer(x, y, z) {
    var cubieContainer = document.createElement("div");
    cubieContainer.classList.add("cubie-container");
    cubieContainer.style.transition = "transform 300ms ease-out";

    cubieContainer.appendChild(buildCubie(x, y, z));

    return cubieContainer;
  }

  function buildCube() {
    var cube = document.createElement("div");
    cube.classList.add("cube");

    for(var x=0; x<3; x++) {
      for(var y=0; y<3; y++) {
        for(var z=0; z<3; z++) {
          cube.appendChild(buildCubieContainer(x, y, z));
        }
      }
    }

    return cube;
  };

  animateCube();

  function rotateCubieContainerX(cubieContainer, qts, cb) {
    var transitionend = function() {
      if(cb) cb();

      transitionWas = cubieContainer.style.transition;
      cubieContainer.style.transition = "none";
      cubieContainer.style.transform = "";

      setTimeout(function() {
        cubieContainer.style.transition = transitionWas;
      });

      cubieContainer.removeEventListener("transitionend", transitionend, false);
    }

    if(cb) {
      cubieContainer.addEventListener("transitionend", transitionend, false);
    }

    var transform = "rotateX(" + (qts / 4) + "turn)";
    cubieContainer.style.transform = transform;
  }

  function rotateCubieContainerY(cubieContainer, qts, cb) {
    var transitionend = function() {
      if(cb) cb();

      transitionWas = cubieContainer.style.transition;
      cubieContainer.style.transition = "none";
      cubieContainer.style.transform = "";

      setTimeout(function() {
        cubieContainer.style.transition = transitionWas;
      });

      cubieContainer.removeEventListener("transitionend", transitionend, false);
    }

    if(cb) {
      cubieContainer.addEventListener("transitionend", transitionend, false);
    }

    var transform = "rotateY(" + (qts / 4) + "turn)";
    cubieContainer.style.transform = transform;
  }

  function rotateCubieContainerZ(cubieContainer, qts, cb) {
    var transitionend = function() {
      if(cb) cb();

      transitionWas = cubieContainer.style.transition;
      cubieContainer.style.transition = "none";
      cubieContainer.style.transform = "";

      setTimeout(function() {
        cubieContainer.style.transition = transitionWas;
      });

      cubieContainer.removeEventListener("transitionend", transitionend, false);
    }

    if(cb) {
      cubieContainer.addEventListener("transitionend", transitionend, false);
    }

    var transform = "rotateZ(" + (qts / 4) + "turn)";
    cubieContainer.style.transform = transform;
  }

  function animateCube() {
    var cube = buildCube();
    document.querySelector("body").appendChild(cube);

    var rx = -20;
    var ry = -20;
    var rz = 0;

    var rotateWholeCube = function() {
      cube.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
      ry -= 10;
      // rx -= 10;
    }

    setInterval(rotateWholeCube, 500);

    var cubieContainers = cube.querySelectorAll(".cubie-container");

    var cubieContainersByPosition = {
      ulb: cubieContainers[0],
      ul: cubieContainers[1],
      ulf: cubieContainers[2],
      lb: cubieContainers[3],
      l: cubieContainers[4],
      lf: cubieContainers[5],
      dlb: cubieContainers[6],
      dl: cubieContainers[7],
      dlf: cubieContainers[8],
      ub: cubieContainers[9],
      u: cubieContainers[10],
      uf: cubieContainers[11],
      b: cubieContainers[12],
      core: cubieContainers[13],
      f: cubieContainers[14],
      db: cubieContainers[15],
      d: cubieContainers[16],
      df: cubieContainers[17],
      urb: cubieContainers[18],
      ur: cubieContainers[19],
      urf: cubieContainers[20],
      rb: cubieContainers[21],
      r: cubieContainers[22],
      rf: cubieContainers[23],
      drb: cubieContainers[24],
      dr: cubieContainers[25],
      drf: cubieContainers[26]
    }

    window.cubieContainersByPosition = cubieContainersByPosition;

    function uSlice() {
      return [
        cubieContainersByPosition.ulb,
        cubieContainersByPosition.ul,
        cubieContainersByPosition.ulf,
        cubieContainersByPosition.ub,
        cubieContainersByPosition.u,
        cubieContainersByPosition.uf,
        cubieContainersByPosition.urb,
        cubieContainersByPosition.ur,
        cubieContainersByPosition.urf
      ];
    }

    function dSlice() {
      return [
        cubieContainersByPosition.dlb,
        cubieContainersByPosition.dl,
        cubieContainersByPosition.dlf,
        cubieContainersByPosition.db,
        cubieContainersByPosition.d,
        cubieContainersByPosition.df,
        cubieContainersByPosition.drb,
        cubieContainersByPosition.dr,
        cubieContainersByPosition.drf
      ];
    }

    function lSlice() {
      return [
        cubieContainersByPosition.ulb,
        cubieContainersByPosition.ul,
        cubieContainersByPosition.ulf,
        cubieContainersByPosition.lb,
        cubieContainersByPosition.l,
        cubieContainersByPosition.lf,
        cubieContainersByPosition.dlb,
        cubieContainersByPosition.dl,
        cubieContainersByPosition.dlf
      ];
    }

    function rSlice() {
      return [
        cubieContainersByPosition.urb,
        cubieContainersByPosition.ur,
        cubieContainersByPosition.urf,
        cubieContainersByPosition.rb,
        cubieContainersByPosition.r,
        cubieContainersByPosition.rf,
        cubieContainersByPosition.drb,
        cubieContainersByPosition.dr,
        cubieContainersByPosition.drf
      ];
    }

    function fSlice() {
      return [
        cubieContainersByPosition.ulf,
        cubieContainersByPosition.lf,
        cubieContainersByPosition.dlf,
        cubieContainersByPosition.uf,
        cubieContainersByPosition.f,
        cubieContainersByPosition.df,
        cubieContainersByPosition.urf,
        cubieContainersByPosition.rf,
        cubieContainersByPosition.drf
      ];
    }

    function bSlice() {
      return [
        cubieContainersByPosition.ulb,
        cubieContainersByPosition.lb,
        cubieContainersByPosition.dlb,
        cubieContainersByPosition.ub,
        cubieContainersByPosition.b,
        cubieContainersByPosition.db,
        cubieContainersByPosition.urb,
        cubieContainersByPosition.rb,
        cubieContainersByPosition.drb
      ];
    }

    function turnU(n) {
      var remaining = 9;
      var cb = function() {
        remaining--;
        if(remaining > 0) return;

        var tmp;

        for(var i=0; i<(n < 0 ? 3 : n); i++) {
          tmp = cubieContainersByPosition.ulb.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.ulb.querySelector(".cubie .face.up .sticker").style.backgroundColor = cubieContainersByPosition.ulf.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.ulf.querySelector(".cubie .face.up .sticker").style.backgroundColor = cubieContainersByPosition.urf.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.urf.querySelector(".cubie .face.up .sticker").style.backgroundColor = cubieContainersByPosition.urb.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.urb.querySelector(".cubie .face.up .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.ulb.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.ulb.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.ulf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.ulf.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.urf.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.urf.querySelector(".cubie .face.right .sticker").style.backgroundColor = cubieContainersByPosition.urb.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.urb.querySelector(".cubie .face.back .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.ulb.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.ulb.querySelector(".cubie .face.back .sticker").style.backgroundColor = cubieContainersByPosition.ulf.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.ulf.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.urf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.urf.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.urb.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.urb.querySelector(".cubie .face.right .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.ul.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.ul.querySelector(".cubie .face.up .sticker").style.backgroundColor = cubieContainersByPosition.uf.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.uf.querySelector(".cubie .face.up .sticker").style.backgroundColor = cubieContainersByPosition.ur.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.ur.querySelector(".cubie .face.up .sticker").style.backgroundColor = cubieContainersByPosition.ub.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.ub.querySelector(".cubie .face.up .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.ul.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.ul.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.uf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.uf.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.ur.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.ur.querySelector(".cubie .face.right .sticker").style.backgroundColor = cubieContainersByPosition.ub.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.ub.querySelector(".cubie .face.back .sticker").style.backgroundColor = tmp;
        }
      }

      uSlice().forEach(function(cubieContainer) {
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
          tmp = cubieContainersByPosition.dlb.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.dlb.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.dlf.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.dlf.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.drf.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.drf.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.drb.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.drb.querySelector(".cubie .face.down .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.dlb.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.dlb.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.dlf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.dlf.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.drf.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.drf.querySelector(".cubie .face.right .sticker").style.backgroundColor = cubieContainersByPosition.drb.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.drb.querySelector(".cubie .face.back .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.dlb.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.dlb.querySelector(".cubie .face.back .sticker").style.backgroundColor = cubieContainersByPosition.dlf.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.dlf.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.drf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.drf.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.drb.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.drb.querySelector(".cubie .face.right .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.dl.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.dl.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.df.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.df.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.dr.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.dr.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.db.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.db.querySelector(".cubie .face.down .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.dl.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.dl.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.df.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.df.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.dr.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.dr.querySelector(".cubie .face.right .sticker").style.backgroundColor = cubieContainersByPosition.db.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.db.querySelector(".cubie .face.back .sticker").style.backgroundColor = tmp;
        }
      }

      dSlice().forEach(function(cubieContainer) {
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
          tmp = cubieContainersByPosition.ulf.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.ulf.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.dlf.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.dlf.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.dlb.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.dlb.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.ulb.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.ulb.querySelector(".cubie .face.left .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.ulf.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.ulf.querySelector(".cubie .face.up .sticker").style.backgroundColor = cubieContainersByPosition.dlf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.dlf.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.dlb.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.dlb.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.ulb.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.ulb.querySelector(".cubie .face.back .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.ulf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.ulf.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.dlf.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.dlf.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.dlb.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.dlb.querySelector(".cubie .face.back .sticker").style.backgroundColor = cubieContainersByPosition.ulb.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.ulb.querySelector(".cubie .face.up .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.ul.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.ul.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.lf.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.lf.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.dl.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.dl.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.lb.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.lb.querySelector(".cubie .face.left .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.ul.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.ul.querySelector(".cubie .face.up .sticker").style.backgroundColor = cubieContainersByPosition.lf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.lf.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.dl.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.dl.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.lb.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.lb.querySelector(".cubie .face.back .sticker").style.backgroundColor = tmp;
        }
      }

      lSlice().forEach(function(cubieContainer) {
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
          tmp = cubieContainersByPosition.urf.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.urf.querySelector(".cubie .face.right .sticker").style.backgroundColor = cubieContainersByPosition.drf.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.drf.querySelector(".cubie .face.right .sticker").style.backgroundColor = cubieContainersByPosition.drb.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.drb.querySelector(".cubie .face.right .sticker").style.backgroundColor = cubieContainersByPosition.urb.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.urb.querySelector(".cubie .face.right .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.urf.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.urf.querySelector(".cubie .face.up .sticker").style.backgroundColor = cubieContainersByPosition.drf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.drf.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.drb.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.drb.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.urb.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.urb.querySelector(".cubie .face.back .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.urf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.urf.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.drf.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.drf.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.drb.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.drb.querySelector(".cubie .face.back .sticker").style.backgroundColor = cubieContainersByPosition.urb.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.urb.querySelector(".cubie .face.up .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.ur.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.ur.querySelector(".cubie .face.right .sticker").style.backgroundColor = cubieContainersByPosition.rf.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.rf.querySelector(".cubie .face.right .sticker").style.backgroundColor = cubieContainersByPosition.dr.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.dr.querySelector(".cubie .face.right .sticker").style.backgroundColor = cubieContainersByPosition.rb.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.rb.querySelector(".cubie .face.right .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.ur.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.ur.querySelector(".cubie .face.up .sticker").style.backgroundColor = cubieContainersByPosition.rf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.rf.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.dr.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.dr.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.rb.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.rb.querySelector(".cubie .face.back .sticker").style.backgroundColor = tmp;
        }
      }

      rSlice().forEach(function(cubieContainer) {
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
          tmp = cubieContainersByPosition.ulf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.ulf.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.dlf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.dlf.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.drf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.drf.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.urf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.urf.querySelector(".cubie .face.front .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.ulf.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.ulf.querySelector(".cubie .face.up .sticker").style.backgroundColor = cubieContainersByPosition.dlf.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.dlf.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.drf.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.drf.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.urf.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.urf.querySelector(".cubie .face.right .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.ulf.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.ulf.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.dlf.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.dlf.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.drf.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.drf.querySelector(".cubie .face.right .sticker").style.backgroundColor = cubieContainersByPosition.urf.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.urf.querySelector(".cubie .face.up .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.uf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.uf.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.lf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.lf.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.df.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.df.querySelector(".cubie .face.front .sticker").style.backgroundColor = cubieContainersByPosition.rf.querySelector(".cubie .face.front .sticker").style.backgroundColor;
          cubieContainersByPosition.rf.querySelector(".cubie .face.front .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.uf.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.uf.querySelector(".cubie .face.up .sticker").style.backgroundColor = cubieContainersByPosition.lf.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.lf.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.df.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.df.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.rf.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.rf.querySelector(".cubie .face.right .sticker").style.backgroundColor = tmp;
        }
      }

      fSlice().forEach(function(cubieContainer) {
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
          tmp = cubieContainersByPosition.ulb.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.ulb.querySelector(".cubie .face.back .sticker").style.backgroundColor = cubieContainersByPosition.dlb.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.dlb.querySelector(".cubie .face.back .sticker").style.backgroundColor = cubieContainersByPosition.drb.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.drb.querySelector(".cubie .face.back .sticker").style.backgroundColor = cubieContainersByPosition.urb.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.urb.querySelector(".cubie .face.back .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.ulb.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.ulb.querySelector(".cubie .face.up .sticker").style.backgroundColor = cubieContainersByPosition.dlb.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.dlb.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.drb.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.drb.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.urb.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.urb.querySelector(".cubie .face.right .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.ulb.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.ulb.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.dlb.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.dlb.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.drb.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.drb.querySelector(".cubie .face.right .sticker").style.backgroundColor = cubieContainersByPosition.urb.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.urb.querySelector(".cubie .face.up .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.ub.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.ub.querySelector(".cubie .face.back .sticker").style.backgroundColor = cubieContainersByPosition.lb.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.lb.querySelector(".cubie .face.back .sticker").style.backgroundColor = cubieContainersByPosition.db.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.db.querySelector(".cubie .face.back .sticker").style.backgroundColor = cubieContainersByPosition.rb.querySelector(".cubie .face.back .sticker").style.backgroundColor;
          cubieContainersByPosition.rb.querySelector(".cubie .face.back .sticker").style.backgroundColor = tmp;

          tmp = cubieContainersByPosition.ub.querySelector(".cubie .face.up .sticker").style.backgroundColor;
          cubieContainersByPosition.ub.querySelector(".cubie .face.up .sticker").style.backgroundColor = cubieContainersByPosition.lb.querySelector(".cubie .face.left .sticker").style.backgroundColor;
          cubieContainersByPosition.lb.querySelector(".cubie .face.left .sticker").style.backgroundColor = cubieContainersByPosition.db.querySelector(".cubie .face.down .sticker").style.backgroundColor;
          cubieContainersByPosition.db.querySelector(".cubie .face.down .sticker").style.backgroundColor = cubieContainersByPosition.rb.querySelector(".cubie .face.right .sticker").style.backgroundColor;
          cubieContainersByPosition.rb.querySelector(".cubie .face.right .sticker").style.backgroundColor = tmp;
        }
      }

      bSlice().forEach(function(cubieContainer) {
        rotateCubieContainerZ(cubieContainer, n, cb);
      });
    }

    document.addEventListener("keypress", function(e) {
      switch(e.key) {
        case "u":
          turnU(1);
          break;
        case "d":
          turnD(1);
          break;
        case "l":
          turnL(1);
          break;
        case "r":
          turnR(1);
          break;
        case "f":
          turnF(1);
          break;
        case "b":
          turnB(1);
          break;
      }
    }, false);
  }
})();
