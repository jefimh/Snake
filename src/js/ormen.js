/**
 * @fileoverview Core Snake game module
 * Handles the main game logic including snake movement, collisions,
 * scoring, and game progression for a Snake game implementation.
 *
 * @author Jefim Holmgren
 */

"use strict";
window.addEventListener("load", onStart);
window.addEventListener("keydown", keyListener);
document
  .getElementById("btnStart/Pause")
  .addEventListener("click", handleStartPauseButton);
document
  .getElementById("borderMovementOption")
  .addEventListener("change", getBorderMovementValue);

var button = document.getElementById("btnStart/Pause");

var playerSnakeHeadColor = "green";
var playerSnakeBodyColor = "blue";

var enemySnakeHeadColor = "brown";
var enemySnakeBodyColor = "red";

var foodCubeColor = "limegreen";

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

var amountOfFoodEaten = 0;
var startScore = 0;
var highScore = 0;
var amountOfFoodPerLevelUp = 5;
var gameLoopSpeedIncreasePerLevelUp = 5;
var timeFoodHasBeenAlive = 0;
var foodPositionChangeRate = 0;

var gameLoopTimerUpdateFrequency = 120;
var snakeMovementTimerUpdateFrequency = 200;

var playerSnakeRectangles = [];
var enemySnakeRectangles = [];
var obstacles = [];

var foodPosX = 0;
var foodPosY = 0;

var movementDeltaX = 10;
var movementDeltaY = 10;

var amountOfBlocks = 7;
var amountOfBlocksInObstacle = 1;

var startLevel = 1;
var currentLevel = 1;
var maxLevel = 8;

var rectangleSize = 10;

var snakeMovementDirection = "right";

var gameLoopTimer;
var snakeMovementTimer;
var timerupdateFoodTimeAlive;

var isPaused = true;
var hasGameStarted = false;
var hasLeveledUpToNextLevel = false;
var isBorderMovementOn = true;

/**
* Constructor for creating snake body segments
* @constructor
* @param {number} x - X coordinate of the segment
* @param {number} y - Y coordinate of the segment
*/
function SnakeRectangle(x, y) {
  this.x = x;
  this.y = y;
}

/**
* Constructor for creating obstacle blocks
* @constructor
* @param {number} x - X coordinate of the obstacle
* @param {number} y - Y coordinate of the obstacle 
*/
function Obstacle(x, y) {
  this.x = x;
  this.y = y;
}

/**
* Gets the border movement setting from UI and updates game state
*/
function getBorderMovementValue() {
  var selectedValue = document.getElementById("borderMovementOption").value;

  if (selectedValue == "true") {
    isBorderMovementOn = true;
  } else if (selectedValue == "false") {
    isBorderMovementOn = false;
  }
}

/**
* Initializes/resets the game state to starting conditions
*/
function onStart() {
  //Spelarens Snake
  playerSnakeRectangles.length = 0;
  enemySnakeRectangles.length = 0;
  startScore = 0;
  amountOfFoodEaten = 0;
  currentLevel = 1;
  obstacles.length = 0;
  snakeMovementDirection = "right";
  gameLoopTimerUpdateFrequency = 120;
  snakeMovementTimerUpdateFrequency = 200;

  playerSnakeRectangles.unshift(new SnakeRectangle(0, 0));
  playerSnakeRectangles.unshift(new SnakeRectangle(10, 0));
  playerSnakeRectangles.unshift(new SnakeRectangle(20, 0));
  playerSnakeRectangles.unshift(new SnakeRectangle(30, 0));
  playerSnakeRectangles.unshift(new SnakeRectangle(40, 0));
  drawSnake(playerSnakeRectangles, playerSnakeHeadColor, playerSnakeBodyColor);

  //Fiende Snake
  enemySnakeRectangles.unshift(new SnakeRectangle(0, 390));
  enemySnakeRectangles.unshift(new SnakeRectangle(10, 390));
  enemySnakeRectangles.unshift(new SnakeRectangle(20, 390));
  drawSnake(enemySnakeRectangles, enemySnakeHeadColor, enemySnakeBodyColor);

  //Mat
  spawnFood();

  foodPositionChangeRate = newFoodPositionChangeRate();
  updateFoodTimeAlive();
  updateCanvas();
}

