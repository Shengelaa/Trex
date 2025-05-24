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
const bulletsLeftDisplay = document.getElementById("bulletsLeft");

let gunCollected = false;
let bullets = 0;
let obstacleSpawnCount = 0;
const gunBtn = document.getElementById("gunBtn"); // Add button in HTML
const gunImg = document.createElement("img"); // Image to show player is holding gun
gunImg.src = "gun.png";
gunImg.classList.add("player-gun");
first.src = "first.png";
const jumpSounds = new Audio("sounds/jumping3.wav");

const deathSound = new Audio("sounds/deathsoudn.wav");

function deathSoundFun() {
  deathSound.currentTime = 0;
  deathSound.play();
}
const laughtSound = new Audio("sounds/laught.wav");

function laughtFunction() {
  laughtSound.currentTime = 0;
  laughtSound.play();
}

const coinPickUpSound = new Audio("sounds/coin.wav");

function coinPlaySound() {
  coinPickUpSound.currentTime = 0;
  coinPickUpSound.play();
}

const shootSound = new Audio("sounds/shooting.wav");

function ShootingSound() {
  shootSound.currentTime = 0;
  shootSound.play();
}

function playJumpSound() {
  jumpSounds.currentTime = 0;
  jumpSounds.play();
}

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
let paused = false;
let obstacleSpawnerInterval;

document.getElementById("pauseButton").addEventListener("click", () => {
  paused = !paused;

  if (paused) {
    clearInterval(gameInterval);
    clearInterval(scoreInterval);
    clearInterval(obstacleSpawnerInterval); // Stop spawning obstacles on pause
    document.getElementById("pauseButton").textContent = "▶  გაგრძელება";
  } else {
    gameInterval = setInterval(moveObstacles, 1000 / 60);
    scoreInterval = setInterval(updateScore, 100);
    spawnObstacles(); // Restart spawning obstacles after unpausing
    document.getElementById("pauseButton").textContent = "❚❚ პაუზა";
  }
});

pauseButton.onclick = function () {
  // Hide the button immediately
  pauseButton.style.display = "none";

  // Show it again after 1 second (1000 milliseconds)
  setTimeout(() => {
    pauseButton.style.display = "inline-block"; // or "block" depending on your layout
  }, 2500);

  // Your existing pause logic here...
};

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
  coinPlaySound();
  bonusTimeout = setTimeout(() => {
    isBonusActive = false;
    bonusIndicator.classList.add("hidden"); // Hide bonus indicator after 20 seconds
  }, 5000); // 20 seconds duration for the bonus
}

// Update score logic with bonus (4x score if bonus is active)
function updateScore() {
  if (paused || isGameOver) return; // Don't increase score if paused or game over

  if (isBonusActive) {
    score += 3; // Increase score 4x if bonus is active
  } else {
    score++; // Normal score increment
  }

  scoreDisplay.textContent = `გარბენი: ${score} კილომეტრი`;
  scoreDisplay.style.marginTop = "20px";

  if (score % 1000 === 0) {
    gameSpeed += 0.25; // Increase game speed after every 1000 points
  }
}

// Move obstacles and check for collisions
function moveObstacles() {
  if (paused || isGameOver) return;

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
      } else if (obstacle.classList.contains("gun")) {
        // Gun collected
        gunCollected = true;
        bullets = 3;
        gunBtn.classList.remove("hidden"); // Show gun button
        bulletsLeftDisplay.classList.remove("hiddennn");
        obstacle.remove();
        obstacles.splice(index, 1);
        bulletsLeftDisplay.textContent = "ტყვიები: 3";
      } else {
        gameOver();
      }
    }
  });
}
function spawnGunPickup() {
  const gun = document.createElement("img");
  gun.src = "gun.png";
  gun.classList.add("obstacle", "gun");
  gun.style.left = `${window.innerWidth}px`;
  gun.style.bottom = "25px";
  gun.style.width = "40px";
  gun.style.height = "auto";
  gun.style.borderRadius = "0px";
  gun.classList.add("gavisrole");

  document.querySelector(".game-container").appendChild(gun);

  obstacles.push(gun);
}

// Spawn obstacles (with coins included)
function spawnObstacles() {
  obstacleSpawnerInterval = setInterval(() => {
    if (!isGameOver && !paused) {
      // <-- Also check for paused here
      createObstacle();
      obstacleSpawnCount++;

      if (obstacleSpawnCount % 40 === 0) {
        setTimeout(() => {
          if (!isGameOver && !paused) spawnGunPickup();
        }, 1000);
      }

      if (obstacleSpawnCount % 1 === 0) {
        setTimeout(() => {
          if (!isGameOver && !paused) createFlyingObstacle();
        }, 1500);
      }

      if (obstacleSpawnCount % 10 === 0) {
        setTimeout(() => {
          if (!isGameOver && !paused) createCoinObstacle();
        }, 800);
      }
    }
  }, 2000);
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

  preloadImages(
    [
      "murati.webp",
      "sword.png",
      "coin.png",
      "ira.webp",
      "loti.png",
      "yanwi.png",
      "gvino.png",
      selectedSkin,
    ],
    () => {
      startGame(); // Start the game only after images are loaded
    }
  );
});

