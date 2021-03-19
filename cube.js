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

  var cube = buildCube();
  document.querySelector("body").appendChild(cube);

  var cubieContainers = cube.querySelectorAll(".cubie-container");

  var rx=-20;
  var ry=-20;
  var rz=0;
  var l = 0;
  var u = 0;

  var tickCounter = 0;

  function tick() {
    cube.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg) rotateZ(" + rz + "deg)";

    for(var i=0; i<9; i++) {
      cubieContainers[i].style.transform = "rotateX(" + l + "deg)"
    }

    cubieContainers[0].style.transform = "rotateY(" + u + "deg)"
    cubieContainers[1].style.transform = "rotateY(" + u + "deg)"
    cubieContainers[2].style.transform = "rotateY(" + u + "deg)"
    cubieContainers[9].style.transform = "rotateY(" + u + "deg)"
    cubieContainers[10].style.transform = "rotateY(" + u + "deg)"
    cubieContainers[11].style.transform = "rotateY(" + u + "deg)"
    cubieContainers[18].style.transform = "rotateY(" + u + "deg)"
    cubieContainers[19].style.transform = "rotateY(" + u + "deg)"
    cubieContainers[20].style.transform = "rotateY(" + u + "deg)"

    rx -= 0;
    ry -= 15;
    rz += 0;

    // l -= 90;
    u -= 90;
    tickCounter += 1
  }

  setInterval(tick, 1000);
  // tick();
})();
