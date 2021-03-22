(function() {
  var cubeCSS = new CubeCSS({container: document.querySelector(".cube-container")});
  window.cubeCSS = cubeCSS;

  var urlParams = new URLSearchParams(window.location.search);

  var preseq = [];
  if(urlParams.has("preseq")) {
    preseq = urlParams.get("preseq").split(",")
  }

  var seq = [];
  if(urlParams.has("seq")) {
    seq = urlParams.get("seq").split(",")
  }

  /*
  cubeCSS.slices.U.forEach(function(cc) {
    Object.values(cc.stickers).forEach(function(s) {
      s.style.backgroundColor = "#444"
    });
  })
  */

  /*
  document.addEventListener("keypress", function(e) {
    switch(e.key) {
      case "u":
        cubeCSS.u();
        break;
      case "d":
        cubeCSS.d();
        break;
      case "l":
        cubeCSS.l();
        break;
      case "r":
        cubeCSS.r();
        break;
      case "f":
        cubeCSS.f();
        break;
      case "b":
        cubeCSS.b();
        break;
      case "U":
        cubeCSS.ui();
        break;
      case "D":
        cubeCSS.di();
        break;
      case "L":
        cubeCSS.li();
        break;
      case "R":
        cubeCSS.ri();
        break;
      case "F":
        cubeCSS.fi();
        break;
      case "B":
        cubeCSS.bi();
        break;
    }
  }, false);
  */

  function performMove(move) {
    switch(move) {
      case "U":
        cubeCSS.u();
        break;
      case "D":
        cubeCSS.d();
        break;
      case "R":
        cubeCSS.r();
        break;
      case "L":
        cubeCSS.l();
        break;
      case "F":
        cubeCSS.f();
        break;
      case "B":
        cubeCSS.b();
        break;
      case "U'":
      case "Ui":
        cubeCSS.ui();
        break;
      case "D'":
      case "Di":
        cubeCSS.di();
        break;
      case "R'":
      case "Ri":
        cubeCSS.ri();
        break;
      case "L'":
      case "Li":
        cubeCSS.li();
        break;
      case "F'":
      case "Fi":
        cubeCSS.fi();
        break;
      case "B'":
      case "Bi":
        cubeCSS.bi();
        break;
      default:
        console.log("Invalid movement", move);
        break;
    }
  }

  cubeCSS.withoutAnimation(function() {
    preseq.forEach(function(move) {
      performMove(move);
    });

    cubeCSS.pause();

    seq.forEach(function(move) {
      performMove(move);
    });
  });

  document.querySelector("button.play").addEventListener("click", function() {
    cubeCSS.play();
  }, false);

  document.querySelector("button.pause").addEventListener("click", function() {
    cubeCSS.pause();
  }, false);

  document.querySelector("button.reset").addEventListener("click", function() {
    window.location.reload();
  }, false);

  document.querySelector("button.step").addEventListener("click", function() {
    cubeCSS.play();
    cubeCSS.pause();
  }, false);

  document.querySelector("button.finish").addEventListener("click", function() {
    cubeCSS.withoutAnimation(function() {
      cubeCSS.play();
    });
  }, false);

  /*
  var rotateWholeCube = function() {
    ry -= 360;

    setTimeout(function() {
      cubeCSS.el.style.transition = "transform 5s linear";
      cubeCSS.el.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
    })
  }

  setTimeout(rotateWholeCube, 1000);
  setTimeout(rotateWholeCube, 15000);
  */
})();
