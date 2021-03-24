var cube = document.querySelector(".cube");

function turnSlices(...slices) {
  var done = false;
  var transitionEnd = function() {
    cube.removeEventListener("transitionend", transitionEnd);

    slices.forEach(function(s) {
      cube.classList.remove("turn-" + s);
    });
    cube.classList.remove("animate");

    requestAnimationFrame(nextTurn);
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

function turnUi() {
  turnSlices("ui");
}

function turnR() {
  turnSlices("r");
}

function turnRi() {
  turnSlices("ri");
}

function turnY() {
  turnSlices("u", "ei", "di");
}

function nextTurn() {
  console.log("nextTurn", turnIdx);
  if(turnIdx < turnsQueue.length) {
    var turn = turnsQueue[turnIdx];
    requestAnimationFrame(turn);

    turnIdx++;
  }
}

var turnsQueue = [turnY, turnR, turnU, turnRi, turnUi];
var turnIdx = 0;

requestAnimationFrame(nextTurn);
