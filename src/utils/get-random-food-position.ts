//import types
import type { Coordinate } from "@/types/game";

/**
 * function to get a random position for the food
 * @param xMax maximum x value allowed
 * @param yMax maximum y value allowed
 * @param snake the snake's segment array
 * @returns random coordinate of the food within the game bounds
 */
export const getRandomFoodPosition = (
  xMax: number,
  yMax: number,
  snake: Coordinate[],
): Coordinate => {
  let position: Coordinate;

  do {
    position = {
      x: Math.floor(Math.random() * xMax),
      y: Math.floor(Math.random() * yMax),
    };
  } while (
    snake.some(
      (segment) => segment.x === position.x && segment.y === position.y,
    )
  );

  return position;
};