// Jump function
function jump(event) {
  event.preventDefault();
  event.stopPropagation(); // Stops the event from bubbling up

  if (paused || isGameOver || isJumping) return; // Prevent jump if paused
  const btn = document.getElementById("pauseButton");
  btn.style.opacity = "0.3";
  jumpBtn.blur();
  isJumping = true;
  jumpBtn.style.display = "none";

  player.classList.add("jumping");

  setTimeout(() => {
    player.classList.remove("jumping");
    isJumping = false;
  }, 600);

  setTimeout(() => {
    jumpBtn.style.display = "block";
    btn.style.opacity = "1";
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
  gunCollected = false;
  paused = false; // <-- Reset paused on game over
  bullets = 0;
  gunBtn.classList.add("hidden"); // Hide gun button
  deathSoundFun();

  gameOverScreen.classList.remove("hidden");

  clearInterval(gameInterval);
  clearInterval(scoreInterval);
  clearInterval(obstacleSpawnerInterval); // Also clear spawner on game over
  fetch("https://scores2.vercel.app/api/data", {
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
  gunCollected = false;
  bullets = 0;
  gunBtn.classList.add("hidden");
  paused = false; // <-- Reset paused when restarting
  score = 0;
  gameSpeed = 5;
  isGameOver = false;
  obstacles.forEach((obstacle) => obstacle.remove());
  obstacles = [];
  scoreDisplay.textContent = "გარბენი: 0";
  gameOverScreen.classList.add("hidden");
  bulletsLeftDisplay.classList.add("hiddennn");
  gameInterval = setInterval(moveObstacles, 1000 / 60);
  scoreInterval = setInterval(updateScore, 100);
  spawnObstacles();
  document.getElementById("pauseButton").textContent = "⏸ პაუზა";
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
  document.getElementById("pauseButton").style.display = "inline-block"; // or "block"

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
  fetch("https://scores2.vercel.app/api/data")
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
gunBtn.addEventListener("click", () => {
  if (!gunCollected || bullets <= 0 || isGameOver) return;

  bullets--;

  // Update bullets left display right after shooting

  if (bullets === 2) {
    bulletsLeftDisplay.textContent = `ტყვიები: 2`;
    bulletsLeftDisplay.classList.remove("hiddennn");
  } else if (bullets === 1) {
    bulletsLeftDisplay.textContent = `ტყვიები: 1`;
    bulletsLeftDisplay.classList.remove("hiddennn");
  } else if (bullets === 3) {
    bulletsLeftDisplay.textContent = `ტყვიები: 3`;
    bulletsLeftDisplay.classList.remove("hiddennn");
  } else {
    bulletsLeftDisplay.classList.add("hiddennn");
  }

  // Create a bullet
  const bullet = document.createElement("div");
  bullet.classList.add("bullet");
  bullet.style.left = `${player.offsetLeft + 40}px`;
  bullet.style.bottom = "60px";
  document.querySelector(".game-container").appendChild(bullet);

  // Move bullet
  const interval = setInterval(() => {
    let left = parseFloat(bullet.style.left);
    if (left > window.innerWidth) {
      bullet.remove();
      clearInterval(interval);
      score + 150;
      return;
    }

    bullet.style.left = `${left + 15}px`;

    // Collision with ground obstacles only
    obstacles.forEach((obstacle, index) => {
      if (
        !obstacle.classList.contains("flying") &&
        obstacle.getBoundingClientRect().left <
          bullet.getBoundingClientRect().right &&
        obstacle.getBoundingClientRect().right >
          bullet.getBoundingClientRect().left &&
        obstacle.getBoundingClientRect().bottom >
          bullet.getBoundingClientRect().top &&
        obstacle.getBoundingClientRect().top <
          bullet.getBoundingClientRect().bottom
      ) {
        obstacle.remove();
        obstacles.splice(index, 1);

        bullet.remove();
        clearInterval(interval);
      }
    });
    ShootingSound();
  }, 20);

  // Hide gun button and reset gunCollected if no bullets left
  if (bullets <= 0) {
    gunBtn.classList.add("hidden");
    gunCollected = false; // optional
  }
});
