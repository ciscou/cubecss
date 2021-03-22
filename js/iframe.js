(function() {
  var cubeCSS = new CubeCSS({container: document.querySelector(".cube-container")});
  window.cubeCSS = cubeCSS;

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

  cubeCSS.withoutAnimation(function() {
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

    cubeCSS.pause();

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
