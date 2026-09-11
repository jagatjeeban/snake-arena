//import game direction
import { Direction } from "@/types/game";

//import types
import type { Coordinate, EngineState, MovementSnapshot } from "@/types/game";

/**
 * Converts internal engine state into the small UI-thread model consumed by the
 * snake, food, and score renderers. While growth waits for additional mounted
 * segment slots, it exposes only committed cells to avoid drawing missing views.
 * @param state the current engine state, or null before board initialization
 * @returns renderable movement endpoints, progress, direction, food, and score
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
 * Resolves one preallocated segment's visual position for the current animation
 * frame. Slots beyond the active snake return null so their mounted views remain
 * hidden until growth needs them.
 * @param snapshot the renderer-facing movement endpoints and interpolation progress
 * @param index the zero-based slot index, where zero is the snake head
 * @returns the interpolated grid coordinate, or null when the slot is inactive
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
