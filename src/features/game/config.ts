//import types
import { Boundary, Coordinate } from "@/types/game";

//CONSTANTS
const TICK_RATE = 5;
const TICK_MS = 1000 / TICK_RATE;
const MIN_TICK_MS = 10;
const TICK_MS_DECREMENT = 5;
const SCORE_INCREMENT = 5;
const CELL_SIZE = 10;
const SWIPE_MIN_DISTANCE = 12;
const MAX_BUFFERED_DIRECTIONS = 1;
const ANIMATION_OVERLAP_MS = 1000 / 60;

const getIntialSnakePosition = (): Coordinate[] => [{ x: 3, y: 3 }];
const getIntialFoodPosition = (): Coordinate => ({ x: 5, y: 20 });
const getDefaultBoundary = (): Boundary => ({
  xMax: 0,
  xMin: 0,
  yMax: 0,
  yMin: 0,
});

export {
  ANIMATION_OVERLAP_MS,
  CELL_SIZE,
  getDefaultBoundary,
  getIntialFoodPosition,
  getIntialSnakePosition,
  MAX_BUFFERED_DIRECTIONS,
  MIN_TICK_MS,
  SCORE_INCREMENT,
  SWIPE_MIN_DISTANCE,
  TICK_MS,
  TICK_MS_DECREMENT,
  TICK_RATE,
};
