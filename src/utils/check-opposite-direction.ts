//import types
import { Direction } from "@/types/game";

/**
 * function to check if the gesture is in the opposite direction to the current direction of the snake
 * @param current current direction of the snake
 * @param next next requested direction of the snake
 * @returns true if the requested direction is opposite to the current direction
 */
export const checkOppositeDirection = (
  current: Direction,
  next: Direction,
): boolean =>
  (current === Direction.Right && next === Direction.Left) ||
  (current === Direction.Left && next === Direction.Right) ||
  (current === Direction.Up && next === Direction.Down) ||
  (current === Direction.Down && next === Direction.Up);
