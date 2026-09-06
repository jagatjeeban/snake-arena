export type GestureEventType = {
  translationX: number;
  translationY: number;
};

export type Coordinate = {
  x: number;
  y: number;
};

export enum Direction {
  Right = "Right",
  Left = "Left",
  Up = "Up",
  Down = "Down",
}

export type Boundary = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

export type DifficultyLevel = "easy" | "normal" | "hard";
// export enum DifficultyLevel {
//   Easy = "Easy",
//   Normal = "Normal",
//   Hard = "Hard",
// }

export type DifficultyConfig = {
  initialTickMs: number;
  minimumTickMs: number;
  initialTickMsDecrement: number;
  scoreIncrement: number;
};

export type GameProps = {
  difficulty: DifficultyConfig;
  onGameOver: () => void;
};
