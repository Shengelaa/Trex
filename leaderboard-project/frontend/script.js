// Get references to DOM elements
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const gameOverScreen = document.getElementById("gameOver");
const jumpBtn = document.getElementById("jumpBtn");
const startGameBtn = document.getElementById("startGameBtn");
const playerNameInput = document.getElementById("playerName");
const nameInputContainer = document.getElementById("nameInputContainer");
const gameContainer = document.getElementById("gameContainer");

// Game variables
let score = 0;
let gameSpeed = 5; // Initial speed of the obstacles
let isGameOver = false;
let obstacles = [];
let gameInterval, scoreInterval;
let isJumping = false;
let playerName = "";

// Event listener for starting the game
startGameBtn.addEventListener("click", () => {
  playerName = playerNameInput.value.trim(); // Get the player's name

  if (playerName === "") {
    alert("Please enter a name to start playing!"); // Ensure name is entered
    return;
  }

  // Hide the name input and show the game container
  nameInputContainer.style.display = "none";
  gameContainer.style.display = "block";

  startGame(); // Start the game logic
});

function jump() {
  if (isGameOver || isJumping) return;

  isJumping = true;

  // Hide the button
  jumpBtn.style.display = "none";

  player.classList.add("jumping");

  setTimeout(() => {
    player.classList.remove("jumping");
    isJumping = false;
  }, 600);

  // Re-show the button after 600ms
  setTimeout(() => {
    jumpBtn.style.display = "block"; // or 'inline-block' depending on your layout
  }, 1000);
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
  fetch("https://scores1-dha8.vercel.app/api/data", {
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
  updateLeaderboard();
  gameInterval = setInterval(moveObstacles, 1000 / 60); // 60 FPS
  scoreInterval = setInterval(updateScore, 100); // Update score every 100ms
  spawnObstacles(); // Start spawning obstacles
}

// Fetch and update leaderboard
function updateLeaderboard() {
  fetch("https://scores1-dha8.vercel.app/api/data")
    .then((res) => res.json())
    .then((data) => {
      const leaderboard = document.querySelector(".uls");
      leaderboard.innerHTML = ""; // Clear existing leaderboard

      data.forEach((entry, index) => {
        const medal = ["🥇", "🥈", "🥉"][index] || "";
        const li = document.createElement("li");
        li.textContent = `~  ${medal} ${entry._id}: ${entry.score} გარბენით  ~`;
        leaderboard.appendChild(li);
      });
    });
}

// Event listeners for jump (mobile button and keyboard)

jumpBtn.addEventListener("click", jump);

// Start the game when the page loads
// (No automatic game start now as user has to enter their name)
