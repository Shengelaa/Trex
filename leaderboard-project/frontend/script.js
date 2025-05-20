const imageCache = {};

(function () {
  function isMobileDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileUA =
      /android|iphone|ipad|ipod|iemobile|blackberry|bada|mobile/i.test(ua);
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;

    return isMobileUA && isTouch && isSmallScreen;
  }

  function blockGame() {
    window.location.href = "about:blank";
  }

  if (!isMobileDevice()) {
    blockGame();
  }

  window.addEventListener("resize", () => {
    if (!isMobileDevice()) {
      blockGame();
    }
  });
})();
function isRealMobileDevice() {
  const hasTouchScreen =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  const isMobileUA = /android|iphone|ipad|ipod/i.test(navigator.userAgent);

  return hasTouchScreen && isSmallScreen && isMobileUA;
}

function preloadImages(imageSources, callback) {
  let loadedCount = 0;
  const total = imageSources.length;

  imageSources.forEach((src) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      imageCache[src] = img;
      loadedCount++;
      if (loadedCount === total && typeof callback === "function") {
        callback();
      }
    };
  });
}

// Game elements
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const gameOverScreen = document.getElementById("gameOver");
const jumpBtn = document.getElementById("jumpBtn");
const startGameBtn = document.getElementById("startGameBtn");
const playerNameInput = document.getElementById("playerName");
const nameInputContainer = document.getElementById("nameInputContainer");
const gameContainer = document.getElementById("gameContainer");
const deadScore = document.getElementsByClassName("p4");
const bonusIndicator = document.getElementById("bonusIndicator");
const first = document.createElement("img");
first.src = "first.png";

const second = document.createElement("img");
second.src = "second.png";
const third = document.createElement("img");
third.src = "third.png";

first.classList.add("medal");
second.classList.add("medal");
third.classList.add("medal");
// Game variables
let score = 0;
let gameSpeed = 5;
let isGameOver = false;
let obstacles = [];
let gameInterval, scoreInterval;
let isJumping = false;
let playerName = "";
let isBonusActive = false;
let bonusTimeout;
let flyingObstacleSpeedMultiplier = 3; // Flying obstacles will be 3x faster
let selectedSkin = "yle.webp"; // Default skin

// Handle skin selection
// Handle skin selection
// Handle skin selection
document.querySelectorAll(".skin-option").forEach((img) => {
  img.addEventListener("click", () => {
    document
      .querySelectorAll(".skin-option")
      .forEach((i) => i.classList.remove("selected"));
    img.classList.add("selected");
    selectedSkin = img.getAttribute("data-skin"); // Save selected skin

    // Update player's image src and width
    const playerImg = player.querySelector("img"); // Get the player image element
    playerImg.src = selectedSkin; // Update the image source

    // Check if the player's image is "loti.png", and adjust the width accordingly
    if (selectedSkin === "loti.png") {
      const width = "60px";
      const height = "80px";

      playerImg.style.width = width;
      playerImg.style.height = height;
      playerImg.style.marginLeft = "5px";
      player.style.width = "45px";
      player.style.height = height;

      // If you want to center it instead:
      // player.style.margin = "0 auto";
    } else {
      playerImg.style.width = ""; // Reset width to default (optional)
    }
  });
});

// Create a coin obstacle
function createCoinObstacle() {
  const coin = document.createElement("img");
  coin.src = "coin.png"; // Make sure the image is preloaded
  coin.classList.add("obstacle", "coin");
  coin.style.left = `${window.innerWidth}px`;
  coin.style.bottom = "45px"; // Slightly above the ground
  document.querySelector(".game-container").appendChild(coin);
  obstacles.push(coin);
}

// Handle bonus activation (4x score for 20 seconds)
function activateBonus() {
  if (bonusTimeout) clearTimeout(bonusTimeout);

  isBonusActive = true;
  bonusIndicator.classList.remove("hidden"); // Show bonus indicator

  bonusTimeout = setTimeout(() => {
    isBonusActive = false;
    bonusIndicator.classList.add("hidden"); // Hide bonus indicator after 20 seconds
  }, 5000); // 20 seconds duration for the bonus
}

