//import types
import { DifficultyConfig } from "./difficulty";
import type { Phase, TerminalReason } from "./engine";

export type GestureEventType = {
  translationX: number;
  translationY: number;
};

export type GameProps = {
  difficulty: DifficultyConfig;
  onGameOver: () => void;
};

export type GameHaptic =
  | "eat-food"
  | "eat-special-food"
  | "wall-collision"
  | "self-collision"
  | "level-up"
  | "game-over"
  | "high-score"
  | "full-board";

export type GameHapticSnapshot = {
  sessionId: number;
  score: number;
  terminalReason: TerminalReason | null;
  phase: Phase;
  active: boolean;
};

export * from "./difficulty";
export * from "./engine";
export * from "./geometry";
export * from "./session";
