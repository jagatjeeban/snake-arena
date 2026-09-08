//import types
import { DifficultyConfig } from "./difficulty";

export type GestureEventType = {
  translationX: number;
  translationY: number;
};

export type GameProps = {
  difficulty: DifficultyConfig;
  onGameOver: () => void;
};

export * from "./difficulty";
export * from "./engine";
export * from "./geometry";
export * from "./session";
