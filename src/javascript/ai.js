/**
 * @fileoverview Enemy snake AI movement module
 * Implements pathfinding logic for enemy snake movement, including collision avoidance
 * and food targeting behavior.
 *
 * @author Jefim Holmgren
 */

"use strict";
/** @type {string[]} Array of possible movement directions */
var movementDirections = [];

/** @type {number[]} Array of distances to food from possible next positions */
var newDistancesToFood = [];

/** @type {number} Counter for valid movement checks */
var checks;

/** @type {boolean} Flag indicating if next position is occupied */
var isNextSpotOccupied;

/** @type {string} Current movement direction of enemy snake */
var currentMovementDirection = "right";

/**
* Calculates distances to food from all valid adjacent grid cells
*/
function getNewDistancesFromNearestGridCells() {
  checks = -1;
  movementDirections.length = 0;
  newDistancesToFood.length = 0;

  //Right
  if (currentMovementDirection != "right") {
    if (enemySnakeRectangles[0].x - movementDeltaX >= 0) {
      checkNextGridCell("left");

      if (!isNextSpotOccupied) {
        checks++;
        movementDirections[checks] = "left";
        newDistancesToFood[checks] = getDistance(
          enemySnakeRectangles[0].x - movementDeltaX,
          foodPosX,
          enemySnakeRectangles[0].y,
          foodPosY
        );
      }
    }
  }

  //Left
  if (currentMovementDirection != "left") {
    if (
      enemySnakeRectangles[0].x + movementDeltaX <=
      c.clientWidth - rectangleSize
    ) {
      checkNextGridCell("right");

      if (!isNextSpotOccupied) {
        checks++;
        movementDirections[checks] = "right";
        newDistancesToFood[checks] = getDistance(
          enemySnakeRectangles[0].x + movementDeltaX,
          foodPosX,
          enemySnakeRectangles[0].y,
          foodPosY
        );
      }
    }
  }

  //Down
  if (currentMovementDirection != "down") {
    if (enemySnakeRectangles[0].y - movementDeltaY >= 0) {
      checkNextGridCell("up");

      if (!isNextSpotOccupied) {
        checks++;
        movementDirections[checks] = "up";
        newDistancesToFood[checks] = getDistance(
          enemySnakeRectangles[0].x,
          foodPosX,
          enemySnakeRectangles[0].y - movementDeltaY,
          foodPosY
        );
      }
    }
  }

  //Up
  if (currentMovementDirection != "up") {
    if (
      enemySnakeRectangles[0].y + movementDeltaY <=
      c.clientHeight - rectangleSize
    ) {
      checkNextGridCell("down");

      if (!isNextSpotOccupied) {
        checks++;
        movementDirections[checks] = "down";
        newDistancesToFood[checks] = getDistance(
          enemySnakeRectangles[0].x,
          foodPosX,
          enemySnakeRectangles[0].y + movementDeltaY,
          foodPosY
        );
      }
    }
  }
}


/**
* Checks if next grid cell in given direction is occupied
* @param {string} direction - Movement direction to check ("up", "down", "left", "right")
*/
function checkNextGridCell(direction) {
  isNextSpotOccupied = false;

  checkForOccupiedPositionsInArray(obstacles, direction, false);
  checkForOccupiedPositionsInArray(playerSnakeRectangles, direction, false);
  checkForOccupiedPositionsInArray(enemySnakeRectangles, direction, true);
}

/**
* Checks if a position is occupied by game objects in given array
* @param {Object[]} array - Array of game objects to check
* @param {string} direction - Direction to check
* @param {boolean} isEnemySnakeRectangleArray - Whether array is enemy snake segments
*/
function checkForOccupiedPositionsInArray(
  array,
  direction,
  isEnemySnakeRectangleArray
) {
  var startIndex;

  if (isEnemySnakeRectangleArray) {
    startIndex = 1;
  } else {
    startIndex = 0;
  }

  for (let index = startIndex; index < array.length; index++) {
    if (direction == "left") {
      if (
        enemySnakeRectangles[0].x - movementDeltaX == array[index].x &&
        enemySnakeRectangles[0].y == array[index].y
      ) {
        isNextSpotOccupied = true;
      }
    } else if (direction == "right") {
      if (
        enemySnakeRectangles[0].x + movementDeltaX == array[index].x &&
        enemySnakeRectangles[0].y == array[index].y
      ) {
        isNextSpotOccupied = true;
      }
    } else if (direction == "up") {
      if (
        enemySnakeRectangles[0].x == array[index].x &&
        enemySnakeRectangles[0].y - movementDeltaY == array[index].y
      ) {
        isNextSpotOccupied = true;
      }
    } else if (direction == "down") {
      if (
        enemySnakeRectangles[0].x == array[index].x &&
        enemySnakeRectangles[0].y + movementDeltaY == array[index].y
      ) {
        isNextSpotOccupied = true;
      }
    }
  }
}

/**
* Updates enemy snake position based on pathfinding logic
* Moves enemy snake toward food while avoiding obstacles
*/
function moveEnemySnake() {
  var currentDistanceToFood;
  var enemyShortestDistanceToFood = 1000;

  getNewDistancesFromNearestGridCells();

  currentDistanceToFood = getDistance(
    enemySnakeRectangles[0].x,
    foodPosX,
    enemySnakeRectangles[0].y,
    foodPosY
  );
  enemyShortestDistanceToFood = 1000;

  //Hitta kortaste vägen.
  for (let index = 0; index < newDistancesToFood.length; index++) {
    if (
      newDistancesToFood[index] <= currentDistanceToFood &&
      newDistancesToFood[index] <= enemyShortestDistanceToFood
    ) {
      enemyShortestDistanceToFood = newDistancesToFood[index];
      currentMovementDirection = movementDirections[index];
    }
  }

  if (currentMovementDirection == "left") {
    enemySnakeRectangles.splice(
      0,
      0,
      new SnakeRectangle(
        enemySnakeRectangles[0].x - movementDeltaX,
        enemySnakeRectangles[0].y
      )
    );
    enemySnakeRectangles.pop();
  } else if (currentMovementDirection == "right") {
    enemySnakeRectangles.splice(
      0,
      0,
      new SnakeRectangle(
        enemySnakeRectangles[0].x + movementDeltaX,
        enemySnakeRectangles[0].y
      )
    );
    enemySnakeRectangles.pop();
  } else if (currentMovementDirection == "up") {
    enemySnakeRectangles.splice(
      0,
      0,
      new SnakeRectangle(
        enemySnakeRectangles[0].x,
        enemySnakeRectangles[0].y - movementDeltaY
      )
    );
    enemySnakeRectangles.pop();
  } else if (currentMovementDirection == "down") {
    enemySnakeRectangles.splice(
      0,
      0,
      new SnakeRectangle(
        enemySnakeRectangles[0].x,
        enemySnakeRectangles[0].y + movementDeltaY
      )
    );
    enemySnakeRectangles.pop();
  }

  if (
    enemySnakeRectangles[0].x == foodPosX &&
    enemySnakeRectangles[0].y == foodPosY
  ) {
    spawnFood();
    resetTimeFoodHasBeenAlive();
    shortenSnakeTail();
    increaseSnakeTailLength(enemySnakeRectangles);
  }
}


/**
* Main loop for enemy snake movement
*/
function snakeMovementLoop() {
  moveEnemySnake();
}
