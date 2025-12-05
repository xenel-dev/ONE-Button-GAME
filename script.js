const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load images
const birdImg = new Image();
birdImg.src = "images/bird.png";

const pipeBottomImg = new Image();
pipeBottomImg.src = "images/pipe.png";

const pipeTopImg = new Image();
pipeTopImg.src = "images/pipe2.png";

const bgImg = new Image();
bgImg.src = "images/background.png";

// Load sounds
const flapSound = new Audio("sounds/flap.mp3");

// Bird properties
let birdX = 50;
let birdY = 300;
let velocity = 0;
const gravity = 0.5;
const flapStrength = -8;
const birdRadius = 15;
let angle = 0;

// Pipes
let pipes = [];
const pipeWidth = 60;
const pipeGap = 150;
let frameCount = 0;

// Score
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
document.getElementById("highScoreDisplay").textContent = highScore;
let gameOver = false;
let started = false;

// Input
document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    if (!started) {
      started = true;
    } else if (gameOver) {
      restartGame();
    } else {
      velocity = flapStrength;
      angle = -25 * Math.PI / 180;
      flapSound.currentTime = 0; // rewind
      flapSound.play();          // play flap sound
    }
  }
});

function restartGame() {
  birdY = 300;
  velocity = 0;
  pipes = [];
  score = 0;
  frameCount = 0;
  gameOver = false;
  angle = 0;
}

function drawBackground() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
}

function drawBird() {
  ctx.save();
  ctx.translate(birdX, birdY);
  ctx.rotate(angle);
  ctx.drawImage(birdImg, -birdRadius, -birdRadius, birdRadius * 2, birdRadius * 2);
  ctx.restore();
}

function drawPipes() {
  pipes.forEach(pipe => {
    // Top pipe
    const topY = pipe.top - pipeTopImg.height;
    ctx.drawImage(pipeTopImg, pipe.x, topY, pipeWidth, pipeTopImg.height);

    // Bottom pipe
    ctx.drawImage(pipeBottomImg, pipe.x, pipe.top + pipeGap, pipeWidth, pipeBottomImg.height);
  });
}

function updatePipes() {
  if (frameCount % 100 === 0) {
    const minTop = 50;
    const maxTop = canvas.height - pipeGap - 50;
    const topHeight = Math.random() * (maxTop - minTop) + minTop;
    pipes.push({ x: canvas.width, top: topHeight, passed: false });
  }
  pipes.forEach(pipe => pipe.x -= 1.5); // slower speed
  pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

function checkCollision() {
  if (birdY + birdRadius > canvas.height || birdY - birdRadius < 0) {
    gameOver = true;
    updateHighScore();
  }
  pipes.forEach(pipe => {
    if (
      birdX + birdRadius > pipe.x &&
      birdX - birdRadius < pipe.x + pipeWidth &&
      (birdY - birdRadius < pipe.top || birdY + birdRadius > pipe.top + pipeGap)
    ) {
      gameOver = true;
      updateHighScore();
    }
    if (!pipe.passed && pipe.x + pipeWidth < birdX) {
      score++;
      pipe.passed = true;
    }
  });
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText(score, canvas.width / 2, 100);
}

function drawGameOver() {
  const boxWidth = 250;
  const boxHeight = 120;
  const boxX = canvas.width / 2 - boxWidth / 2;
  const boxY = canvas.height / 2 - boxHeight / 2;

  ctx.fillStyle = "#b03060"; // dark pink
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  ctx.fillStyle = "white";
  ctx.font = "28px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", canvas.width / 2, boxY + 40);
  ctx.font = "18px Arial";
  ctx.fillText("Press SPACE to Restart", canvas.width / 2, boxY + 80);
}

function drawStartScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "28px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Press SPACE to Start", canvas.width / 2, canvas.height / 2);
}

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
  document.getElementById("highScoreDisplay").textContent = highScore;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  if (!started) {
    drawStartScreen();
  } else if (!gameOver) {
    velocity += gravity;
    birdY += velocity;
    frameCount++;

    if (angle < 90 * Math.PI / 180) angle += 0.03;

    updatePipes();
    checkCollision();

    drawPipes();
    drawBird();
    drawScore();
  } else {
    drawPipes();
    drawBird();
    drawScore();
    drawGameOver();
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
