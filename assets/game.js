/*



If you want to know how this game was made, check out this video, that explains how it's made: 

https://youtu.be/eue3UdFvwPo

Follow me on twitter for more: https://twitter.com/HunorBorbely

*/

// Extend the base functionality of JavaScript
Array.prototype.last = function () {
  return this[this.length - 1];
};

// A sinus function that acceps degrees instead of radians
Math.sinus = function (degree) {
  return Math.sin((degree / 180) * Math.PI);
};

// Game data
let phase = "waiting"; // waiting | stretching | turning | walking | transitioning | falling
let lastTimestamp; // The timestamp of the previous requestAnimationFrame cycle

let heroX; // Changes when moving forward
let heroY; // Only changes when falling
let sceneOffset; // Moves the whole game

let platforms = [];
let sticks = [];
let trees = [];
let clouds = []; // Array para armazenar as nuvens
let stars = []; // Array para armazenar as estrelas

// Todo: Save high score to localStorage (?)

let score = 0;

// Configuration
let canvasWidth = window.innerWidth < 768 ? window.innerWidth - 50 : 375;
let canvasHeight = window.innerWidth < 768 ? window.innerHeight - 150 : 375;
const platformHeight = 100;
let heroDistanceFromEdge = window.innerWidth < 768 ? 5 : 10; // While waiting
let paddingX = window.innerWidth < 768 ? 50 : 100; // The waiting position of the hero in from the original canvas size
const perfectAreaSize = 10;

// The background moves slower than the hero
const backgroundSpeedMultiplier = 0.2;

const hill1BaseHeight = 100;
const hill1Amplitude = 10;
const hill1Stretch = 1;
const hill2BaseHeight = 70;
const hill2Amplitude = 20;
const hill2Stretch = 0.5;

const stretchingSpeed = 4; // Milliseconds it takes to draw a pixel
const turningSpeed = 4; // Milliseconds it takes to turn a degree
const walkingSpeed = 4;
const transitioningSpeed = 2;
const fallingSpeed = 2;

const heroWidth = 17; // 24
const heroHeight = 30; // 40

const canvas = document.getElementById("game");
canvas.width = window.innerWidth; // Make the Canvas full screen
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

const introductionElement = document.getElementById("introduction");
const perfectElement = document.getElementById("perfect");
const restartButton = document.getElementById("restart");
const scoreElement = document.getElementById("score");

let cloudImage = new Image();
cloudImage.crossOrigin = "anonymous"; // Permitir CORS
cloudImage.src = 'https://i.ibb.co/0RV2hgtj/v9c4lr6v.png'; // Definir o caminho da imagem

// Variáveis globais para os sons
let backgroundMusic;
let perfectSound;
let fallSound;
let soundsEnabled = true; // Flag para controlar se os sons estão ativos
let soundsLoaded = false; // Flag para verificar se os sons foram carregados

