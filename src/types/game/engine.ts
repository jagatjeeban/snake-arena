//import required types
import { DifficultyConfig } from "./difficulty";
import { Boundary, Coordinate, Direction } from "./geometry";

export type Phase =
  | "initializing"
  | "moving"
  | "paused"
  | "waiting-for-renderer"
  | "terminal";

export type TerminalReason = "boundary" | "self-collision" | "full-board";

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
