(function () {
  let phase = "waiting";
  let lastTimestamp;
  let heroX, heroY, sceneOffset;
  let platforms = [];
  let sticks = [];
  let trees = [];
  let score = 0;

  const canvas = document.getElementById("game");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  const introductionElement = document.getElementById("introduction");
  const perfectElement = document.getElementById("perfect");
  const restartButton = document.getElementById("restart");
  const scoreElement = document.getElementById("score");

  function resetGame() {
    phase = "waiting";
    lastTimestamp = undefined;
    sceneOffset = 0;
    score = 0;

    introductionElement.style.opacity = 1;
    perfectElement.style.opacity = 0;
    restartButton.style.display = "none";
    scoreElement.innerText = score;

    platforms = [{ x: 50, w: 50 }];
    sticks = [{ x: platforms[0].x + platforms[0].w, length: 0, rotation: 0 }];
    trees = [];

    heroX = platforms[0].x + platforms[0].w - 10;
    heroY = 0;

    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = "black";
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
  }

  restartButton.addEventListener("click", function (event) {
    event.preventDefault();
    resetGame();
    restartButton.style.display = "none";
  });

  resetGame();
})();
