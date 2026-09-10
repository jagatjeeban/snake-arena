//import game direction
import { Direction } from "@/types/game";

//import types
import type { Coordinate, EngineState, MovementSnapshot } from "@/types/game";

/**
 * Expose interpolated movement inputs while retaining committed food and score.
 * @param state the current engine state, or null before initialization
 * @returns movement endpoints and progress with committed food and score, or an empty snapshot
 */
export function movementSnapshot(state: EngineState | null): MovementSnapshot {
  "worklet";
  if (!state)
    return {
      from: [],
      to: [],
      progress: 0,
      direction: Direction.Right,
      food: null,
      score: 0,
    };
  const waiting =
    state.phase === "waiting-for-renderer" ||
    (state.phase === "paused" && state.pausedPhase === "waiting-for-renderer");
  const pending = waiting ? null : state.pending;
  return {
    from: pending?.from ?? state.committed.snake,
    to: pending?.to ?? state.committed.snake,
    progress: pending ? Math.min(1, state.elapsedMs / pending.durationMs) : 0,
    direction: pending?.direction ?? state.committed.direction,
    food: state.committed.food,
    score: state.committed.score,
  };
}

/**
 * Interpolate a mounted segment between its source and destination cells.
 * @param snapshot the movement endpoints and interpolation progress
 * @param index the zero-based snake segment index
 * @returns the interpolated coordinate, or null when either endpoint is missing
 */
export function segmentPosition(
  snapshot: MovementSnapshot,
  index: number,
): Coordinate | null {
  "worklet";

  const from = snapshot.from[index];
  const to = snapshot.to[index];

  if (!from || !to) return null;

  return {
    x: from.x + (to.x - from.x) * snapshot.progress,
    y: from.y + (to.y - from.y) * snapshot.progress,
  };
}
