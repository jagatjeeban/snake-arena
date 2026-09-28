//import game geometry
import { CELL_SIZE } from "../config/geometry";

/** Native snake proportions in logical pixels; gameplay still uses whole cells. */
export const SNAKE_STYLE = {
  bodyRadius: CELL_SIZE * 0.36,
  headLength: CELL_SIZE,
  headWidth: CELL_SIZE * 0.86,
  turnRadius: CELL_SIZE * 0.3,
  taperLength: CELL_SIZE * 2,
  chordError: 0.25,
  turnProgress: 1 / 3,
  highlightRadius: CELL_SIZE * 0.055,
  highlightOffset: CELL_SIZE * 0.11,
  eyeForward: CELL_SIZE * 0.19,
  eyeSide: CELL_SIZE * 0.22,
  eyeRadius: CELL_SIZE * 0.11,
  pupilRadius: CELL_SIZE * 0.055,
  pupilForward: CELL_SIZE * 0.035,
} as const;
