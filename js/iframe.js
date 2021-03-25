(function() {
  var urlParams = new URLSearchParams(window.location.search);

  var seq = [];
  if(urlParams.has("seq")) {
    urlParams.get("seq").split(",").forEach(function(m) {
      if(m === "scramble") {
        for(var i=0; i<50; i++) {
          var randomMove = ["U", "R", "F", "B", "L", "D"][Math.floor(Math.random() * 6)];
          randomMove += ["2", "i", ""][Math.floor(Math.random() * 3)];
          seq.push(randomMove);
        }
      } else {
        seq.push(m);
      }
    });
  }

  var preseq = [];
  if(urlParams.has("preseq")) {
    urlParams.get("preseq").split(",").forEach(function(m) {
      if(m === "qes") {
        for(var i=seq.length-1; i>=0; i--) {
          preseq.push(seq[i], seq[i], seq[i]);
        }
      } else if(m === "scramble") {
        for(var i=0; i<50; i++) {
          var randomMove = ["U", "R", "F", "B", "L", "D"][Math.floor(Math.random() * 6)];
          randomMove += ["2", "i", ""][Math.floor(Math.random() * 3)];
          preseq.push(randomMove);
        }
      } else {
        preseq.push(m);
      }
    });
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
  var hideControlsTimeout;

  function hideControls() {
    if(hideControlsTimeout) clearTimeout(hideControlsTimeout);

    document.querySelector(".controls").style.display = "none";
  }

  function showControls() {
    if(hideControlsTimeout) clearTimeout(hideControlsTimeout);

    document.querySelector(".controls").style.display = "flex";
  }

  function showControlsForAWhile() {
    showControls();

    hideControlsTimeout = setTimeout(function() {
      document.querySelector(".controls").style.display = "none";
    }, 1500);
  }

  cubeCSS.on("turning", function() {
    // if(hideControlsTimeout) clearTimeout(hideControlsTimeout);
    // document.querySelector(".controls").style.display = "none";
    document.querySelector("button.play").style.display = "none";
    document.querySelector("button.pause").style.display = "inline";
  });
  cubeCSS.on("finish", function() {
    // if(hideControlsTimeout) clearTimeout(hideControlsTimeout);
    // document.querySelector(".controls").style.display = "flex";
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

  function handleShowControlsForAWhile(e) {
    e.preventDefault();
    e.stopPropagation();

    showControlsForAWhile();
  }

  var touchmoved = false;

  function handleTouchStart(e) {
    e.preventDefault();
    e.stopPropagation();

    touchmoved = false;
  }

  function handleTouchMove(e) {
    e.preventDefault();
    e.stopPropagation();

    touchmoved = true;
  }

  function handleTouchEnd(e) {
    e.preventDefault();
    e.stopPropagation();

    if(!touchmoved) {
      touchmoved = true;
      showControlsForAWhile();
    }
  }

  showControlsForAWhile();

  // options.container.addEventListener("mousemove", handleShowControlsForAWhile);
  options.container.addEventListener("touchstart", handleTouchStart);
  options.container.addEventListener("touchmove", handleTouchMove);
  options.container.addEventListener("touchend", handleTouchEnd);
  options.container.addEventListener("mousemove", handleShowControlsForAWhile);

  function handlePlayClick(e) {
    e.preventDefault();
    e.stopPropagation();

    cubeCSS.play();

    hideControls();
  }

  function handlePauseClick(e) {
    e.preventDefault();
    e.stopPropagation();

    cubeCSS.pause();
  }

  function handleResetClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if(cubeCSS.turning()) return;

    cubeCSS.pause();

    cubeCSS.withoutAnimation(function() {
      cubeCSS.play();
      cubeCSS.pause();

      while(cubeCSS.idx() > preseq.length) {
        cubeCSS.undo();
      }
    })
  }

  function handleStepBackwardClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if(cubeCSS.turning()) return;
    if(cubeCSS.idx() <= preseq.length) return;

    cubeCSS.pause();
    cubeCSS.undo();

    hideControls();
  }

  function handleStepForwardClick(e) {
    e.preventDefault();
    e.stopPropagation();

    cubeCSS.play();
    cubeCSS.pause();

    hideControls();
  }

  function handleFinishClick(e) {
    e.preventDefault();
    e.stopPropagation();

    cubeCSS.withoutAnimation(function() {
      cubeCSS.play();
    });
  }

  document.querySelector("button.play").addEventListener("click", handlePlayClick, false);
  document.querySelector("button.play").addEventListener("touchstart", handlePlayClick, false);

  document.querySelector("button.pause").addEventListener("click", handlePauseClick, false);
  document.querySelector("button.pause").addEventListener("touchstart", handlePauseClick, false);

  document.querySelector("button.reset").addEventListener("click", handleResetClick, false);
  document.querySelector("button.reset").addEventListener("touchstart", handleResetClick, false);

  document.querySelector("button.step-backward").addEventListener("click", handleStepBackwardClick, false);
  document.querySelector("button.step-backward").addEventListener("touchstart", handleStepBackwardClick, false);

  document.querySelector("button.step-forward").addEventListener("click", handleStepForwardClick, false);
  document.querySelector("button.step-forward").addEventListener("touchstart", handleStepForwardClick, false);

  document.querySelector("button.finish").addEventListener("click", handleFinishClick, false);
  document.querySelector("button.finish").addEventListener("touchstart", handleFinishClick, false);
})();
