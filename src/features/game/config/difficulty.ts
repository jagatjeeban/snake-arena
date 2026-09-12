//import utility functions
import { getTickMsDecrement } from "@/utils/get-tickms-decrement";

//import types
import { DifficultyConfig, DifficultyLevel } from "@/types/game";

export const INITIAL_TICK_MS = 200;
export const MIN_TICK_MS = 30;
export const INITIAL_TICK_MS_DECREMENT = getTickMsDecrement(
  INITIAL_TICK_MS,
  MIN_TICK_MS,
);
export const SCORE_INCREMENT = 5;

export const DIFFICULTY_CONFIGS = {
  easy: {
    initialTickMs: 250,
    minimumTickMs: 80,
    initialTickMsDecrement: 8,
    scoreIncrement: 5,
  },
  normal: {
    initialTickMs: 200,
    minimumTickMs: 50,
    initialTickMsDecrement: 12,
    scoreIncrement: 10,
  },
  hard: {
    initialTickMs: 150,
    minimumTickMs: 30,
    initialTickMsDecrement: 16,
    scoreIncrement: 15,
  },
} satisfies Record<DifficultyLevel, DifficultyConfig>;

/**
 * Maps the difficulty selected on the home screen to the engine's movement and
 * scoring rules. The normal preset is the defensive fallback for an unexpected
 * route value so the playground can still start with valid timing values.
 * @param difficultyLevel the level received from the playground route
 * @returns the matching tick timing, acceleration, and score configuration
 */
export const getDifficultyConfig = (
  difficultyLevel: DifficultyLevel,
): DifficultyConfig => {
  switch (difficultyLevel) {
    case "easy":
      return DIFFICULTY_CONFIGS.easy;
    case "normal":
      return DIFFICULTY_CONFIGS.normal;
    case "hard":
      return DIFFICULTY_CONFIGS.hard;
    default:
      return DIFFICULTY_CONFIGS.normal;
  }
};
