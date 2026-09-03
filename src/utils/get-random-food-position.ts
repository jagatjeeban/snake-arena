//import types
import type { Coordinate } from "@/types/game";

/**
 * function to get a random position for the food
 * @param xMax maximum x value allowed
 * @param yMax maximum y value allowed
 * @returns random coordinate of the food within the game bounds
 */
export const getRandomFoodPosition = (
  xMax: number,
  yMax: number,
): Coordinate => {
  return {
    x: Math.floor(Math.random() * xMax),
    y: Math.floor(Math.random() * yMax),
  };
};
