//import types
import type { Coordinate } from "@/types/game";

export const getRandomFoodPosition = (
  xMax: number,
  yMax: number,
): Coordinate => {
  return {
    x: Math.floor(Math.random() * xMax),
    y: Math.floor(Math.random() * yMax),
  };
};