// Detecta se é um dispositivo móvel
function isMobileDevice() {
  return (window.innerWidth < 768) || 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Configura a interface para dispositivo móvel
function setupMobileInterface() {
  const mobileButton = document.getElementById("mobileStartButton");
  const introText = document.getElementById("introduction");
  
  if (isMobileDevice()) {
    // Ajustar texto de instrução para mobile
    introText.innerText = "Toque na tela para iniciar e esticar o bastão";
    introText.style.padding = "15px 20px";
    introText.style.fontSize = "1em";
    
    // Esconder botão de início para mobile, pois vamos usar toques diretos na tela
    mobileButton.style.display = "none";
  } else {
    // Desktop
    introText.innerText = "Clique e segure para esticar o bastão";
    mobileButton.style.display = "none";
  }
}

// Função adicionada para prevenir seleção de texto durante o jogo
function preventTextSelection() {
  const elements = [
    document.getElementById("score"),
    document.getElementById("introduction"),
    document.getElementById("perfect"),
    document.getElementById("creditos")
  ];
  
  elements.forEach(element => {
    if (element) {
      element.style.webkitUserSelect = "none";
      element.style.userSelect = "none";
      element.setAttribute("unselectable", "on");
    }
  });
}

// Initialize layout
recalculateConstants(); // Garantir que as constantes estejam corretas no início
setupMobileInterface(); // Configurar interface para mobile se necessário
preventTextSelection(); // Prevenir seleção de texto
resetGame();

// Função para carregar sons
function loadSounds() {
  if (soundsLoaded) return; // Evitar carregar várias vezes
  
  console.log("Carregando sons...");
  backgroundMusic = document.getElementById("backgroundMusic");
  perfectSound = document.getElementById("perfectSound");
  fallSound = document.getElementById("fallSound");
  
  if (!backgroundMusic || !perfectSound || !fallSound) {
    console.error("Alguns elementos de áudio não foram encontrados:");
    console.error("backgroundMusic:", backgroundMusic);
    console.error("perfectSound:", perfectSound);
    console.error("fallSound:", fallSound);
    return;
  }
  
  // Configurar volume
  backgroundMusic.volume = 0.3;
  perfectSound.volume = 0.5;
  fallSound.volume = 0.6;
  
  soundsLoaded = true;
  console.log("Sons carregados com sucesso!");
  
  // Tentar reproduzir áudio após interação do usuário
  document.addEventListener('click', function initialPlay() {
    playBackgroundMusic();
    document.removeEventListener('click', initialPlay);
  }, { once: true });
}

// Função para tocar música de fundo
function playBackgroundMusic() {
  if (!soundsLoaded) {
    loadSounds();
  }
  
  if (soundsEnabled && backgroundMusic && backgroundMusic.paused) {
    console.log("Tentando reproduzir música de fundo...");
    backgroundMusic.play().then(() => {
      console.log("Música de fundo reproduzida com sucesso!");
    }).catch(error => {
      console.error("Erro ao reproduzir música de fundo:", error);
    });
  }
}

// Função para pausar música de fundo
function pauseBackgroundMusic() {
  if (backgroundMusic && !backgroundMusic.paused) {
    backgroundMusic.pause();
    console.log("Música de fundo pausada");
  }
}

// Função para tocar som de perfect
function playPerfectSound() {
  if (!soundsLoaded) {
    loadSounds();
  }
  
  if (soundsEnabled && perfectSound) {
    perfectSound.currentTime = 0; // Reinicia o som para permitir reprodução repetida
    console.log("Tentando reproduzir som de perfect...");
    perfectSound.play().then(() => {
      console.log("Som de perfect reproduzido com sucesso!");
    }).catch(error => {
      console.error("Erro ao reproduzir som de perfect:", error);
    });
  }
}

// Função para tocar som de queda
function playFallSound() {
  if (!soundsLoaded) {
    loadSounds();
  }
  
  if (soundsEnabled && fallSound) {
    fallSound.currentTime = 0;
    console.log("Tentando reproduzir som de queda...");
    fallSound.play().then(() => {
      console.log("Som de queda reproduzido com sucesso!");
    }).catch(error => {
      console.error("Erro ao reproduzir som de queda:", error);
    });
  }
}

// Resets game variables and layouts but does not start the game (game starts on keypress)
function resetGame() {
  // Reset game progress
  phase = "waiting";
  lastTimestamp = undefined;
  sceneOffset = 0;
  score = 0;

  // Remover classe de jogo ativo
  document.body.classList.remove("game-active");

  // Garantir que os elementos de interface estejam visíveis
  introductionElement.style.opacity = 0.8;
  perfectElement.style.opacity = 0;
  restartButton.style.display = "none";
  
  // Atualizar a pontuação
  updateScoreDisplay();

  // Limpar nuvens antes de gerar novas
  clouds = []; // Limpa o array de nuvens

  // Gerar estrelas
  generateStars(); // Gera as estrelas uma vez

  // The first platform is always the same
  platforms = [{ x: 50, w: 50 }];
  generatePlatform();
  generatePlatform();
  generatePlatform();
  generatePlatform();

  sticks = [{ x: platforms[0].x + platforms[0].w, length: 0, rotation: 0 }];

  trees = [];
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();
  generateTree();

  heroX = platforms[0].x + platforms[0].w - heroDistanceFromEdge;
  heroY = 0;

  // Chame a função para gerar algumas nuvens no início do jogo
  for (let i = 0; i < 5; i++) {
    generateCloud();
  }

  // Garantir que o jogo seja renderizado
  resizeCanvas();
  draw();
  
  // Verificar se precisamos configurar para mobile
  setupMobileInterface();

  // Iniciar música de fundo quando o jogo reinicia
  playBackgroundMusic();
}

function generateTree() {
  const minimumGap = 30;
  const maximumGap = 150;

  // X coordinate of the right edge of the furthest tree
  const lastTree = trees[trees.length - 1];
  let furthestX = lastTree ? lastTree.x : 0;

  const x =
    furthestX +
    minimumGap +
    Math.floor(Math.random() * (maximumGap - minimumGap));

  const treeColors = ["#6D8821", "#8FAC34", "#98B333"];
  const color = treeColors[Math.floor(Math.random() * 3)];

  trees.push({ x, color });
}

function generatePlatform() {
  const minimumGap = 40;
  const maximumGap = 200;
  const minimumWidth = 20;
  const maximumWidth = 100;

  // X coordinate of the right edge of the furthest platform
  const lastPlatform = platforms[platforms.length - 1];
  let furthestX = lastPlatform.x + lastPlatform.w;

  const x =
    furthestX +
    minimumGap +
    Math.floor(Math.random() * (maximumGap - minimumGap));
  const w =
    minimumWidth + Math.floor(Math.random() * (maximumWidth - minimumWidth));

  platforms.push({ x, w });
}

// Prevenir o menu de contexto ao pressionar a tela
window.addEventListener("contextmenu", function (event) {
  event.preventDefault(); // Prevenir o menu de contexto
});

// Prevenir seleção de texto ao tocar na tela
window.addEventListener("selectstart", function(event) {
  event.preventDefault();
});

// Garantir que os eventos de toque funcionem corretamente
window.addEventListener("touchstart", function (event) {
  // Ignorar eventos do botão de som
  if (event.target.id === 'soundToggle' || event.target.closest('#soundToggle')) {
    return;
  }
  
  // Prevenir comportamento padrão exceto para botões
  if (event.target.tagName !== "BUTTON") {
    event.preventDefault();
  }
  
  if (phase == "waiting") {
    lastTimestamp = undefined;
    introductionElement.style.opacity = 0;
    phase = "stretching";
    document.body.classList.add("game-active"); // Ativar captura de toques
    window.requestAnimationFrame(animate);
  }
});

// Garantir que o evento de soltar o stick funcione
window.addEventListener("touchend", function (event) {
  if (phase == "stretching") {
    phase = "turning"; // Mudar para a fase de turning
  }
});

// Adicionar evento de clique ao botão
document.getElementById("mobileStartButton").addEventListener("click", function (event) {
  event.preventDefault(); // Prevenir comportamento padrão
  if (phase == "waiting") {
    lastTimestamp = undefined;
    introductionElement.style.opacity = 0;
    phase = "stretching";
    window.requestAnimationFrame(animate);
  }
});

// Adicionar eventos para desktop
window.addEventListener("mousedown", function (event) {
  // Ignorar eventos do botão de som
  if (event.target.id === 'soundToggle' || event.target.closest('#soundToggle')) {
    return;
  }
  
  if (phase == "waiting") {
    lastTimestamp = undefined;
    introductionElement.style.opacity = 0;
    phase = "stretching";
    window.requestAnimationFrame(animate);
  }
});

window.addEventListener("mouseup", function (event) {
  if (phase == "stretching") {
    phase = "turning"; // Mudar para a fase de turning
  }
});

window.addEventListener("resize", function (event) {
  resizeCanvas();
  
  // Recalcular constantes ao redimensionar
  recalculateConstants();
  
  // Atualizar interface para mobile se necessário
  setupMobileInterface();
  
  draw();
});

window.requestAnimationFrame(animate);

// The main game loop
function animate(timestamp) {
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
    window.requestAnimationFrame(animate);
    return;
  }

  switch (phase) {
    case "waiting":
      return; // Stop the loop
    case "stretching": {
      sticks.last().length += (timestamp - lastTimestamp) / stretchingSpeed;
      break;
    }
    case "turning": {
      sticks.last().rotation += (timestamp - lastTimestamp) / turningSpeed;

      if (sticks.last().rotation > 90) {
        sticks.last().rotation = 90;

        const [nextPlatform, perfectHit] = thePlatformTheStickHits();
        if (nextPlatform) {
          // Increase score
          score += perfectHit ? 2 : 1;
          updateScoreDisplay();

          if (perfectHit) {
            perfectElement.style.opacity = 1;
            setTimeout(() => (perfectElement.style.opacity = 0), 1000);
          }

          generatePlatform();
          generateTree();
          generateTree();
        }

        phase = "walking";
      }
      break;
    }
    case "walking": {
      heroX += (timestamp - lastTimestamp) / walkingSpeed;

      const [nextPlatform] = thePlatformTheStickHits();
      if (nextPlatform) {
        // If hero will reach another platform then limit it's position at it's edge
        const maxHeroX = nextPlatform.x + nextPlatform.w - heroDistanceFromEdge;
        if (heroX > maxHeroX) {
          heroX = maxHeroX;
          phase = "transitioning";
        }
      } else {
        // If hero won't reach another platform then limit it's position at the end of the pole
        const maxHeroX = sticks.last().x + sticks.last().length + heroWidth;
        if (heroX > maxHeroX) {
          heroX = maxHeroX;
          phase = "falling";
        }
      }
      break;
    }
    case "transitioning": {
      sceneOffset += (timestamp - lastTimestamp) / transitioningSpeed;

      const [nextPlatform] = thePlatformTheStickHits();
      if (sceneOffset > nextPlatform.x + nextPlatform.w - paddingX) {
        // Add the next step
        sticks.push({
          x: nextPlatform.x + nextPlatform.w,
          length: 0,
          rotation: 0
        });
        phase = "waiting";
      }
      break;
    }
    case "falling": {
      if (sticks.last().rotation < 180)
        sticks.last().rotation += (timestamp - lastTimestamp) / turningSpeed;

      heroY += (timestamp - lastTimestamp) / fallingSpeed;
      const maxHeroY =
        platformHeight + 100 + (window.innerHeight - canvasHeight) / 2;
      if (heroY > maxHeroY) {
        playFallSound(); // Tocar som de queda
        pauseBackgroundMusic(); // Pausar música de fundo
        restartButton.style.display = "block";
        document.body.classList.remove("game-active"); // Desativar captura de toques quando o jogo termina
        
        // Esconder o botão de início quando o jogo termina
        const mobileButton = document.getElementById("mobileStartButton");
        if (mobileButton) {
          mobileButton.style.display = "none";
        }
        
        // Garantir que o botão de som ainda está visível e funcionando
        const soundButton = document.getElementById("soundToggle");
        if (soundButton) {
          soundButton.style.zIndex = "3000"; // Aumentar o z-index acima do botão de reinício
        }
        
        return;
      }
      break;
    }
    default:
      throw Error("Wrong phase");
  }

  draw();
  window.requestAnimationFrame(animate);

  lastTimestamp = timestamp;
}

