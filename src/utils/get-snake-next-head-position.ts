//import types
import { Coordinate, Direction } from "@/types/game";

/**
 * function to get the new position of the snake's head
 * @param head coordinate of the snake's head
 * @param direction requested direction for the snake
 * @returns new coordinate for the snake's head
 */
export const getSnakeNextHeadPosition = (
  head: Coordinate,
  direction: Direction,
): Coordinate => {
  switch (direction) {
    case Direction.Up:
      return { x: head.x, y: head.y - 1 };

    case Direction.Down:
      return { x: head.x, y: head.y + 1 };

    case Direction.Left:
      return { x: head.x - 1, y: head.y };

    case Direction.Right:
      return { x: head.x + 1, y: head.y };
  }
};
