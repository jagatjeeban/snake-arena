//import game direction
import { Direction } from "@/types/game";

//import types
import type { Boundary, Coordinate } from "@/types/game";

/**
 * Compares two cells for food pickup, duplicate-start validation, and snake
 * collision checks. This stays worklet-safe because the engine also calls it on
 * the UI thread during movement.
 * @param a the first Snake Arena grid coordinate
 * @param b the second Snake Arena grid coordinate
 * @returns whether both coordinates identify the same board cell
 */
export function sameCell(a: Coordinate, b: Coordinate): boolean {
  "worklet";

  return a.x === b.x && a.y === b.y;
}

/**
 * Verifies that an engine cell can be rendered on the measured game board.
 * Integer validation protects the cell-based movement model as well as the
 * inclusive boundary check.
 * @param point the grid coordinate to validate
 * @param bounds the measured board's inclusive cell limits
 * @returns whether the point is a complete, renderable board cell
 */
export function inBounds(point: Coordinate, bounds: Boundary): boolean {
  "worklet";

  return (
    Number.isInteger(point.x) &&
    Number.isInteger(point.y) &&
    point.x >= bounds.xMin &&
    point.x <= bounds.xMax &&
    point.y >= bounds.yMin &&
    point.y <= bounds.yMax
  );
}

/**
 * Calculates the snake head's next cell for one engine move. Boundary handling
 * deliberately happens later in `prepare`, allowing this helper to remain a
 * simple direction-to-coordinate conversion.
 * @param head the snake's currently committed head coordinate
 * @param direction the direction accepted for the next move
 * @returns the adjacent head coordinate, including an out-of-bounds attempt
 */
export function nextHeadPosition(
  head: Coordinate,
  direction: Direction,
): Coordinate {
  "worklet";

  return {
    x:
      head.x +
      (direction === Direction.Right
        ? 1
        : direction === Direction.Left
          ? -1
          : 0),
    y:
      head.y +
      (direction === Direction.Down ? 1 : direction === Direction.Up ? -1 : 0),
  };
}

/**
 * Detects a 180-degree turn that would send the head directly into the first
 * body segment. `queueDirection` uses this to reject impossible swipe input.
 * @param current the direction of the active or committed move
 * @param direction the direction requested by the player's swipe
 * @returns whether the requested direction is the exact opposite of the current one
 */
export function isOppositeDirection(
  current: Direction,
  direction: Direction,
): boolean {
  "worklet";

  return (
    (current === Direction.Right && direction === Direction.Left) ||
    (current === Direction.Left && direction === Direction.Right) ||
    (current === Direction.Up && direction === Direction.Down) ||
    (current === Direction.Down && direction === Direction.Up)
  );
}