// Update score logic with bonus (4x score if bonus is active)
function updateScore() {
  if (isBonusActive) {
    score += 3; // Increase score 4x if bonus is active
  } else {
    score++; // Normal score increment
  }

  scoreDisplay.textContent = `გარბენი: ${score} კილომეტრი`;

  if (score % 1000 === 0) {
    gameSpeed += 0.25; // Increase game speed after every 1000 points
  }
}

// Move obstacles and check for collisions
function moveObstacles() {
  obstacles.forEach((obstacle, index) => {
    let obstacleLeft = parseFloat(obstacle.style.left);

    if (obstacleLeft < -50) {
      obstacle.remove();
      obstacles.splice(index, 1);
    } else {
      const speedMultiplier = obstacle.classList.contains("flying")
        ? flyingObstacleSpeedMultiplier // Apply faster speed for flying obstacles
        : 1; // Regular obstacles have normal speed

      obstacleLeft -= gameSpeed * speedMultiplier;
      obstacle.style.left = `${obstacleLeft}px`;
    }

    // Check for collision with player
    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    if (
      playerRect.right > obstacleRect.left &&
      playerRect.left < obstacleRect.right &&
      playerRect.bottom > obstacleRect.top &&
      playerRect.top < obstacleRect.bottom
    ) {
      if (obstacle.classList.contains("coin")) {
        // Coin collected — activate bonus and don't game over
        obstacle.remove();
        obstacles.splice(index, 1);
        activateBonus(); // Activating the bonus
      } else {
        // Hit by regular enemy obstacle — game over
        gameOver();
      }
    }
  });
}

// Spawn obstacles (with coins included)
function spawnObstacles() {
  let obstacleCounter = 0; // Keep track of how many obstacles have spawned

  setInterval(() => {
    if (!isGameOver) {
      createObstacle();
      obstacleCounter++;

      // Spawn a flying obstacle after every 3 obstacles
      if (obstacleCounter % 1 === 0) {
        setTimeout(() => {
          if (!isGameOver) createFlyingObstacle();
        }, 1500); // Flying obstacle
      }

      // Spawn a coin every 4th obstacle (or adjust the condition to your preference)
      if (obstacleCounter % 10 === 0) {
        setTimeout(() => {
          if (!isGameOver) createCoinObstacle();
        }, 800); // Coin obstacle
      }
    }
  }, 2000); // Obstacles spawn every 2 seconds
}

// Event listener for starting the game
startGameBtn.addEventListener("click", () => {
  playerName = playerNameInput.value.trim();

  if (playerName === "") {
    alert("Please enter a name to start playing!");
    return;
  }

  // Set the player's selected skin
  const playerImg = player.querySelector("img");
  playerImg.src = selectedSkin;

  nameInputContainer.style.display = "none";
  gameContainer.style.display = "block";

  preloadImages(["murati.webp", "sword.png", "coin.png", "ira.webp", "loti.png", "yanwi.png", "gvino.png", selectedSkin], () => {
    startGame(); // Start the game only after images are loaded
  });
});

// Jump function
function jump(event) {
  event.preventDefault();
  event.stopPropagation(); // Stops the event from bubbling up

  jumpBtn.blur();

  if (isGameOver || isJumping) return;

  isJumping = true;
  jumpBtn.style.display = "none";
  player.classList.add("jumping");

  setTimeout(() => {
    player.classList.remove("jumping");
    isJumping = false;
  }, 600);

  setTimeout(() => {
    jumpBtn.style.display = "block";
  }, 800);
}

jumpBtn.addEventListener("click", jump);

// Create a flying obstacle
function createFlyingObstacle() {
  const flyingObstacle = document.createElement("img");

  // 🔄 Use yanwi.png if player skin is loti.png
  if (selectedSkin === "loti.png") {
    flyingObstacle.src = "yanwi.png";
    flyingObstacle.style.height = "30px"; // Optional: make it smaller
  } else {
    flyingObstacle.src = "sword.png";
  }

  flyingObstacle.classList.add("obstacle", "flying");
  flyingObstacle.style.left = `${window.innerWidth}px`;
  flyingObstacle.style.bottom = "100px";
  document.querySelector(".game-container").appendChild(flyingObstacle);
  obstacles.push(flyingObstacle);
}

