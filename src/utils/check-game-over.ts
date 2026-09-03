//import types
import type { Boundary, Coordinate } from "@/types/game";

/**
 * function to check if the game needs to over
 * @param snakeHead coordinate of the snake's head
 * @param boundary coordinates of the game bounds
 * @returns true if the snake's head hits the bounds
 */
export const checkGameOver = (
  snake: Coordinate[],
  boundary: Boundary,
): boolean => {
  const snakeHead = { ...snake[0] };
  const hitBounds =
    snakeHead.x < boundary.xMin ||
    snakeHead.x > boundary.xMax ||
    snakeHead.y < boundary.yMin ||
    snakeHead.y > boundary.yMax;

  const hitSelfBody =
    snake.length > 1 &&
    snake.some(
      (segment, index) =>
        index > 0 && segment.x === snakeHead.x && segment.y === snakeHead.y,
    );

  return hitBounds || hitSelfBody;
};
