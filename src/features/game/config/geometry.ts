//import types
import { Boundary } from "@/types/game";

export const CELL_SIZE = 10;
export const SNAKE_SEGMENT_SIZE = CELL_SIZE + 5;
export const FOOD_SIZE = 15;
export const FOOD_AREA = 2;
export const SNAKE_SEGMENT_OFFSET = (CELL_SIZE - SNAKE_SEGMENT_SIZE) / 2;
export const FOOD_OFFSET = (CELL_SIZE - FOOD_SIZE) / 2;

export const getDefaultBoundary = (): Boundary => ({
  xMax: 0,
  xMin: 0,
  yMax: 0,
  yMin: 0,
});