// Returns the platform the stick hit (if it didn't hit any stick then return undefined)
function thePlatformTheStickHits() {
  if (sticks.last().rotation != 90)
    throw Error(`Stick is ${sticks.last().rotation}°`);
  const stickFarX = sticks.last().x + sticks.last().length;

  const platformTheStickHits = platforms.find(
    (platform) => platform.x < stickFarX && stickFarX < platform.x + platform.w
  );

  // If the stick hits the perfect area
  if (
    platformTheStickHits &&
    platformTheStickHits.x + platformTheStickHits.w / 2 - perfectAreaSize / 2 <
      stickFarX &&
    stickFarX <
      platformTheStickHits.x + platformTheStickHits.w / 2 + perfectAreaSize / 2
  ) {
    // Tocar som quando acertar perfect
    playPerfectSound();
    return [platformTheStickHits, true];
  }

  return [platformTheStickHits, false];
}

function draw() {
  // Verificar se o contexto e canvas existem
  if (!ctx || !canvas) {
    console.error("Contexto ou canvas não disponível");
    return;
  }

  try {
    ctx.save();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    drawBackground();

    // Ajuste para telas menores e mobile
    let scaleRatio = 1;
    let translateX, translateY;
    
    // Verifica se é uma tela pequena (provavelmente mobile)
    if (window.innerWidth < 768) {
      // Calcula uma escala melhor para cada dispositivo
      scaleRatio = Math.min(window.innerWidth / (canvasWidth * 1.1), window.innerHeight / (canvasHeight * 1.2), 1);
      
      // Centraliza melhor o conteúdo na tela
      translateX = (window.innerWidth / 2) - ((canvasWidth * scaleRatio) / 2) - (sceneOffset * scaleRatio);
      translateY = (window.innerHeight / 2) - ((canvasHeight * scaleRatio) / 2);
    } else {
      // Comportamento original para desktop
      translateX = (window.innerWidth - canvasWidth) / 2 - sceneOffset;
      translateY = (window.innerHeight - canvasHeight) / 2;
    }

    // Aplicar transformações
    ctx.translate(translateX, translateY);
    if (window.innerWidth < 768) {
      ctx.scale(scaleRatio, scaleRatio);
    }

    // Draw scene
    drawPlatforms();
    drawHero();
    drawSticks();

    // Restore transformation
    ctx.restore();
  } catch (e) {
    console.error("Erro ao desenhar:", e);
    
    // Tentar recuperar o contexto
    if (canvas) {
      ctx = canvas.getContext("2d");
    }
  }
}

