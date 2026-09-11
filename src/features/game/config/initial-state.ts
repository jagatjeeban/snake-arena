//import types
import type { Coordinate } from "@/types/game";

/**
 * Creates a fresh starting snake for each session so engine mutations cannot be
 * shared between restarts.
 * @returns the initial one-cell snake near the board's upper-left area
 */
export const getInitialSnakePosition = (): Coordinate[] => [{ x: 3, y: 3 }];

/**
 * Creates the preferred opening food position. `createEngine` replaces it with
 * a seeded free cell when a smaller measured board cannot contain this point.
 * @returns the preferred initial food coordinate for a new session
 */
export const getInitialFoodPosition = (): Coordinate => ({
  x: 5,
  y: 20,
});