function refreshPage() {
  location.reload(); // This reloads the current page
}

// Create regular obstacles
function createObstacle() {
  const obstacle = document.createElement("div");
  const obstacleImg = document.createElement("img");
  obstacleImg.src = "murati.webp";
  obstacleImg.classList.add("obstacleImg");
  obstacle.appendChild(obstacleImg);
  obstacle.classList.add("obstacle");
  obstacle.style.left = `${window.innerWidth}px`;
  document.querySelector(".game-container").appendChild(obstacle);
  obstacles.push(obstacle);
}

// Handle game over logic
function gameOver() {
  isGameOver = true;

  gameOverScreen.classList.remove("hidden");
  clearInterval(gameInterval);
  clearInterval(scoreInterval);

  fetch("https://scores1-dha8.vercel.app/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName, score }),
  }).then(() => {
    updateLeaderboard();
  });

  if (deadScore.length > 0) {
    deadScore[0].textContent = `შენ გაირბინე ${score} კილომეტრი`;
  }
}

// Restart the game
function restartGame() {
  score = 0;
  gameSpeed = 5;
  isGameOver = false;
  obstacles.forEach((obstacle) => obstacle.remove());
  obstacles = [];
  scoreDisplay.textContent = "გარბენი: 0";
  gameOverScreen.classList.add("hidden");

  gameInterval = setInterval(moveObstacles, 1000 / 60);
  scoreInterval = setInterval(updateScore, 100);
}

// Start the game
function startGame() {
  updateLeaderboard();

  // Change obstacles based on selected skin
  if (selectedSkin === "loti.png") {
    changeObstacleImage("gvino.png"); // Use gvino.png as obstacle image
  } else {
    changeObstacleImage("murati.webp"); // Default obstacle image
  }

  gameInterval = setInterval(moveObstacles, 1000 / 60);
  scoreInterval = setInterval(updateScore, 100);
  spawnObstacles();
}

// Function to change the obstacle image dynamically
function changeObstacleImage(imageSrc) {
  // Update the createObstacle function to use the new image
  createObstacle = function () {
    const obstacle = document.createElement("div");
    const obstacleImg = document.createElement("img");
    obstacleImg.src = imageSrc; // Use the image passed to the function
    obstacleImg.classList.add("obstacleImg");
    obstacle.appendChild(obstacleImg);
    obstacle.classList.add("obstacle");
    obstacle.style.left = `${window.innerWidth}px`;
    document.querySelector(".game-container").appendChild(obstacle);
    obstacles.push(obstacle);
  };
}

// Update leaderboard function to include 1st, 2nd, and 3rd place images
// Update leaderboard function to include 1st, 2nd, and 3rd place images
// Update leaderboard function to include 1st, 2nd, and 3rd place images
function updateLeaderboard() {
  fetch("https://scores1-dha8.vercel.app/api/data")
    .then((res) => res.json())
    .then((data) => {
      const leaderboard = document.querySelector(".uls");
      leaderboard.innerHTML = ""; // Clear existing leaderboard entries

      data.forEach((entry, index) => {
        // Determine medal image for 1st, 2nd, and 3rd place
        let medalImage;
        if (index === 0) {
          medalImage = first; // Gold medal image for 1st place
        } else if (index === 1) {
          medalImage = second; // Silver medal image for 2nd place
        } else if (index === 2) {
          medalImage = third; // Bronze medal image for 3rd place
        }

        const li = document.createElement("li");

        // Ensure the medal image is visible and appropriately sized
        if (medalImage) {
          // Optional styling for image size
          medalImage.style.width = "30px"; // Adjust size to fit the list
          medalImage.style.height = "auto";
          medalImage.style.marginRight = "10px"; // Space between the image and the score
          medalImage.style.marginLeft = "5px";
          li.appendChild(medalImage);
        }

        // Display the player's score with the ID and score
        li.innerHTML += `${entry._id}: ${entry.score} გარბენით `;

        leaderboard.appendChild(li);
      });
    });
}
