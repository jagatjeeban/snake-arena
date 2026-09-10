export type DifficultyLevel = "easy" | "normal" | "hard";

export type DifficultyConfig = {
  initialTickMs: number;
  minimumTickMs: number;
  initialTickMsDecrement: number;
  scoreIncrement: number;
};
