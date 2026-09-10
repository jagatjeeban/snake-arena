//import types
import { Boundary } from "@/types/game";

export const CELL_SIZE = 15;
export const SNAKE_SEGMENT_SIZE = CELL_SIZE;
export const FOOD_SIZE = 15;
export const SNAKE_SEGMENT_OFFSET = (CELL_SIZE - SNAKE_SEGMENT_SIZE) / 2;
export const FOOD_OFFSET = (CELL_SIZE - FOOD_SIZE) / 2;

// Native stack transitions can report an interim safe-area height before the
// destination screen settles. Start once from the latest measured grid.
export const INITIAL_LAYOUT_SETTLE_MS = 1_000;

export const getDefaultBoundary = (): Boundary => ({
  xMax: 0,
  xMin: 0,
  yMax: 0,
  yMin: 0,
});
