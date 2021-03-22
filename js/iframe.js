(function() {
  var urlParams = new URLSearchParams(window.location.search);

  var preseq = [];
  if(urlParams.has("preseq")) {
    preseq = urlParams.get("preseq").split(",")
  }

  var seq = [];
  if(urlParams.has("seq")) {
    seq = urlParams.get("seq").split(",")
  }

  var stickerless = [];
  if(urlParams.has("stickerless")) {
    stickerless = urlParams.get("stickerless").split(",")
  }

  var colorUp    = urlParams.get("clru");
  var colorDown  = urlParams.get("clrd");
  var colorLeft  = urlParams.get("clrl");
  var colorRight = urlParams.get("clrr");
  var colorFront = urlParams.get("clrf");
  var colorBack  = urlParams.get("clrb");

  var cubeCSS = new CubeCSS({
    container: document.querySelector(".cube-container"),
    colorUp: colorUp,
    colorDown: colorDown,
    colorRight: colorRight,
    colorLeft: colorLeft,
    colorFront: colorFront,
    colorBack: colorBack
  });


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
      case "U2":
        cubeCSS.u2();
        break;
      case "D2":
        cubeCSS.d2();
        break;
      case "R2":
        cubeCSS.r2();
        break;
      case "L2":
        cubeCSS.l2();
        break;
      case "F2":
        cubeCSS.f2();
        break;
      case "B2":
        cubeCSS.b2();
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

    stickerless.forEach(function(cubie) {
      var c = cubeCSS.cubies[cubie];
      if(!c) {
        console.log("Invalid cubie", cubie);
        return;
      }

      Object.values(c.stickers).forEach(function(s) {
        s.style.backgroundColor = "#444";
      });
    });

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
})();