/**
* Updates game level based on user input and adjusts game parameters
*/
function updateStartLevel() {
  var selectedStartLevel = document.getElementById("startLevelInput").value;
  var levelDisplay = document.getElementById("nivåDisplay");
  var eatenFoodTextCount = document.getElementById(
    "textAntaletUppätnaMumsbitar"
  );

  if (selectedStartLevel <= maxLevel) {
    currentLevel = selectedStartLevel;
  } else if (selectedStartLevel >= maxLevel) {
    currentLevel = maxLevel;
  }

  if (selectedStartLevel < 1) {
    currentLevel = startLevel;
    console.log(currentLevel);
  }

  gameLoopTimerUpdateFrequency -=
    gameLoopSpeedIncreasePerLevelUp * currentLevel;
  snakeMovementTimerUpdateFrequency -=
    gameLoopSpeedIncreasePerLevelUp * currentLevel;
  amountOfBlocksInObstacle = currentLevel;
  startScore = (currentLevel - 1) * amountOfFoodPerLevelUp;
  eatenFoodTextCount.innerHTML = "Poäng: " + startScore;
  levelDisplay.innerHTML = "Nivå: " + currentLevel.toString();
  spawnObstacle(amountOfBlocks, amountOfBlocksInObstacle);
}

/**
* Renders a snake on the canvas
* @param {SnakeRectangle[]} snakeArray - Array of snake segments to draw
* @param {string} headColor - Color for snake's head
* @param {string} bodyColor - Color for snake's body
*/
function drawSnake(snakeArray, headColor, bodyColor) {
  for (let index = 0; index < snakeArray.length; index++) {
    if (index == 0) {
      drawCube(
        snakeArray[index].x,
        snakeArray[index].y,
        rectangleSize,
        rectangleSize,
        headColor
      );
    } else {
      drawCube(
        snakeArray[index].x,
        snakeArray[index].y,
        rectangleSize,
        rectangleSize,
        bodyColor
      );
    }
  }
}

/**
* Handles start/pause button click events
*/
function handleStartPauseButton() {
  if (isPaused) {
    onGameUnPaused();
  } else if (!isPaused) {
    onGamePaused();
  }
}

/**
* Resumes game from paused state
*/
function onGameUnPaused() {
  button.innerHTML = "Pausa";
  timerupdateFoodTimeAlive = setInterval(updateFoodTimeAlive, 1000);
  snakeMovementTimer = setInterval(
    snakeMovementLoop,
    snakeMovementTimerUpdateFrequency
  );
  gameLoopTimer = setInterval(gameLoop, gameLoopTimerUpdateFrequency);

  if (!hasGameStarted) {
    updateStartLevel();
    hasGameStarted = true;
  }

  isPaused = false;
}

/**
* Pauses the game
*/
function onGamePaused() {
  button.innerHTML = "Starta";
  clearInterval(timerupdateFoodTimeAlive);
  clearInterval(gameLoopTimer);
  clearInterval(snakeMovementTimer);
  isPaused = true;
}

/**
* Handles game over state and resets game
*/
function onGameOver() {
  hasGameStarted = false;
  isPaused = true;
  onGamePaused();
  updateHighScore();
  onStart();
}

/**
* Updates and displays the high score
*/
function updateHighScore() {
  var highScoreDisplay = document.getElementById("högstaPoäng");
  var totalFoodEaten = amountOfFoodEaten + startScore;

  if (totalFoodEaten >= highScore) {
    highScore = totalFoodEaten;
    amountOfFoodEaten = 0;
  }

  highScoreDisplay.innerHTML = "Högsta poäng: " + highScore;
}

