// Configurações extendidas
Array.prototype.last = function () {
  return this[this.length - 1];
};

Math.sinus = function (degree) {
  return Math.sin((degree / 180) * Math.PI);
};

// Variáveis do jogo
let phase = "waiting";
let lastTimestamp;
let heroX, heroY;
let sceneOffset = 0;
let platforms = [];
let sticks = [];
let trees = [];
let score = 0;

// Constantes
const canvasWidth = 375;
const canvasHeight = 375;
const platformHeight = 100;
const heroDistanceFromEdge = 10;
const paddingX = 100;
const perfectAreaSize = 10;
const backgroundSpeedMultiplier = 0.2;

// Elementos DOM
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const introductionElement = document.getElementById("introduction");
const perfectElement = document.getElementById("perfect");
const restartButton = document.getElementById("restart");
const scoreElement = document.getElementById("score");

// Inicialização
resetGame();

function resetGame() {
  phase = "waiting";
  lastTimestamp = undefined;
  sceneOffset = 0;
  score = 0;
  platforms = [{ x: 50, w: 50 }];
  sticks = [{ x: platforms[0].x + platforms[0].w, length: 0, rotation: 0 }];
  trees = [];
  
  heroX = platforms[0].x + platforms[0].w - heroDistanceFromEdge;
  heroY = 0;
  
  introductionElement.style.opacity = 1;
  perfectElement.style.opacity = 0;
  restartButton.style.display = "none";
  scoreElement.textContent = score;
  
  generatePlatform();
  generatePlatform();
  generatePlatform();
  generatePlatform();
  
  for (let i = 0; i < 10; i++) generateTree();
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}

// Funções de geração de elementos
function generatePlatform() {
  const lastPlatform = platforms.last();
  platforms.push({
    x: lastPlatform.x + lastPlatform.w + 40 + Math.random() * 160,
    w: 20 + Math.random() * 80
  });
}

function generateTree() {
  trees.push({
    x: (trees.last()?.x || 0) + 30 + Math.random() * 120,
    color: ["#6D8821", "#8FAC34", "#98B333"][Math.floor(Math.random() * 3)]
  });
}

// Event Listeners
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
});

window.addEventListener("mousedown", () => {
  if (phase === "waiting") {
    introductionElement.style.opacity = 0;
    phase = "stretching";
    animate();
  }
});

window.addEventListener("mouseup", () => {
  if (phase === "stretching") phase = "turning";
});

restartButton.addEventListener("click", (e) => {
  e.preventDefault();
  resetGame();
});

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (restartButton.style.display === "block") resetGame();
    else if (phase === "waiting") {
      introductionElement.style.opacity = 0;
      phase = "stretching";
      animate();
    }
  }
});

// Loop principal
function animate(timestamp = 0) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = timestamp - lastTimestamp;

  switch (phase) {
    case "stretching":
      sticks.last().length += delta / 4;
      break;
      
    case "turning":
      sticks.last().rotation += delta / 4;
      if (sticks.last().rotation > 90) {
        sticks.last().rotation = 90;
        const [platform, perfect] = checkPlatformCollision();
        if (platform) {
          score += perfect ? 2 : 1;
          scoreElement.textContent = score;
          if (perfect) {
            perfectElement.style.opacity = 1;
            setTimeout(() => perfectElement.style.opacity = 0, 1000);
          }
          generatePlatform();
          generateTree();
        }
        phase = "walking";
      }
      break;
      
    case "walking":
      heroX += delta / 4;
      const maxX = platform ? platform.x + platform.w - heroDistanceFromEdge : sticks.last().x + sticks.last().length + 17;
      if (heroX > maxX) {
        heroX = maxX;
        phase = platform ? "transitioning" : "falling";
      }
      break;
      
    case "transitioning":
      sceneOffset += delta / 2;
      if (sceneOffset > platforms[1].x + platforms[1].w - paddingX) {
        sticks.push({ x: platforms[1].x + platforms[1].w, length: 0, rotation: 0 });
        platforms.shift();
        sceneOffset = 0;
        phase = "waiting";
      }
      break;
      
    case "falling":
      heroY += delta / 2;
      if (sticks.last().rotation < 180) sticks.last().rotation += delta / 4;
      if (heroY > canvasHeight + 100) restartButton.style.display = "block";
      break;
  }

  draw();
  lastTimestamp = timestamp;
  if (phase !== "falling" || heroY <= canvasHeight + 100) requestAnimationFrame(animate);
}

// Funções auxiliares
function checkPlatformCollision() {
  const stickEnd = sticks.last().x + sticks.last().length;
  const platform = platforms.find(p => p.x < stickEnd && stickEnd < p.x + p.w);
  const perfect = platform && Math.abs(stickEnd - (platform.x + platform.w/2)) < perfectAreaSize/2;
  return [platform, perfect];
}
