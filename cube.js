(function() {
  var cube = document.querySelector(".cube");

  var rx=-10;
  var ry=-20;
  var rz=0;

  function tick() {
    cube.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg) rotateZ(" + rz + "deg)";

    rx -= 0;
    ry -= 2;
    rz += 0;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