/**
* Draws a rectangle with border on the canvas
* @param {number} x - X coordinate
* @param {number} y - Y coordinate 
* @param {number} width - Width of rectangle
* @param {number} height - Height of rectangle
* @param {string} color - Fill color
*/
function drawCube(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ECB365";
  ctx.strokeRect(x, y, width, height);
}

/**
* Spawns food at random valid position on canvas
*/
function spawnFood() {
  var hasBeenPlaced = false;
  var totalFoundEmptySpots;
  var tempX;
  var tempY;
  var x;
  var y;

  //Hittar en fri position på spelplanet.
  while (!hasBeenPlaced) {
    tempX = getRandomXPositionOnCanvas();
    tempY = getRandomYPositionOnCanvas();

    totalFoundEmptySpots = 0;

    x = tempX - (tempX % rectangleSize);
    y = tempY - (tempY % rectangleSize);

    for (let index = 0; index < playerSnakeRectangles.length; index++) {
      if (
        x != playerSnakeRectangles[index].x &&
        y != playerSnakeRectangles[index].y
      ) {
        totalFoundEmptySpots++;
      }
    }

    for (let index = 0; index < obstacles.length; index++) {
      if (x != obstacles[index].x && y != obstacles[index].y) {
        totalFoundEmptySpots++;
      }
    }

    if (
      totalFoundEmptySpots ==
      playerSnakeRectangles.length + obstacles.length
    ) {
      foodPosX = x;
      foodPosY = y;
      drawCube(foodPosX, foodPosY, rectangleSize, rectangleSize, foodCubeColor);
      hasBeenPlaced = true;
    }
  }
}

/**
* Generates random X coordinate within canvas bounds
* @param {number} [minValue=0] - Minimum X value
* @returns {number} Random X coordinate
*/
function getRandomXPositionOnCanvas(minValue = 0) {
  return Math.floor(Math.random() * c.clientWidth) + minValue;
}

/**
* Generates random Y coordinate within canvas bounds
* @param {number} [minValue=0] - Minimum Y value
* @returns {number} Random Y coordinate
*/
function getRandomYPositionOnCanvas(minValue = 0) {
  return Math.floor(Math.random() * c.clientHeight) + minValue;
}

/**
* Handles keyboard input for snake movement
* @param {KeyboardEvent} tangent - Keyboard event
*/
function keyListener(tangent) {
  if (!isPaused) {
    //Vänster
    if (tangent.keyCode == 37 && snakeMovementDirection != "right") {
      snakeMovementDirection = "left";
    }
    //Höger
    else if (tangent.keyCode == 39 && snakeMovementDirection != "left") {
      snakeMovementDirection = "right";
    }
    //Upp
    else if (tangent.keyCode == 38 && snakeMovementDirection != "down") {
      snakeMovementDirection = "up";
    }
    //Nedåt
    else if (tangent.keyCode == 40 && snakeMovementDirection != "up") {
      snakeMovementDirection = "down";
    }
  }
}

/**
* Updates snake position based on movement direction
* @param {SnakeRectangle[]} snake - Array of snake segments
*/
function moveSnake(snake) {
  if (snakeMovementDirection == "up") {
    snake.splice(
      0,
      0,
      new SnakeRectangle(snake[0].x, snake[0].y - movementDeltaY)
    );
    snake.pop();
  } else if (snakeMovementDirection == "down") {
    snake.splice(
      0,
      0,
      new SnakeRectangle(snake[0].x, snake[0].y + movementDeltaY)
    );
    snake.pop();
  } else if (snakeMovementDirection == "left") {
    snake.splice(
      0,
      0,
      new SnakeRectangle(snake[0].x - movementDeltaX, snake[0].y)
    );
    snake.pop();
  } else if (snakeMovementDirection == "right") {
    snake.splice(
      0,
      0,
      new SnakeRectangle(snake[0].x + movementDeltaX, snake[0].y)
    );
    snake.pop();
  }
}

