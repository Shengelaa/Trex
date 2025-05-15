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
  if (isGameOver || isJumping) return;

  isJumping = true;
  jumpBtn.disabled = true; // Disable the button
  player.classList.add("jumping");

  setTimeout(() => {
    player.classList.remove("jumping");
    isJumping = false;
  }, 600);

  // Re-enable button after 500ms
  setTimeout(() => {
    jumpBtn.disabled = false;
  }, 600);
}

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

  // Send the score to the backend
  const playerName = "Player1"; // You can change this dynamically if needed
  fetch("http://localhost:3000/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName, score }),
  }).then(() => {
    updateLeaderboard(); // Update the leaderboard after saving the score
  });
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

// Fetch and update leaderboard
function updateLeaderboard() {
  fetch("http://localhost:3000/scores/top")
    .then((res) => res.json())
    .then((data) => {
      const leaderboard = document.querySelector(".uls");
      leaderboard.innerHTML = ""; // Clear existing leaderboard

      data.forEach((entry, index) => {
        const medal = ["🥇", "🥈", "🥉"][index] || "";
        const li = document.createElement("li");
        li.textContent = `${medal} ${entry.name}: ${entry.score}`;
        leaderboard.appendChild(li);
      });
    });
}

// Start the game when the page loads
startGame();
