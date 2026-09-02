//import types
import { Boundary, Coordinate } from "@/types/game";

//CONSTANTS
const TICK_RATE = 20;
const TICK_MS = 1000 / TICK_RATE;
const SCORE_INCREMENT = 5;
const CELL_SIZE = 10;

const getIntialSnakePosition = (): Coordinate[] => [{ x: 3, y: 3 }];
const getIntialFoodPosition = (): Coordinate => ({ x: 5, y: 20 });
const getDefaultBoundary = (): Boundary => ({
  xMax: 0,
  xMin: 0,
  yMax: 0,
  yMin: 0,
});

export {
  CELL_SIZE,
  getDefaultBoundary,
  getIntialFoodPosition,
  getIntialSnakePosition,
  SCORE_INCREMENT,
  TICK_MS,
  TICK_RATE,
};
