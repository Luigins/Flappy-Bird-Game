const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// --- CARREGAMENTO DE ASSETS / DESIGN PROCEDURAL ---
// Nuvens estáticas no fundo com efeito parallax
const clouds = [
  { x: 30, y: 80, scale: 0.8, speed: 0.3 },
  { x: 200, y: 120, scale: 0.6, speed: 0.2 },
  { x: 120, y: 50, scale: 1.1, speed: 0.4 }
];

// --- ESTADO DO PÁSSARO ---
const bird = {
  x: 60,
  y: 180,
  radius: 13,
  velocity: 0,
  gravity: 0.25,
  jump: -4.5,
  rotation: 0,       // Angulo de inclinacao do passaro
  wingFrame: 0,      // Quadro da animacao das asas
  wingSpeed: 0.15
};

// --- ESTADO DOS CANOS E DO JOGO ---
const pipes = [];
const pipeWidth = 54;
const pipeGap = 110;
let groundOffset = 0; // Para o efeito de rolagem infinita do chão
let frameCount = 0;
let score = 0;
let highScore = localStorage.getItem('flappy_highscore') || 0;
let gameOver = false;

/**
 * Desenha uma nuvem detalhada no fundo usando formas suaves
 */
function drawCloud(x, y, scale) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.beginPath();
  ctx.arc(x, y, 15 * scale, 0, Math.PI * 2);
  ctx.arc(x + 12 * scale, y - 10 * scale, 12 * scale, 0, Math.PI * 2);
  ctx.arc(x + 24 * scale, y, 15 * scale, 0, Math.PI * 2);
  ctx.arc(x + 12 * scale, y + 4 * scale, 10 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Desenha um cano estilizado com iluminação 3D, degrade e bordas (bocal)
 */
function drawPipe(x, y, width, height, isTop) {
  ctx.save();

  // Degradê metálico verde para dar volume ao cano
  const gradient = ctx.createLinearGradient(x, 0, x + width, 0);
  gradient.addColorStop(0, '#53a027');
  gradient.addColorStop(0.2, '#7ed936');
  gradient.addColorStop(0.7, '#53a027');
  gradient.addColorStop(1, '#2d5713');

  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);

  // Borda externa escura
  ctx.strokeStyle = '#1b330b';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // Desenha o Bocal (Aba do cano)
  const capHeight = 22;
  const capExtraWidth = 6;
  const capX = x - capExtraWidth / 2;
  const capY = isTop ? y + height - capHeight : y;

  ctx.fillStyle = gradient;
  ctx.fillRect(capX, capY, width + capExtraWidth, capHeight);
  ctx.strokeRect(capX, capY, width + capExtraWidth, capHeight);

  // Brilho de relance (Highlight branco sutil)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(x + 6, y, 4, height);

  ctx.restore();
}

/**
 * Desenha o pássaro com rotação dinâmica, olho grande, bico e asa animada
 */
function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);

  // Calcula a rotação com base na velocidade de queda/pulo
  bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 6, bird.velocity * 0.08));
  ctx.rotate(bird.rotation);

  // Corpo do Pássaro (Degradê Amarelo/Laranja)
  const bodyGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, bird.radius);
  bodyGrad.addColorStop(0, '#fff176');
  bodyGrad.addColorStop(0.7, '#fbc02d');
  bodyGrad.addColorStop(1, '#f57f17');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#d7ccc8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Olho Grande
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(4, -4, 5, 0, Math.PI * 2);
  ctx.fill();

  // Pupila
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(6, -4, 2, 0, Math.PI * 2);
  ctx.fill();

  // Bico
  ctx.fillStyle = '#ff7043';
  ctx.beginPath();
  ctx.moveTo(8, 0);
  ctx.lineTo(16, 3);
  ctx.lineTo(8, 7);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#d84315';
  ctx.stroke();

  // Asa com animação de bater asas
  bird.wingFrame += bird.wingSpeed;
  const wingYOffset = Math.sin(bird.wingFrame) * 4;

  ctx.fillStyle = '#fff59d';
  ctx.beginPath();
  ctx.ellipse(-5, 2 + wingYOffset, 7, 4, Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fbc02d';
  ctx.stroke();

  ctx.restore();
}

/**
 * Desenha o chão estilizado com faixa de grama e textura
 */
