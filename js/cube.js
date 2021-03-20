(function() {
  var FACES = ["up", "down", "right", "left", "front", "back"];

  function buildSticker() {
    var sticker = document.createElement("div");
    sticker.classList.add("sticker");

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
      face.appendChild(buildSticker());
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
    cubieContainer.dataset.rx = 0;
    cubieContainer.dataset.ry = 0;
    cubieContainer.dataset.rz = 0;

    cubieContainer.appendChild(buildCubie(x, y, z));

    return cubieContainer;
  }

  function buildCube() {
    var cube = document.createElement("div");
    cube.classList.add("cube");
    cube.dataset.rx = 0;
    cube.dataset.ry = 0;
    cube.dataset.rz = 0;

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

  function transformCubieContainer(cubieContainer, dx, dy, dz) {
    cubieContainer.dataset.rx = parseInt(cubieContainer.dataset.rx) + dx;
    cubieContainer.dataset.ry = parseInt(cubieContainer.dataset.ry) + dy;
    cubieContainer.dataset.rz = parseInt(cubieContainer.dataset.rz) + dz;

    var transform = "rotateX(" + cubieContainer.dataset.rx + "deg) rotateY(" + cubieContainer.dataset.ry + "deg) rotateZ(" + cubieContainer.dataset.rz + "deg)";
    cubieContainer.style.transform = transform;
  }

  function animateCube() {
    var cube = buildCube();
    document.querySelector("body").appendChild(cube);

    transformCubieContainer(cube, -20, -20, 0);

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

    function turnU() {
      uSlice().forEach(function(cubieContainer) {
        transformCubieContainer(cubieContainer, 0, -90, 0);
      });

      var tmp;

      tmp = cubieContainersByPosition.ulb;
      cubieContainersByPosition.ulb = cubieContainersByPosition.ulf;
      cubieContainersByPosition.ulf = cubieContainersByPosition.urf;
      cubieContainersByPosition.urf = cubieContainersByPosition.urb;
      cubieContainersByPosition.urb = tmp;

      tmp = cubieContainersByPosition.ul;
      cubieContainersByPosition.ul = cubieContainersByPosition.uf;
      cubieContainersByPosition.uf = cubieContainersByPosition.ur;
      cubieContainersByPosition.ur = cubieContainersByPosition.ub;
      cubieContainersByPosition.ub = tmp;

      console.log(cubieContainersByPosition, Object.keys(cubieContainersByPosition).length);
    }

    function turnL() {
      lSlice().forEach(function(cubieContainer) {
        transformCubieContainer(cubieContainer, -90, 0, 0);
      });

      var tmp;

      tmp = cubieContainersByPosition.ulb;
      cubieContainersByPosition.ulb = cubieContainersByPosition.dlb;
      cubieContainersByPosition.dlb = cubieContainersByPosition.dlf;
      cubieContainersByPosition.dlf = cubieContainersByPosition.ulf;
      cubieContainersByPosition.ulf = tmp;

      tmp = cubieContainersByPosition.ul;
      cubieContainersByPosition.ul = cubieContainersByPosition.lb;
      cubieContainersByPosition.lb = cubieContainersByPosition.dl;
      cubieContainersByPosition.dl = cubieContainersByPosition.lf;
      cubieContainersByPosition.lf = tmp;

      console.log(cubieContainersByPosition, Object.keys(cubieContainersByPosition).length);
    }

    function turnR() {
      rSlice().forEach(function(cubieContainer) {
        transformCubieContainer(cubieContainer, 90, 0, 0);
      });

      var tmp;

      tmp = cubieContainersByPosition.urb;
      cubieContainersByPosition.urb = cubieContainersByPosition.drb;
      cubieContainersByPosition.drb = cubieContainersByPosition.drf;
      cubieContainersByPosition.drf = cubieContainersByPosition.urf;
      cubieContainersByPosition.urf = tmp;

      tmp = cubieContainersByPosition.ur;
      cubieContainersByPosition.ur = cubieContainersByPosition.rb;
      cubieContainersByPosition.rb = cubieContainersByPosition.dr;
      cubieContainersByPosition.dr = cubieContainersByPosition.rf;
      cubieContainersByPosition.rf = tmp;

      console.log(cubieContainersByPosition, Object.keys(cubieContainersByPosition).length);
    }

    function turnY() {
      transformCubieContainer(cube, 0, -90, 0);
    }

    document.addEventListener("keypress", function(e) {
      switch(e.key) {
        case "u":
          turnU();
          break;
        case "l":
          turnL();
          break;
        case "r":
          turnR();
          break;
        case "y":
          turnY();
          break;
      }
    }, false);
  }
})();
