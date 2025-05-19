const imageCache = {};

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

// Get references to DOM elements
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");
const gameOverScreen = document.getElementById("gameOver");
const jumpBtn = document.getElementById("jumpBtn");
const startGameBtn = document.getElementById("startGameBtn");
const playerNameInput = document.getElementById("playerName");
const nameInputContainer = document.getElementById("nameInputContainer");
const gameContainer = document.getElementById("gameContainer");
const deadScore = document.getElementsByClassName("p4");

// Game variables
let score = 0;
let gameSpeed = 5;
let isGameOver = false;
let obstacles = [];
let gameInterval, scoreInterval;
let isJumping = false;
let playerName = "";

// Event listener for starting the game
startGameBtn.addEventListener("click", () => {
  playerName = playerNameInput.value.trim();

  if (playerName === "") {
    alert("Please enter a name to start playing!");
    return;
  }

  nameInputContainer.style.display = "none";
  gameContainer.style.display = "block";

  preloadImages(["murati.webp", "sword.png"], () => {
    startGame(); // Start the game only after images are loaded
  });
});

function jump() {
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

function createFlyingObstacle() {
  const flyingObstacle = document.createElement("img");
  flyingObstacle.src = "sword.png";
  flyingObstacle.classList.add("obstacle", "flying");
  flyingObstacle.style.left = `${window.innerWidth}px`;
  flyingObstacle.style.bottom = "100px";
  document.querySelector(".game-container").appendChild(flyingObstacle);
  obstacles.push(flyingObstacle);
}

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

function moveObstacles() {
  obstacles.forEach((obstacle, index) => {
    let obstacleLeft = parseFloat(obstacle.style.left);

    if (obstacleLeft < -20) {
      obstacle.remove();
      obstacles.splice(index, 1);
    } else {
      if (obstacle.classList.contains("flying")) {
        obstacleLeft -= gameSpeed * 2.5;
      } else {
        obstacleLeft -= gameSpeed;
      }
      obstacle.style.left = `${obstacleLeft}px`;
    }

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

function updateScore() {
  score++;
  scoreDisplay.textContent = `გარბენი: ${score} კილომეტრი`;

  if (score % 1000 === 0) {
    gameSpeed += 0.25;
  }
}

function spawnObstacles() {
  setInterval(() => {
    if (!isGameOver) {
      createObstacle();
      setTimeout(() => {
        if (!isGameOver) createFlyingObstacle();
      }, 300); // Flying obstacle spawns just a bit after ground one
    }
  }, 2000);
}

function startGame() {
  updateLeaderboard();
  gameInterval = setInterval(moveObstacles, 1000 / 60);
  scoreInterval = setInterval(updateScore, 100);
  spawnObstacles();
}

function updateLeaderboard() {
  fetch("https://scores1-dha8.vercel.app/api/data")
    .then((res) => res.json())
    .then((data) => {
      const leaderboard = document.querySelector(".uls");
      leaderboard.innerHTML = "";

      data.forEach((entry, index) => {
        const medal = ["🥇", "🥈", "🥉"][index] || "";
        const li = document.createElement("li");
        li.textContent = `~  ${medal} ${entry._id}: ${entry.score} points ~`;
        leaderboard.appendChild(li);
      });
    });
}

jumpBtn.addEventListener("click", jump);

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

if (!isMobileDevice()) {
  document.addEventListener("DOMContentLoaded", () => {
    const nameInput = document.getElementById("nameInputContainer");
    const gameContainer = document.getElementById("gameContainer");

    if (nameInput) nameInput.style.display = "none";
    if (gameContainer) gameContainer.style.display = "none";

    const message = document.createElement("div");
    message.style.marginTop = "200px";
    message.style.textAlign = "center";
    message.innerHTML = `
      <p style="font-size: 24px; font-weight: bold; color: black; margin-bottom: 130px;">
        🛑 ეს თამაში მუშაობს მხოლოდ ტელეფონებზე! 🛑
      </p>
       <p style="font-size: 24px; font-weight: bold; color: black;">
        🛑 This game only works on mobiles! 🛑
      </p>
    `;
    document.body.appendChild(message);
  });
}
