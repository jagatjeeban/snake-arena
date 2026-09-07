import type { SnakeProps } from "./snake";

export type HeaderProps = Pick<SnakeProps, "snapshot"> & {
  reloadGame: () => void;
  pauseGame: () => void;
  isPaused: boolean;
  accessibleScore: number;
};