// Adicionar evento de clique ao botão de reiniciar
restartButton.addEventListener("click", function (event) {
  event.preventDefault();
  event.stopPropagation(); // Impedir que o evento se propague
  resetGame();
  restartButton.style.display = "none"; // Esconder o botão após reiniciar
});

function drawPlatforms() {
  platforms.forEach(({ x, w }) => {
    // Draw platform
    ctx.fillStyle = "black";
    ctx.fillRect(
      x,
      canvasHeight - platformHeight,
      w,
      platformHeight + (window.innerHeight - canvasHeight) / 2
    );

    // Draw perfect area only if hero did not yet reach the platform
    if (sticks.last().x < x) {
      ctx.fillStyle = "red";
      ctx.fillRect(
        x + w / 2 - perfectAreaSize / 2,
        canvasHeight - platformHeight,
        perfectAreaSize,
        perfectAreaSize
      );
    }
  });
}

function drawHero() {
  ctx.save();
  ctx.fillStyle = "black";
  ctx.translate(
    heroX - heroWidth / 2,
    heroY + canvasHeight - platformHeight - heroHeight / 2
  );

  // Body
  drawRoundedRect(
    -heroWidth / 2,
    -heroHeight / 2,
    heroWidth,
    heroHeight - 4,
    5
  );

  // Legs
  const legDistance = 5;
  ctx.beginPath();
  ctx.arc(legDistance, 11.5, 3, 0, Math.PI * 2, false);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-legDistance, 11.5, 3, 0, Math.PI * 2, false);
  ctx.fill();

  // Eye
  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.arc(5, -7, 3, 0, Math.PI * 2, false);
  ctx.fill();

  // Band
  ctx.fillStyle = "red";
  ctx.fillRect(-heroWidth / 2 - 1, -12, heroWidth + 2, 4.5);
  ctx.beginPath();
  ctx.moveTo(-9, -14.5);
  ctx.lineTo(-17, -18.5);
  ctx.lineTo(-14, -8.5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-10, -10.5);
  ctx.lineTo(-15, -3.5);
  ctx.lineTo(-5, -7);
  ctx.fill();

  ctx.restore();
}

