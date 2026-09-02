//import types
import type { Boundary, Coordinate } from "@/types/game";

export const checkGameOver = (
  snakeHead: Coordinate,
  boundary: Boundary,
): boolean => {
  return (
    snakeHead.x < boundary.xMin ||
    snakeHead.x > boundary.xMax ||
    snakeHead.y < boundary.yMin ||
    snakeHead.y > boundary.yMax
  );
};
