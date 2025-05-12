// Get references to DOM elements
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const gameOverScreen = document.getElementById("gameOver");
const jumpBtn = document.getElementById("jumpBtn");

// Game variables
let score = 0;
let gameSpeed = 5; // Initial speed of the obstacles
let isGameOver = false;
let obstacles = [];
let gameInterval, scoreInterval;
let isJumping = false;

function jump() {
  if (isGameOver || isJumping) return; // Don't jump if already jumping or game over

  isJumping = true;
  player.classList.add("jumping"); // Apply the jumping class to move player up

  setTimeout(() => {
    player.classList.remove("jumping"); // Remove jumping class after the jump
    isJumping = false; // Allow the player to jump again after landing
  }, 600); // Reduce this time for a quicker fall (down time)
}

// Create a new obstacle
// Create a new obstacle
function createObstacle() {
  const obstacle = document.createElement("img");
  obstacle.src = "murati.webp"; // Correctly set the source for the image
  obstacle.classList.add("obstacle");
  obstacle.style.left = `${window.innerWidth}px`; // Position the obstacle off-screen to the right
  document.querySelector(".game-container").appendChild(obstacle);
  obstacles.push(obstacle);
}

// Move all obstacles
function moveObstacles() {
  obstacles.forEach((obstacle, index) => {
    let obstacleLeft = parseFloat(obstacle.style.left);

    // Remove the obstacle if it's off-screen
    if (obstacleLeft < -20) {
      obstacle.remove();
      obstacles.splice(index, 1); // Remove from obstacles array
    } else {
      // Move the obstacle towards the left
      obstacleLeft -= gameSpeed;
      obstacle.style.left = `${obstacleLeft}px`;
    }

    // Collision detection
    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    if (
      playerRect.right > obstacleRect.left &&
      playerRect.left < obstacleRect.right &&
      playerRect.bottom > obstacleRect.top &&
      playerRect.top < obstacleRect.bottom
    ) {
      gameOver();
    }
  });
}

// Game over logic
function gameOver() {
  isGameOver = true;
  gameOverScreen.classList.remove("hidden");
  clearInterval(gameInterval); // Stop the game loop
  clearInterval(scoreInterval); // Stop the score updating
}

// Restart the game
function restartGame() {
  score = 0;
  gameSpeed = 5;
  isGameOver = false;
  obstacles.forEach((obstacle) => obstacle.remove()); // Remove existing obstacles
  obstacles = []; // Reset the obstacles array
  scoreDisplay.textContent = "გარბენი: 0 კილომეტრი";
  gameOverScreen.classList.add("hidden");

  // Restart the game loop
  gameInterval = setInterval(moveObstacles, 1000 / 60); // 60 FPS
  scoreInterval = setInterval(updateScore, 100); // Update score every 100ms
}

// Update the score
function updateScore() {
  score++;
  scoreDisplay.textContent = `გარბენი: ${score} კილომეტრი`;

  // Increase game speed every 1000 points
  if (score % 1000 === 0) {
    gameSpeed += 1;
  }
}

// Create obstacles periodically
function spawnObstacles() {
  setInterval(createObstacle, 2000); // New obstacle every 2 seconds
}

// Initialize game
function startGame() {
  gameInterval = setInterval(moveObstacles, 2500 / 240); // 60 FPS
  scoreInterval = setInterval(updateScore, 100); // Update score every 100ms
  spawnObstacles(); // Start spawning obstacles
}

// Event listeners for jump (mobile button and keyboard)
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});

jumpBtn.addEventListener("click", jump);

// Start the game when the page loads
startGame();
