/**
 * @fileoverview Snake game obstacle generation module
 * Handles the spawning and placement of obstacle blocks in the game,
 * ensuring proper positioning and collision detection with other game elements.
 *
 * @author Jefim Holmgren
 */

/** @type {string} Direction of block movement during placement */
var movementDirection;

/**
 * Spawns a chain of connected blocks that form an obstacle in the game.
 * Ensures blocks are placed within game boundaries and don't overlap with existing game elements.
 * @param {number} amountOfBlocks - The number of connected blocks to spawn
 */
function spawnBlock(amountOfBlocks) {
  var x = [];
  var y = [];
  var tempX;
  var tempY;
  var blockNumber = 0;
  var newObstacles = [];
  var isSpotEmpty;

  while (blockNumber < amountOfBlocks) {
    isSpotEmpty = true;
    movementDirection = getRandomMovementDirection();

    //Slumpar ut slumpässiga koordinater om det är det första blocket.
    if (blockNumber == 0) {
      tempX = getRandomXPositionOnCanvas();
      tempY = getRandomYPositionOnCanvas();

      x[blockNumber] = tempX - (tempX % rectangleSize);
      y[blockNumber] = tempY - (tempY % rectangleSize);
    }

    //Sätter det nya blockets koordinater till det föregående blockets koordinater ifall blocknummret
    //är inte det första blocket.
    if (blockNumber > 0) {
      x[blockNumber] = x[blockNumber - 1];
      y[blockNumber] = y[blockNumber - 1];
    }

    //Uppdaterar koordinaterna efter förflyttningsriktning
    if (movementDirection == "left") {
      x[blockNumber] += movementDeltaX;
    } else if (movementDirection == "right") {
      x[blockNumber] -= movementDeltaX;
    } else if (movementDirection == "up") {
      y[blockNumber] += movementDeltaY;
    } else if (movementDirection == "down") {
      y[blockNumber] -= movementDeltaY;
    }

    //Om blocket har hamnat på matbitens position börja om.
    if (x[blockNumber] == foodPosX && y[blockNumber] == foodPosY) {
      isSpotEmpty = false;
    }

    if (isSpotEmpty) {
      checkForEmptySpot(x, y, blockNumber, playerSnakeRectangles);
      checkForEmptySpot(x, y, blockNumber, enemySnakeRectangles);
      checkForEmptySpot(x, y, blockNumber, obstacles);
      checkForEmptySpot(x, y, blockNumber, newObstacles);
      //Ifall blocket har hamnat för nära ormhuvudet (minDistance) så startas om loopen.
      checkDistanceToPlayerSnake(30, x, y, blockNumber);

      //Kontrollerar ifall koordinaterna är innanför spelgränserna.
      for (let index = 0; index < x.length; index++) {
        if (x[index] <= 0 || x[index] >= 390) {
          isSpotEmpty = false;
        }

        if (y[index] <= 0 || y[index] >= 390) {
          isSpotEmpty = false;
        }
      }

      for (let index = 0; index < x.length; index++) {
        if (index != blockNumber) {
          if (x[blockNumber] == x[index] && y[blockNumber] == y[index]) {
            isSpotEmpty = false;
          }
        }
      }
    }

    if (isSpotEmpty) {
      newObstacles.push(new Obstacle(x[blockNumber], y[blockNumber]));

      //Om det är det sista blocket i hindret så placera ut hindret.
      if (blockNumber == amountOfBlocks - 1) {
        for (let i = 0; i < newObstacles.length; i++) {
          obstacles.push(new Obstacle(newObstacles[i].x, newObstacles[i].y));
        }

        newObstacles.length = 0;
      }

      blockNumber++;
    }
    //Ifall en av block koordinaterna har hamnat på ett redan ockuperat ställe börja om.
    else if (!isSpotEmpty) {
      newObstacles.length = 0;
      blockNumber = 0;
      x.length = 0;
      y.length = 0;
    }
  }
}

/**
 * Checks if a block is too close to the player snake's head.
 * @param {number} minDistance - Minimum allowed distance between block and snake head
 * @param {number[]} x - Array of x coordinates for the blocks
 * @param {number[]} y - Array of y coordinates for the blocks
 * @param {number} blockNumber - Index of the current block being checked
 */
function checkDistanceToPlayerSnake(minDistance, x, y, blockNumber) {
  var distance = getDistance(
    x[blockNumber],
    playerSnakeRectangles[0].x,
    y[blockNumber],
    playerSnakeRectangles[0].y
  );

  if (distance < minDistance) {
    isSpotEmpty = false;
  }
}

/**
 * Verifies if a block's position doesn't overlap with existing game elements.
 * @param {number[]} x - Array of x coordinates for the blocks
 * @param {number[]} y - Array of y coordinates for the blocks
 * @param {number} blockNumber - Index of the current block being checked
 * @param {Object[]} array - Array of game objects to check against (snakes, obstacles, etc.)
 */
function checkForEmptySpot(x, y, blockNumber, array) {
  for (let index = 0; index < array.length; index++) {
    if (x[blockNumber] == array[index].x && y[blockNumber] == array[index].y) {
      isSpotEmpty = false;
    }
  }
}

/**
 * Generates a random movement direction for block placement.
 * @returns {string} Direction - One of: "left", "right", "up", "down"
 */
function getRandomMovementDirection() {
  var direction = "left";
  var randomNumber = Math.floor(Math.random() * 4);

  if (randomNumber == 0) {
    direction = "left";
  } else if (randomNumber == 1) {
    direction = "right";
  } else if (randomNumber == 2) {
    direction = "up";
  } else if (randomNumber == 3) {
    direction = "down";
  }

  return direction;
}
