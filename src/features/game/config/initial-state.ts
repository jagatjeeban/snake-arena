//import types
import type { Coordinate } from "@/types/game";

export const getInitialSnakePosition = (): Coordinate[] => [{ x: 3, y: 3 }];
export const getInitialFoodPosition = (): Coordinate => ({
  x: 5,
  y: 20,
});