/**
* Main game loop function handling movement and collision checks
*/
function gameLoop() {
  handleCollisions();
  handleSettingsMenu();
  moveSnake(playerSnakeRectangles);
  updateCanvas();
}

/**
* Shows/hides settings menu based on game state
*/
function handleSettingsMenu() {
  var settingsMenu = document.getElementById("settingsMenu");

  if (hasGameStarted) {
    settingsMenu.style.display = "none";
  } else {
    settingsMenu.style.display = "block";
  }
}

/**
* Updates food lifetime timer and handles food expiration
*/
function updateFoodTimeAlive() {
  var changeRateTimerDisplay = document.getElementById("foodChangeRateTimer");

  timeFoodHasBeenAlive++;

  if (timeFoodHasBeenAlive >= foodPositionChangeRate) {
    spawnFood();
    shortenSnakeTail();
    updateEatenFoodCounter(false);
    foodPositionChangeRate = newFoodPositionChangeRate();
    timeFoodHasBeenAlive = 0;
  }

  changeRateTimerDisplay.innerHTML =
    "Matbiten försvinner inom: " +
    (foodPositionChangeRate - timeFoodHasBeenAlive);
}

/**
* Removes last segment of snake
*/
function shortenSnakeTail() {
  if (playerSnakeRectangles.length > 1) {
    playerSnakeRectangles.pop();
  } else {
    window.alert("Game Over!");
    onGameOver();
  }
}

/**
* Checks for all types of collisions
*/
function handleCollisions() {
  handleObstacleCollision();
  handleBorderCollision();
  handleEnemySnakeCollision();
  handleSelfCollision();
  handlePlayerWithFoodCollision();
}

/**
* Checks for snake self-collision
*/
function handleSelfCollision() {
  if (playerSnakeRectangles.length > 1) {
    for (let index = 1; index < playerSnakeRectangles.length; index++) {
      if (
        playerSnakeRectangles[0].x == playerSnakeRectangles[index].x &&
        playerSnakeRectangles[0].y == playerSnakeRectangles[index].y
      ) {
        window.alert("Ormen har kolliderat med sig själv! Game Over!");
        onGameOver();
      }
    }
  }
}

/**
* Updates canvas with current game state
*/
function updateCanvas() {
  ctx.clearRect(0, 0, c.clientWidth, c.clientHeight);

  //Spelarens Snake
  drawSnake(playerSnakeRectangles, playerSnakeHeadColor, playerSnakeBodyColor);

  //Fiende Snake
  drawSnake(enemySnakeRectangles, enemySnakeHeadColor, enemySnakeBodyColor);

  //Hinder
  redrawObstacles();

  //Food
  drawCube(foodPosX, foodPosY, rectangleSize, rectangleSize, foodCubeColor);
}

/**
* Handles collision between snake and food
*/
function handlePlayerWithFoodCollision() {
  if (
    playerSnakeRectangles[0].x == foodPosX &&
    playerSnakeRectangles[0].y == foodPosY
  ) {
    handleLevelUp();
    updateEatenFoodCounter();
    increaseSnakeTailLength(playerSnakeRectangles);
    spawnFood();
    resetTimeFoodHasBeenAlive();
  }
}

/**
* Resets food lifetime timer
*/
function resetTimeFoodHasBeenAlive() {
  foodPositionChangeRate = newFoodPositionChangeRate();
  timeFoodHasBeenAlive = 0;
}

/**
* Calculates new food position change rate based on distance
* @returns {number} New food position change rate
*/
function newFoodPositionChangeRate() {
  var newFoodPositionChangeRate;

  newFoodPositionChangeRate =
    0.027 *
    getDistance(
      playerSnakeRectangles[0].x,
      foodPosX,
      playerSnakeRectangles[0].y,
      foodPosY
    );

  return Math.round(newFoodPositionChangeRate);
}

