//import types
import type { SharedValue } from "react-native-reanimated";
import type { DifficultyConfig, DifficultyLevel, MovementSnapshot } from "./game";

export type HeaderProps = Pick<SnakeProps, "snapshot"> & {
  reloadGame: () => void;
  pauseGame: () => void;
  isPaused: boolean;
  accessibleScore: number;
};

export type SnakeProps = {
  capacity: number;
  snapshot: SharedValue<MovementSnapshot>;
};

export type SnakeSegmentProps = Pick<SnakeProps, "snapshot"> & {
  index: number;
};

export type SelectDifficultyProps = {
  onSelect: (difficulty: DifficultyLevel) => void;
  onInfoReq: () => void;
};

export type GameProps = {
  difficulty: DifficultyConfig;
  onGameOver: () => void;
};
