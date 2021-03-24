var cube = document.querySelector(".cube");

function turnSlices(...slices) {
  var transitionEnd = function() {
    cube.removeEventListener("transitionend", transitionEnd);

    slices.forEach(function(s) {
      cube.classList.remove("turn-" + s);
    });
    cube.classList.remove("animate");
  }

  cube.addEventListener("transitionend", transitionEnd);

  cube.classList.add("animate");
  slices.forEach(function(s) {
    cube.classList.add("turn-" + s);
  });
}

function turnU() {
  turnSlices("u");
}

function turnY() {
  turnSlices("u", "ei", "di");
}

setTimeout(function() {
  turnY();
}, 500);

setTimeout(function() {
  turnU();
}, 1500);