function drawGround() {
  const groundHeight = 35;
  const y = canvas.height - groundHeight;

  // Terra
  ctx.fillStyle = '#ded895';
  ctx.fillRect(0, y, canvas.width, groundHeight);

  // Grama na parte superior do chão
  ctx.fillStyle = '#73bf2e';
  ctx.fillRect(0, y, canvas.width, 10);
  ctx.fillStyle = '#53a027';
  ctx.fillRect(0, y + 8, canvas.width, 3);

  // Linhas diagonais repetitivas para efeito de movimento
  ctx.strokeStyle = '#c8b671';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = -20; i < canvas.width + 20; i += 16) {
    ctx.moveTo(i + groundOffset, y + 11);
    ctx.lineTo(i - 8 + groundOffset, y + groundHeight);
  }
  ctx.stroke();

  // Borda superior do chão
  ctx.fillStyle = '#2d5713';
  ctx.fillRect(0, y, canvas.width, 2);
}

function spawnPipe() {
  const minHeight = 40;
  const maxHeight = canvas.height - pipeGap - minHeight - 35;
  const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: canvas.height - topHeight - pipeGap - 35,
    passed: false
  });
}

function resetGame() {
  bird.y = 180;
  bird.velocity = 0;
  bird.rotation = 0;
  pipes.length = 0;
  score = 0;
  frameCount = 0;
  gameOver = false;
}

function update() {
  if (gameOver) return;

  frameCount++;

  // Rolagem contínua do chão e nuvens
  groundOffset = (groundOffset - 2) % 16;
  clouds.forEach(c => {
    c.x -= c.speed;
    if (c.x < -50) c.x = canvas.width + 50;
  });

  // Física do pássaro
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  // Spawna novos canos
  if (frameCount % 90 === 0) {
    spawnPipe();
  }

  // Atualização dos canos
  for (let i = pipes.length - 1; i >= 0; i--) {
    const p = pipes[i];
    p.x -= 2;

    // Marcador de pontuação
    if (!p.passed && p.x + pipeWidth < bird.x) {
      p.passed = true;
      score++;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappy_highscore', highScore);
      }
    }

    // Remoção de canos fora da tela
    if (p.x + pipeWidth < 0) {
      pipes.splice(i, 1);
    }

    // Colisão precisa (AABB)
    if (
      bird.x + bird.radius - 2 > p.x &&
      bird.x - bird.radius + 2 < p.x + pipeWidth &&
      (bird.y - bird.radius + 2 < p.top ||
       bird.y + bird.radius - 2 > canvas.height - p.bottom - 35)
    ) {
      gameOver = true;
    }
  }

  // Colisão com o chão ou teto
  if (bird.y + bird.radius >= canvas.height - 35 || bird.y - bird.radius <= 0) {
    gameOver = true;
  }
}

function draw() {
  // Fundo com Gradiente de Céu (Amanhecer/Entardecer retro)
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  skyGradient.addColorStop(0, '#4dd0e1');
  skyGradient.addColorStop(0.7, '#e0f7fa');
  skyGradient.addColorStop(1, '#80deea');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Renderiza nuvens
  clouds.forEach(c => drawCloud(c.x, c.y, c.scale));

  // Renderiza canos
  pipes.forEach(p => {
    drawPipe(p.x, 0, pipeWidth, p.top, true);
    drawPipe(p.x, canvas.height - p.bottom - 35, pipeWidth, p.bottom, false);
  });

  // Renderiza o chão
  drawGround();

  // Renderiza o pássaro
  drawBird();

  // Placar com efeito de texto destacado (Sombra retro)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#000000';
  ctx.font = '24px "Press Start 2P"';
  ctx.fillText(score, canvas.width / 2 + 2, 52);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(score, canvas.width / 2, 50);

  // Overlay de Game Over com Placar Completo
  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Painel do Game Over
    ctx.fillStyle = '#e0e0e0';
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 4;
    ctx.fillRect(30, 130, 260, 200);
    ctx.strokeRect(30, 130, 260, 200);

    ctx.fillStyle = '#e64a19';
    ctx.font = '16px "Press Start 2P"';
    ctx.fillText('GAME OVER', canvas.width / 2, 170);

    ctx.fillStyle = '#424242';
    ctx.font = '10px "Press Start 2P"';
    ctx.fillText(`SCORE: ${score}`, canvas.width / 2, 210);
    ctx.fillText(`BEST: ${highScore}`, canvas.width / 2, 235);

    ctx.fillStyle = '#1b5e20';
    ctx.font = '9px "Press Start 2P"';
    ctx.fillText('Pressione ESPACO', canvas.width / 2, 280);
    ctx.fillText('ou CLIQUE para jogar', canvas.width / 2, 298);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function jump() {
  if (gameOver) {
    resetGame();
  } else {
    bird.velocity = bird.jump;
  }
}

// Eventos de entrada
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') jump();
});
canvas.addEventListener('click', jump);

// Inicializa a partida
loop();