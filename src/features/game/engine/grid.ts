//import game direction
import { Direction } from "@/types/game";

//import types
import type { Boundary, Coordinate } from "@/types/game";

/**
 * Compare two grid coordinates without allocating intermediate values.
 * @param a the first grid coordinate
 * @param b the second grid coordinate
 * @returns whether both coordinates identify the same cell
 */
export function sameCell(a: Coordinate, b: Coordinate): boolean {
  "worklet";
  return a.x === b.x && a.y === b.y;
}

/**
 * Check that a cell uses integer coordinates within the board.
 * @param point the grid coordinate to validate
 * @param bounds the inclusive board limits
 * @returns whether the point has integer coordinates inside the board
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
 * Get the adjacent cell in the requested direction.
 * @param head the current head coordinate
 * @param direction the requested movement direction
 * @returns the adjacent head coordinate, which may be outside the board
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
 * Check whether a direction reverses the current movement.
 * @param current the current movement direction
 * @param direction the proposed movement direction
 * @returns whether the proposed direction reverses the current direction
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