function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.lineTo(x + width - radius, y + height);
  ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
  ctx.lineTo(x + width, y + radius);
  ctx.arcTo(x + width, y, x + width - radius, y, radius);
  ctx.lineTo(x + radius, y);
  ctx.arcTo(x, y, x, y + radius, radius);
  ctx.fill();
}

function drawSticks() {
  sticks.forEach((stick) => {
    ctx.save();

    // Move the anchor point to the start of the stick and rotate
    ctx.translate(stick.x, canvasHeight - platformHeight);
    ctx.rotate((Math.PI / 180) * stick.rotation);

    // Draw stick
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -stick.length);
    ctx.stroke();

    // Restore transformations
    ctx.restore();
  });
}

// Função para gerar estrelas
function generateStars() {
  const starCount = 50; // Número de estrelas
  stars = []; // Limpa o array de estrelas
  for (let i = 0; i < starCount; i++) {
    const x = Math.random() * window.innerWidth; // Posição X aleatória
    const y = Math.random() * (window.innerHeight / 2); // Posição Y aleatória na parte superior
    const size = Math.random() * 2 + 1; // Tamanho aleatório da estrela
    stars.push({ x, y, size }); // Armazena a estrela no array
  }
}

// Função para desenhar estrelas
function drawStars() {
  ctx.fillStyle = "white"; // Cor da estrela
  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2); // Desenha a estrela
    ctx.fill();
  });
}