/**
* Calculates distance between two points
* @param {number} x1 - First point X coordinate
* @param {number} x2 - Second point X coordinate
* @param {number} y1 - First point Y coordinate
* @param {number} y2 - Second point Y coordinate
* @returns {number} Distance between points
*/
function getDistance(x1, x2, y1, y2) {
  var deltaX;
  var deltaY;
  var distance;

  if (x1 >= x2) {
    deltaX = x1 - x2;
  } else if (x1 <= x2) {
    deltaX = x2 - x1;
  }

  if (y1 >= y2) {
    deltaY = y1 - y2;
  } else if (y1 <= y2) {
    deltaY = y2 - y1;
  }

  //Pythagoras sats.
  distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  return Math.round(distance);
}

/**
* Handles level up logic when conditions are met
*/
function handleLevelUp() {
  if (currentLevel < 8) {
    if (
      amountOfFoodEaten % amountOfFoodPerLevelUp == 0 &&
      amountOfFoodEaten >= amountOfFoodPerLevelUp
    ) {
      if (gameLoopTimerUpdateFrequency >= amountOfFoodPerLevelUp * 2) {
        if (!hasLeveledUpToNextLevel) {
          increaseGameLoopSpeedOnLevelUp();
          updateLevel();
        }
      }
    } else {
      hasLeveledUpToNextLevel = false;
    }
  }
}

/**
* Updates game level and spawns new obstacles
*/
function updateLevel() {
  var levelDisplay = document.getElementById("nivåDisplay");

  currentLevel++;
  obstacles.length = 0;
  amountOfBlocksInObstacle = currentLevel;
  spawnObstacle(amountOfBlocks, amountOfBlocksInObstacle);

  levelDisplay.innerHTML = "Nivå: " + currentLevel.toString();
}

/**
* Increases game speed when leveling up
*/
function increaseGameLoopSpeedOnLevelUp() {
  gameLoopTimerUpdateFrequency -= gameLoopSpeedIncreasePerLevelUp;
  snakeMovementTimerUpdateFrequency -= gameLoopSpeedIncreasePerLevelUp;
  hasLeveledUpToNextLevel = true;

  clearInterval(gameLoopTimer);
  clearInterval(snakeMovementTimer);
  snakeMovementTimer = setInterval(
    snakeMovementLoop,
    snakeMovementTimerUpdateFrequency
  );
  gameLoopTimer = setInterval(gameLoop, gameLoopTimerUpdateFrequency);
}

/**
* Increases snake length by adding new segment
* @param {SnakeRectangle[]} snakeArray - Array of snake segments
*/
function increaseSnakeTailLength(snakeArray) {
  if (snakeMovementDirection == "left") {
    snakeArray.unshift(
      new SnakeRectangle(snakeArray[0].x - movementDeltaX, snakeArray[0].y)
    );
  } else if (snakeMovementDirection == "right") {
    snakeArray.unshift(
      new SnakeRectangle(snakeArray[0].x + movementDeltaX, snakeArray[0].y)
    );
  } else if (snakeMovementDirection == "up") {
    snakeArray.unshift(
      new SnakeRectangle(snakeArray[0].x, snakeArray[0].y - movementDeltaY)
    );
  } else if (snakeMovementDirection == "down") {
    snakeArray.unshift(
      new SnakeRectangle(snakeArray[0].x, snakeArray[0].y + movementDeltaY)
    );
  }
}

/**
* Updates score counter in UI
* @param {boolean} [increase=true] - Whether to increase or decrease score
*/
function updateEatenFoodCounter(increase = true) {
  var eatenFoodTextCount = document.getElementById(
    "textAntaletUppätnaMumsbitar"
  );
  var totalScore;

  if (increase) {
    amountOfFoodEaten++;
  } else {
    if (amountOfFoodEaten > 0) {
      amountOfFoodEaten--;
    }
  }

  totalScore = amountOfFoodEaten + startScore;
  eatenFoodTextCount.innerHTML = "Poäng: " + totalScore;
}

