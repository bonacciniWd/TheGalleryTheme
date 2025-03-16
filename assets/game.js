// game.js - Stick Hero Game (Otimizado para Shopify)
class StickHero {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.scoreElement = document.getElementById('score');
    this.restartButton = document.getElementById('restart');
    this.introductionElement = document.getElementById('introduction');
    this.perfectElement = document.getElementById('perfect');

    this.gameState = {
      phase: 'waiting', // waiting | stretching | turning | walking | falling
      score: 0,
      platforms: [],
      sticks: [],
      heroX: 0,
      heroY: 0,
      sceneOffset: 0,
      lastTime: null,
      animationFrameId: null
    };

    this.init();
  }

  init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.resetGame();
    this.animate();
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  setupEventListeners() {
    const handleStart = () => {
      if (this.gameState.phase === 'waiting') {
        this.gameState.phase = 'stretching';
        this.introductionElement.style.opacity = '0';
      }
    };

    const handleEnd = () => {
      if (this.gameState.phase === 'stretching') {
        this.gameState.phase = 'turning';
      }
    };

    // Mouse Events
    this.canvas.addEventListener('mousedown', handleStart);
    this.canvas.addEventListener('mouseup', handleEnd);

    // Touch Events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleStart();
    });
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleEnd();
    });

    // Restart & Resize
    this.restartButton.addEventListener('click', () => this.resetGame());
    window.addEventListener('resize', () => this.debouncedResize());
  }

  debouncedResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.setupCanvas();
      this.draw();
    }, 200);
  }

  resetGame() {
    cancelAnimationFrame(this.gameState.animationFrameId);
    
    this.gameState = {
      ...this.gameState,
      phase: 'waiting',
      score: 0,
      platforms: [{ x: 50, w: 50 }],
      sticks: [{ x: 130, length: 0, rotation: 0 }],
      heroX: 120,
      heroY: 0,
      sceneOffset: 0
    };

    this.scoreElement.textContent = '0';
    this.restartButton.style.display = 'none';
    this.introductionElement.style.opacity = '1';
    this.generatePlatforms(4);
  }

  generatePlatforms(count) {
    for (let i = 0; i < count; i++) {
      const last = this.gameState.platforms[this.gameState.platforms.length - 1];
      this.gameState.platforms.push({
        x: last.x + last.w + 80 + Math.random() * 100,
        w: 30 + Math.random() * 70
      });
    }
  }

  animate(timestamp) {
    this.gameState.animationFrameId = requestAnimationFrame((t) => this.animate(t));
    
    if (!this.gameState.lastTime) this.gameState.lastTime = timestamp;
    const delta = timestamp - this.gameState.lastTime;
    this.gameState.lastTime = timestamp;

    this.updateGameState(delta);
    this.draw();
  }

  updateGameState(delta) {
    switch (this.gameState.phase) {
      case 'stretching':
        this.gameState.sticks[this.gameState.sticks.length - 1].length += delta / 4;
        break;
      
      case 'turning':
        this.handleTurningPhase(delta);
        break;
      
      case 'walking':
        this.handleWalkingPhase(delta);
        break;
      
      case 'falling':
        this.handleFallingPhase(delta);
        break;
    }
  }

  // ... (Métodos específicos de cada fase do jogo)

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Desenhar fundo
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#BBD691');
    gradient.addColorStop(1, '#FEF1E1');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Desenhar elementos do jogo
    this.drawPlatforms();
    this.drawSticks();
    this.drawHero();
  }

  drawPlatforms() {
    this.gameState.platforms.forEach(platform => {
      this.ctx.fillStyle = '#2c3e50';
      this.ctx.fillRect(
        platform.x - this.gameState.sceneOffset,
        this.canvas.height - 100,
        platform.w,
        100
      );
    });
  }

  drawHero() {
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.beginPath();
    this.ctx.arc(
      this.gameState.heroX - this.gameState.sceneOffset,
      this.canvas.height - 120 + this.gameState.heroY,
      15,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  // ... (Outros métodos de desenho)
}

// Inicialização segura
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('game')) {
    new StickHero();
  }
});