function drawBackground() {
  // Desenhar céu crepuscular
  var gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
  gradient.addColorStop(0, "#1a1a4b"); // Azul escuro no topo
  gradient.addColorStop(0.5, "#6a4b8a"); // Roxo no meio
  gradient.addColorStop(1, "#ff7e00"); // Laranja na parte inferior
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  // Desenhar estrelas
  drawStars(); // Chama a função para desenhar estrelas

  // Desenhar colinas
  drawHill(hill1BaseHeight, hill1Amplitude, hill1Stretch, "#95C629");
  drawHill(hill2BaseHeight, hill2Amplitude, hill2Stretch, "#659F1C");

  // Desenhar árvores
  trees.forEach((tree) => drawTree(tree.x, tree.color));

  // Desenhar nuvens
  drawClouds();
}

// A hill is a shape under a stretched out sinus wave
function drawHill(baseHeight, amplitude, stretch, color) {
  ctx.beginPath();
  ctx.moveTo(0, window.innerHeight);
  ctx.lineTo(0, getHillY(0, baseHeight, amplitude, stretch));
  for (let i = 0; i < window.innerWidth; i++) {
    ctx.lineTo(i, getHillY(i, baseHeight, amplitude, stretch));
  }
  ctx.lineTo(window.innerWidth, window.innerHeight);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawTree(x, color) {
  ctx.save();
  ctx.translate(
    (-sceneOffset * backgroundSpeedMultiplier + x) * hill1Stretch,
    getTreeY(x, hill1BaseHeight, hill1Amplitude)
  );

  const treeTrunkHeight = 5;
  const treeTrunkWidth = 2;
  const treeCrownHeight = 25;
  const treeCrownWidth = 10;

  // Draw trunk
  ctx.fillStyle = "#7D833C";
  ctx.fillRect(
    -treeTrunkWidth / 2,
    -treeTrunkHeight,
    treeTrunkWidth,
    treeTrunkHeight
  );

  // Draw crown
  ctx.beginPath();
  ctx.moveTo(-treeCrownWidth / 2, -treeTrunkHeight);
  ctx.lineTo(0, -(treeTrunkHeight + treeCrownHeight));
  ctx.lineTo(treeCrownWidth / 2, -treeTrunkHeight);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}

function getHillY(windowX, baseHeight, amplitude, stretch) {
  const sineBaseY = window.innerHeight - baseHeight;
  return (
    Math.sinus((sceneOffset * backgroundSpeedMultiplier + windowX) * stretch) *
      amplitude +
    sineBaseY
  );
}

function getTreeY(x, baseHeight, amplitude) {
  const sineBaseY = window.innerHeight - baseHeight;
  return Math.sinus(x) * amplitude + sineBaseY;
}

// Função para gerar nuvens
function generateCloud() {
  const cloudX = Math.random() * window.innerWidth; // Posição X aleatória
  const cloudY = Math.random() * (canvas.height / 2); // Posição Y aleatória no céu
  const cloudWidth = 60 + Math.random() * 40; // Largura da nuvem
  const cloudSpeed = 0.5 + Math.random(); // Velocidade da nuvem

  clouds.push({ x: cloudX, y: cloudY, width: cloudWidth, speed: cloudSpeed });
}

// Função para desenhar nuvens
function drawClouds() {
  clouds.forEach((cloud) => {
    ctx.save();
    const cloudHeight = (cloud.width / cloudImage.width) * cloudImage.height; // Calcular a altura proporcional
    ctx.drawImage(cloudImage, cloud.x - cloud.width / 2, cloud.y - cloudHeight / 2, cloud.width, cloudHeight); // Desenhar a imagem da nuvem
    ctx.restore();

    // Mover nuvens
    cloud.x += cloud.speed; // Mover nuvem para a direita
    if (cloud.x > window.innerWidth) {
      cloud.x = -cloud.width; // Reiniciar a nuvem do lado esquerdo
    }
  });
}

// Atualizar a exibição da pontuação
function updateScoreDisplay() {
  scoreElement.innerText = "Pontos: " + score; // Adiciona "Score: " antes da pontuação
  scoreElement.style.textAlign = "center"; // Centraliza o texto
  scoreElement.style.fontSize = "2em"; // Define o tamanho da fonte
}

// Função para recalcular constantes com base no tamanho da tela
function recalculateConstants() {
  // Atualizar valores de configuração
  canvasWidth = window.innerWidth < 768 ? window.innerWidth - 50 : 375;
  canvasHeight = window.innerWidth < 768 ? window.innerHeight - 150 : 375;
  heroDistanceFromEdge = window.innerWidth < 768 ? 5 : 10;
  paddingX = window.innerWidth < 768 ? 50 : 100;
}

// Função para garantir que o canvas ocupe todo o espaço disponível
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Garantir que o canvas tenha o tamanho correto no carregamento e evitar que desapareça
window.addEventListener("load", function() {
  resizeCanvas();
  // Pequeno atraso para garantir que todos os elementos foram carregados
  setTimeout(function() {
    draw();
    setupMobileInterface();
  }, 100);
});

// Garantir que a função draw seja chamada após o carregamento da imagem da nuvem
cloudImage.onload = function() {
  draw();
};

// Função para garantir que o jogo esteja sempre visível
function ensureGameVisibility() {
  // Verificar se o jogo está visível, caso contrário renderizar novamente
  const isCanvasBlank = function(canvas) {
    const context = canvas.getContext('2d');
    const pixelBuffer = new Uint32Array(
      context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
    return !pixelBuffer.some(color => color !== 0);
  };
  
  if (isCanvasBlank(canvas)) {
    console.log("Canvas detectado em branco, re-renderizando...");
    resizeCanvas();
    recalculateConstants();
    draw();
  }
}

// Chamar a função periodicamente para garantir que o jogo seja sempre visível
setInterval(ensureGameVisibility, 500);

// Função para inicializar o jogo após a história
function initGameAfterStory() {
  // Verificar se já foi inicializado antes
  if (!window.gameInitialized) {
    recalculateConstants(); // Garantir que as constantes estejam corretas no início
    setupMobileInterface(); // Configurar interface para mobile se necessário
    preventTextSelection(); // Prevenir seleção de texto
    resetGame();
    window.gameInitialized = true;
  }

  // Garantir que o jogo seja desenhado
  resizeCanvas();
  draw();
}

// Verificar se estamos iniciando o jogo direto da tela de história
window.addEventListener('gameStartFromStory', function() {
  initGameAfterStory();
  // Carregar sons quando o jogo iniciar
  loadSounds();
  setTimeout(playBackgroundMusic, 1000); // Tenta tocar a música após um segundo
});

// Verificar se o documento já está totalmente carregado para inicializar
if (document.readyState === 'complete') {
  // Se não estamos mostrando a história, inicializar o jogo diretamente
  if (!document.getElementById('story-screen') || document.getElementById('story-screen').style.display === 'none') {
    initGameAfterStory();
  }
} else {
  // Esperar o carregamento da página
  window.addEventListener('load', function() {
    // Se não estamos mostrando a história, inicializar o jogo diretamente
    if (!document.getElementById('story-screen') || document.getElementById('story-screen').style.display === 'none') {
      setTimeout(function() {
        initGameAfterStory();
      }, 100);
    }
  });
}

// Adicionar botão para controlar o som
function addSoundControl() {
  // Verificar se o botão já existe para evitar duplicatas
  if (document.getElementById('soundToggle')) return;
  
  const soundButton = document.createElement('button');
  soundButton.id = 'soundToggle';
  soundButton.innerHTML = '🔊';
  soundButton.className = 'sound-button';
  
  document.body.appendChild(soundButton);
  
  soundButton.addEventListener('click', function(event) {
    // Impedir que o evento se propague para o jogo
    event.stopPropagation();
    event.preventDefault();
    
    soundsEnabled = !soundsEnabled;
    
    if (soundsEnabled) {
      soundButton.innerHTML = '🔊';
      playBackgroundMusic();
      console.log("Sons ativados");
    } else {
      soundButton.innerHTML = '🔇';
      pauseBackgroundMusic();
      console.log("Sons desativados");
    }
  });
}

// Adicionar o botão de som após o carregamento da página
window.addEventListener('load', function() {
  addSoundControl();
  
  // Tentar carregar sons após a página ser carregada
  loadSounds();
  
  // Adiciona evento de interação global para ativar os sons
  const activateSounds = function() {
    if (soundsEnabled) {
      playBackgroundMusic();
    }
    document.removeEventListener('click', activateSounds);
    document.removeEventListener('touchstart', activateSounds);
  };
  
  document.addEventListener('click', activateSounds);
  document.addEventListener('touchstart', activateSounds);
});

// Garantir que os sons sejam carregados
document.addEventListener('DOMContentLoaded', function() {
  loadSounds();
});
