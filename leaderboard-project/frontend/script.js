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
// Function to detect if device is mobile
// function isMobileDevice() {
//   return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
// }

// If the user is not on a mobile device, block the game

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
  }, 800);
}
function createFlyingObstacle() {
  const flyingObstacle = document.createElement("img");
  flyingObstacle.src = "sword.png"; // Use your flying obstacle image
  flyingObstacle.classList.add("obstacle", "flying");
  flyingObstacle.style.left = `${window.innerWidth}px`;
  flyingObstacle.style.bottom = "100px"; // Adjust height so it "flies"
  document.querySelector(".game-container").appendChild(flyingObstacle);
  obstacles.push(flyingObstacle);
}

// Create a new obstacle
function createObstacle() {
  const obstacle = document.createElement("div");
  // obstacle.src = "murati.webp"; // Correctly set the source for the image
  const obstacleImg = document.createElement("img");
  obstacleImg.src = "murati.webp";
  obstacleImg.classList.add("obstacleImg");
  obstacle.appendChild(obstacleImg);
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
      // Make flying obstacles faster
      if (obstacle.classList.contains("flying")) {
        obstacleLeft -= gameSpeed * 3; // Flying obstacle is 50% faster
      } else {
        obstacleLeft -= gameSpeed; // Normal speed for ground obstacles
      }

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
    gameSpeed += 0.25;
  }
}

// Create obstacles periodically
function spawnObstacles() {
  setInterval(() => {
    createObstacle(); // Spawn regular obstacle immediately

    // Spawn the flying obstacle 500ms before the regular one
    setTimeout(() => {
      if (!isGameOver) {
        createFlyingObstacle();
      }
    }, 50); // Flying obstacle appears 500ms before the regular one
  }, 1500); // Regular + flying obstacles will spawn every 2 seconds
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

if (!isMobileDevice()) {
  // Hide name input form and game container
  document.addEventListener("DOMContentLoaded", () => {
    const nameInput = document.getElementById("nameInputContainer");
    const gameContainer = document.getElementById("gameContainer");

    if (nameInput) nameInput.style.display = "none";
    if (gameContainer) gameContainer.style.display = "none";

    // Create and show a message for desktop users
    const message = document.createElement("div");
    message.style.marginTop = "200px";
    message.style.textAlign = "center";
    message.innerHTML = `
      <p style="font-size: 24px; font-weight: bold; color: black;">
        🛑 ეს თამაში მუშაობს მხოლოდ მობილურ მოწყობილობებზე!
      </p>
    `;
    document.body.appendChild(message);
  });
}

// Start the game when the page loads
// (No automatic game start now as user has to enter their name)
