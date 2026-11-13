export type DifficultyLevel = "easy" | "normal" | "hard";

export type DifficultyConfig = {
  initialTickMs: number;
  minimumTickMs: number;
  initialTickMsDecrement: number;
  scoreIncrement: number;
};

export type Phase =
  | "initializing"
  | "moving"
  | "paused"
  | "waiting-for-renderer"
  | "terminal";

export type TerminalReason = "boundary" | "self-collision" | "full-board";

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

export type CommittedState = {
  snake: Coordinate[];
  food: Coordinate | null;
  direction: Direction;
  score: number;
  durationMs: number;
  decrement: number;
  seed: number;
};

export type PendingMove = {
  from: Coordinate[];
  to: Coordinate[];
  direction: Direction;
  durationMs: number;
  outcome: "move" | "eat" | "self-collision";
};

export type EngineState = {
  committed: CommittedState;
  pending: PendingMove | null;
  phase: Phase;
  pausedPhase: Exclude<Phase, "paused">;
  elapsedMs: number;
  queuedDirection: Direction | null;
  sessionId: number;
  terminalReason: TerminalReason | null;
  terminalElapsedMs: number;
  completionReady: boolean;
  lastTimestamp: number | null;
  bounds: Boundary;
  difficulty: DifficultyConfig;
  boardCapacity: number;
  mountedCapacity: number;
  requestedCapacity: number;
};

export type MovementSnapshot = {
  from: Coordinate[];
  to: Coordinate[];
  progress: number;
  direction: Direction;
  food: Coordinate | null;
  score: number;
};

export type EngineEvent = {
  sessionId: number;
  phase: Phase;
  score: number;
  capacity: number;
  complete: boolean;
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

/** Rendering coordinates are logical pixels, not engine grid coordinates. */
export type RenderPoint = { x: number; y: number };

export type TrailSample = RenderPoint & {
  distanceFromTail: number;
  radius: number;
};

export type SnakeGeometry = {
  trail: RenderPoint[];
  samples: TrailSample[];
  taperLength: number;
  head: (RenderPoint & { angle: number }) | null;
};

export type SessionEvents = {
  sessionId: number;
  mounted: boolean;
  delivered: boolean;
};
