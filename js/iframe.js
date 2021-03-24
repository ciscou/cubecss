(function() {
  var urlParams = new URLSearchParams(window.location.search);

  var seq = [];
  if(urlParams.has("seq")) {
    seq = urlParams.get("seq").split(",")
  }

  var preseq = [];
  if(urlParams.has("preseq")) {
    preseq = urlParams.get("preseq")
    if(preseq === "qes") {
      preseq = [];
      seq.forEach(function(m) {
        preseq.unshift(m, m, m);
      });
    } else {
      preseq = preseq.split(",");
    }
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

  var colorPlastic = urlParams.get("clrp");

  var colorStickerless = urlParams.get("clrx") || "#777";

  var options = {
    container: document.querySelector(".cube-container"),
    colorUp: colorUp,
    colorDown: colorDown,
    colorRight: colorRight,
    colorLeft: colorLeft,
    colorFront: colorFront,
    colorBack: colorBack,
    colorPlastic: colorPlastic
  }

  if(urlParams.has("cs")) options.cubieSize = urlParams.get("cs");
  if(urlParams.has("rx")) options.rx = urlParams.get("rx");
  if(urlParams.has("ry")) options.ry = urlParams.get("ry");
  if(urlParams.has("rz")) options.rz = urlParams.get("rz");

  if(urlParams.has("transition")) options.transition = urlParams.get("transition");
  if(urlParams.has("perspective")) options.perspective = urlParams.get("perspective");

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
    var l = move
      .replace("u", "uw")
      .replace("r", "rw")
      .replace("f", "fw")
      .replace("d", "dw")
      .replace("l", "lw")
      .replace("b", "bw")
      .replace("'", "i")
      .toLowerCase();
    var f = cubeCSS[l];

    if(f) {
      f();
    } else {
      console.log("Invalid movement", move);
    }
  }

  cubeCSS.withoutAnimation(function() {
    preseq.forEach(function(move) {
      performMove(move);
    });

    cubeCSS.pause();

    stickerless.forEach(function(cubie) {
      var c = cubeCSS.cubies[cubie];

      if(c) {
        Object.values(c.stickers).forEach(function(s) {
          s.style.backgroundColor = colorStickerless;
        });
      } else {
        c = cubeCSS.cubies[cubie.slice(0, -1)];

        if(c) {
          switch(cubie.slice(-1)) {
            case "U":
              c.stickers.up.style.backgroundColor = colorStickerless;
              break;
            case "R":
              c.stickers.right.style.backgroundColor = colorStickerless;
              break;
            case "F":
              c.stickers.front.style.backgroundColor = colorStickerless;
              break;
            case "D":
              c.stickers.down.style.backgroundColor = colorStickerless;
              break;
            case "L":
              c.stickers.left.style.backgroundColor = colorStickerless;
              break;
            case "B":
              c.stickers.back.style.backgroundColor = colorStickerless;
              break;
            default:
              console.log("Invalid stickerless cubie", cubie);
              break;
          }
        } else {
         console.log("Invalid stickerless cubie", cubie);
        }
      }
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
