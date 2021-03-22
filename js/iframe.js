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

  var options = {
    container: document.querySelector(".cube-container"),
    colorUp: colorUp,
    colorDown: colorDown,
    colorRight: colorRight,
    colorLeft: colorLeft,
    colorFront: colorFront,
    colorBack: colorBack
  }

  if(urlParams.has("rx")) options.rx = urlParams.get("rx");
  if(urlParams.has("ry")) options.ry = urlParams.get("ry");
  if(urlParams.has("rz")) options.rz = urlParams.get("rz");

  var cubeCSS = new CubeCSS(options);
  cubeCSS.on("turning", function() {
    document.querySelector("button.play").style.display = "none";
    document.querySelector("button.pause").style.display = "inline";
  });
  cubeCSS.on("finish", function() {
    document.querySelector("button.play").style.display = "inline";
    document.querySelector("button.pause").style.display = "none";
  });

  window.cubeCSS = cubeCSS;

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
      case "u":
        cubeCSS.uw();
        break;
      case "d":
        cubeCSS.dw();
        break;
      case "r":
        cubeCSS.rw();
        break;
      case "l":
        cubeCSS.lw();
        break;
      case "f":
        cubeCSS.fw();
        break;
      case "b":
        cubeCSS.bw();
        break;
      case "u2":
        cubeCSS.uw2();
        break;
      case "d2":
        cubeCSS.dw2();
        break;
      case "r2":
        cubeCSS.rw2();
        break;
      case "l2":
        cubeCSS.lw2();
        break;
      case "f2":
        cubeCSS.fw2();
        break;
      case "b2":
        cubeCSS.bw2();
        break;
      case "u'":
      case "ui":
        cubeCSS.uwi();
        break;
      case "d'":
      case "di":
        cubeCSS.dwi();
        break;
      case "r'":
      case "ri":
        cubeCSS.rwi();
        break;
      case "l'":
      case "li":
        cubeCSS.lwi();
        break;
      case "f'":
      case "fi":
        cubeCSS.fwi();
        break;
      case "b'":
      case "bi":
        cubeCSS.bwi();
        break;
      case "x":
        cubeCSS.x();
        break;
      case "y":
        cubeCSS.y();
        break;
      case "z":
        cubeCSS.z();
        break;
      case "x2":
        cubeCSS.x2();
        break;
      case "y2":
        cubeCSS.y2();
        break;
      case "z2":
        cubeCSS.z2();
        break;
      case "xi":
      case "x'":
        cubeCSS.xi();
        break;
      case "yi":
      case "y'":
        cubeCSS.yi();
        break;
      case "zi":
      case "z'":
        cubeCSS.zi();
        break;
      case "M":
        cubeCSS.m();
        break;
      case "S":
        cubeCSS.s();
        break;
      case "E":
        cubeCSS.e();
        break;
      case "M2":
        cubeCSS.m2();
        break;
      case "S2":
        cubeCSS.s2();
        break;
      case "E2":
        cubeCSS.e2();
        break;
      case "Mi":
      case "M'":
        cubeCSS.mi();
        break;
      case "Si":
        cubeCSS.si();
        break;
      case "Ei":
        cubeCSS.ei();
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
        s.style.backgroundColor = "#777"; // TODO configurable
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
    if(cubeCSS.turning()) return;

    cubeCSS.pause();

    cubeCSS.withoutAnimation(function() {
      cubeCSS.play();
      cubeCSS.pause();

      while(cubeCSS.idx() > preseq.length) {
        cubeCSS.undo();
      }
    })
  }, false);

  document.querySelector("button.step-backward").addEventListener("click", function() {
    if(cubeCSS.turning()) return;
    if(cubeCSS.idx() <= preseq.length) return;

    cubeCSS.pause();
    cubeCSS.undo();
  }, false);

  document.querySelector("button.step-forward").addEventListener("click", function() {
    cubeCSS.play();
    cubeCSS.pause();
  }, false);

  document.querySelector("button.finish").addEventListener("click", function() {
    cubeCSS.withoutAnimation(function() {
      cubeCSS.play();
    });
  }, false);
})();