/**
* Handles snake collision with canvas borders
*/
function handleBorderCollision() {
  var rightBorder = c.clientWidth - rectangleSize;
  var bottomBorder = c.clientHeight - rectangleSize;

  if (!isBorderMovementOn) {
    //Höger
    if (
      playerSnakeRectangles[0].x >= rightBorder &&
      snakeMovementDirection == "right"
    ) {
      onBorderCollision();
    }
    //Vänster
    else if (
      playerSnakeRectangles[0].x <= 0 &&
      snakeMovementDirection == "left"
    ) {
      onBorderCollision();
    }
    //Nedåt
    else if (
      playerSnakeRectangles[0].y >= bottomBorder &&
      snakeMovementDirection == "down"
    ) {
      onBorderCollision();
    }
    //Uppåt
    else if (
      playerSnakeRectangles[0].y <= 0 &&
      snakeMovementDirection == "up"
    ) {
      onBorderCollision();
    }
  } else {
    if (
      playerSnakeRectangles[0].x >= rightBorder &&
      snakeMovementDirection == "right"
    ) {
      playerSnakeRectangles.unshift(
        new SnakeRectangle(0, playerSnakeRectangles[0].y)
      );
      playerSnakeRectangles.pop();
    }
    //Vänster
    else if (
      playerSnakeRectangles[0].x <= 0 &&
      snakeMovementDirection == "left"
    ) {
      playerSnakeRectangles.unshift(
        new SnakeRectangle(rightBorder, playerSnakeRectangles[0].y)
      );
      playerSnakeRectangles.pop();
    }
    //Nedåt
    else if (
      playerSnakeRectangles[0].y >= bottomBorder &&
      snakeMovementDirection == "down"
    ) {
      playerSnakeRectangles.unshift(
        new SnakeRectangle(playerSnakeRectangles[0].x, 0)
      );
      playerSnakeRectangles.pop();
    }
    //Uppåt
    else if (
      playerSnakeRectangles[0].y <= 0 &&
      snakeMovementDirection == "up"
    ) {
      playerSnakeRectangles.unshift(
        new SnakeRectangle(playerSnakeRectangles[0].x, bottomBorder)
      );
      playerSnakeRectangles.pop();
    }
  }
}

/**
* Handles game over on border collision
*/
function onBorderCollision() {
  window.alert("Ormen har kommit utanför gränserna!");
  onGameOver();
}

/**
* Spawns multiple obstacles on the canvas
* @param {number} amountOfObstacles - Number of obstacle groups to spawn
* @param {number} amountOfBlocksInObstacle - Blocks per obstacle group
*/
function spawnObstacle(amountOfObstacles, amountOfBlocksInObstacle) {
  for (let index = 0; index < amountOfObstacles; index++) {
    spawnBlock(amountOfBlocksInObstacle);
  }
}

/**
* Handles collision between snake and obstacles
*/
function handleObstacleCollision() {
  if (obstacles.length > 0) {
    for (let index = 0; index < obstacles.length; index++) {
      if (
        playerSnakeRectangles[0].x == obstacles[index].x &&
        playerSnakeRectangles[0].y == obstacles[index].y
      ) {
        window.alert("Ormen har kolliderat med hinder!");
        onGameOver();
      }
    }
  }
}

/**
* Handles collision between player snake and enemy snake
*/
function handleEnemySnakeCollision() {
  if (enemySnakeRectangles.length > 0) {
    for (let index = 0; index < enemySnakeRectangles.length; index++) {
      if (
        playerSnakeRectangles[0].x == enemySnakeRectangles[index].x &&
        playerSnakeRectangles[0].y == enemySnakeRectangles[index].y
      ) {
        window.alert("Ormen har kolliderat med fiende ormen!");
        onGameOver();
      }
    }
  }
}

/**
* Redraws all obstacles on the canvas
*/
function redrawObstacles() {
  for (let index = 0; index < obstacles.length; index++) {
    drawCube(
      obstacles[index].x,
      obstacles[index].y,
      rectangleSize,
      rectangleSize,
      "black"
    );
  }
}
