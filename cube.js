(function() {
  var cube = document.querySelector(".cube");
  var frontSlice = cube.querySelectorAll(".cubie-container.front");

  var rx=-20;
  var ry=-20;
  var rz=0;
  var f = 0;

  function tick() {
    cube.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg) rotateZ(" + rz + "deg)";
    frontSlice.forEach(function(cubieContainer) {
      cubieContainer.style.transform = "rotateZ(" + f + "deg)"
    });

    rx -= 0;
    ry -= 30;
    rz += 0;
    f += 90;
  }

  setInterval(tick, 1000);
  // tick();
})();
