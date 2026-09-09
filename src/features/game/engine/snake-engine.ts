//import constants
import { Direction } from "@/types/game";

//import engine helpers
import { selectFreeCell } from "./food-placement";
import { inBounds, isOppositeDirection, nextHeadPosition, sameCell } from "./grid";

//import types
import type {
  Boundary,
  Coordinate,
  DifficultyConfig,
  EngineState,
  PendingMove,
  TerminalReason,
} from "@/types/game";

//renderer and timing constants
export const SEGMENT_BATCH_SIZE = 32;
export const SPARE_SEGMENT_THRESHOLD = 16;
export const TERMINAL_HOLD_MS = 300;

// Hold the final committed board before delivering completion.
function terminal(state: EngineState, reason: TerminalReason): EngineState {
  "worklet";
  return {
    ...state,
    pending: null,
    phase: "terminal",
    terminalReason: reason,
    queuedDirection: null,
    elapsedMs: 0,
    terminalElapsedMs: 0,
    completionReady: false,
  };
}

// Prepare the next move and wait for renderer slots when growth needs them.
function prepare(state: EngineState): EngineState {
  "worklet";
  const { committed } = state;
  const direction = state.queuedDirection ?? committed.direction;
  const head = committed.snake[0];
  const destination = nextHeadPosition(head, direction);
  // A boundary attempt stops on the last valid, already arrived cell.
  if (!inBounds(destination, state.bounds)) return terminal(state, "boundary");
  const eats = committed.food !== null && sameCell(destination, committed.food);
  const body = eats ? committed.snake : committed.snake.slice(0, -1);
  const to = [destination, ...body];
  const collides = body.some((cell) => sameCell(cell, destination));
  const from = eats
    ? [...committed.snake, committed.snake[committed.snake.length - 1]]
    : committed.snake;
  const pending: PendingMove = {
    from,
    to,
    direction,
    durationMs: committed.durationMs,
    outcome: collides ? "self-collision" : eats ? "eat" : "move",
  };
  const waiting = to.length > state.mountedCapacity;
  return {
    ...state,
    pending,
    queuedDirection: null,
    phase: waiting ? "waiting-for-renderer" : "moving",
    elapsedMs: waiting ? 0 : state.elapsedMs,
    requestedCapacity:
      state.requestedCapacity - to.length < SPARE_SEGMENT_THRESHOLD
        ? Math.min(
            state.boardCapacity,
            Math.max(state.requestedCapacity + SEGMENT_BATCH_SIZE, to.length),
          )
        : state.requestedCapacity,
  };
}

/**
 * Create a seeded game session with valid starting cells and renderer capacity.
 * @param options the initial game session configuration
 * @param options.bounds the inclusive board limits
 * @param options.difficulty the movement timing and scoring configuration
 * @param options.sessionId the identity used to reject stale session events
 * @param options.seed the initial pseudorandom generator seed
 * @param options.snake the initial snake cells, replaced with a valid fallback if invalid
 * @param options.food the initial food cell, replaced with a free cell if invalid
 * @param options.direction the initial direction; defaults to right
 * @param options.paused whether to start paused; defaults to false
 * @returns the initialized engine state awaiting renderer acknowledgement or resume
 */
export function createEngine(options: {
  bounds: Boundary;
  difficulty: DifficultyConfig;
  sessionId: number;
  seed: number;
  snake: Coordinate[];
  food: Coordinate;
  direction?: Direction;
  paused?: boolean;
}): EngineState {
  "worklet";
  const { bounds, difficulty } = options;
  const boardCapacity =
    (bounds.xMax - bounds.xMin + 1) * (bounds.yMax - bounds.yMin + 1);
  const validSnake =
    options.snake.length > 0 &&
    options.snake.every(
      (cell, i) =>
        inBounds(cell, bounds) &&
        !options.snake.slice(0, i).some((other) => sameCell(cell, other)),
    );
  const snake = validSnake
    ? options.snake
    : [{ x: bounds.xMin, y: bounds.yMin }];
  const foodValid =
    inBounds(options.food, bounds) &&
    !snake.some((cell) => sameCell(cell, options.food));
  const random = foodValid
    ? { food: options.food, seed: options.seed }
    : selectFreeCell(bounds, snake, options.seed);
  return {
    committed: {
      snake,
      ...random,
      score: 0,
      direction: options.direction ?? Direction.Right,
      durationMs: difficulty.initialTickMs,
      decrement: difficulty.initialTickMsDecrement,
    },
    pending: null,
    phase: options.paused ? "paused" : "initializing",
    pausedPhase: "initializing",
    elapsedMs: 0,
    queuedDirection: null,
    sessionId: options.sessionId,
    terminalReason: null,
    terminalElapsedMs: 0,
    completionReady: false,
    lastTimestamp: null,
    bounds,
    difficulty,
    boardCapacity,
    mountedCapacity: 0,
    requestedCapacity: Math.min(
      boardCapacity,
      snake.length + SEGMENT_BATCH_SIZE,
    ),
  };
}

/**
 * Accept mounted slots for the current session and release pending movement.
 * @param state the current engine state
 * @param sessionId the identity of the session whose slots were mounted
 * @param capacity the number of mounted segment slots
 * @returns the state with acknowledged capacity and eligible movement released, or the unchanged state for a stale session
 */
export function acknowledgeRenderer(
  state: EngineState,
  sessionId: number,
  capacity: number,
): EngineState {
  "worklet";
  if (state.sessionId !== sessionId) return state;
  let next = {
    ...state,
    mountedCapacity: Math.min(capacity, state.boardCapacity),
  };
  if (
    state.phase === "initializing" &&
    next.mountedCapacity >= state.committed.snake.length
  ) {
    next =
      state.committed.food === null
        ? terminal(next, "full-board")
        : prepare(next);
  } else if (
    state.phase === "waiting-for-renderer" &&
    state.pending &&
    next.mountedCapacity >= state.pending.to.length
  ) {
    next = { ...next, phase: "moving", lastTimestamp: null };
  }
  return next;
}

/**
 * Queue one non-reversing direction change for the next move.
 * @param state the current engine state
 * @param direction the requested direction for the next move
 * @returns the state with a queued turn, or the unchanged state when the turn is not accepted
 */
export function queueDirection(
  state: EngineState,
  direction: Direction,
): EngineState {
  "worklet";
  if (state.phase !== "moving" || state.queuedDirection !== null) return state;
  const current = state.pending?.direction ?? state.committed.direction;
  const opposite = isOppositeDirection(current, direction);
  return opposite || current === direction
    ? state
    : { ...state, queuedDirection: direction };
}

/**
 * Pause the current phase and discard queued input and frame timing.
 * @param state the current engine state
 * @returns the paused state with cleared input and frame timing, or the unchanged state if already paused
 */
export function pauseEngine(state: EngineState): EngineState {
  "worklet";
  if (state.phase === "paused") return state;
  return {
    ...state,
    pausedPhase: state.phase,
    phase: "paused",
    queuedDirection: null,
    lastTimestamp: null,
    completionReady: false,
  };
}

/**
 * Restore the paused phase after checking available renderer capacity.
 * @param state the current engine state
 * @returns the restored state with renderer readiness checked, or the unchanged state if not paused
 */
export function resumeEngine(state: EngineState): EngineState {
  "worklet";
  if (state.phase !== "paused") return state;
  const next = { ...state, phase: state.pausedPhase, lastTimestamp: null };
  return acknowledgeRenderer(next, next.sessionId, next.mountedCapacity);
}

/**
 * Inject deltas for deterministic tests; the app supplies monotonic UI frame timestamps.
 * @param state the current engine state
 * @param deltaMs the elapsed milliseconds, clamped to a safe nonnegative step
 * @returns the state after movement or terminal-hold advancement, or the unchanged state when no advancement applies
 */
export function advanceEngine(
  state: EngineState,
  deltaMs: number,
): EngineState {
  "worklet";
  const delta = Number.isFinite(deltaMs)
    ? Math.max(0, Math.min(deltaMs, 32, state.difficulty.minimumTickMs))
    : 0;
  if (state.phase === "terminal") {
    if (state.completionReady) return state;
    const terminalElapsedMs = state.terminalElapsedMs + delta;
    return {
      ...state,
      terminalElapsedMs,
      completionReady: terminalElapsedMs >= TERMINAL_HOLD_MS,
    };
  }
  if (state.phase !== "moving" || !state.pending || delta === 0) return state;
  const elapsedMs = state.elapsedMs + delta;
  const { pending, committed } = state;
  if (elapsedMs < pending.durationMs) return { ...state, elapsedMs };

  let next: EngineState = {
    ...state,
    elapsedMs: elapsedMs - pending.durationMs,
    committed: {
      ...committed,
      snake: pending.to,
      direction: pending.direction,
    },
  };
  if (pending.outcome === "self-collision")
    return terminal(next, "self-collision");
  if (pending.outcome === "eat") {
    const random = selectFreeCell(state.bounds, pending.to, committed.seed);
    const speedsUp = committed.durationMs > state.difficulty.minimumTickMs;
    next.committed = {
      ...next.committed,
      ...random,
      score: committed.score + state.difficulty.scoreIncrement,
      durationMs: speedsUp
        ? Math.max(
            state.difficulty.minimumTickMs,
            committed.durationMs - committed.decrement,
          )
        : committed.durationMs,
      decrement: speedsUp
        ? Math.max(0, committed.decrement - 1)
        : committed.decrement,
    };
    if (random.food === null) return terminal(next, "full-board");
  }
  // Carry the fractional remainder into the next prepared move in this same update.
  return prepare(next);
}

/**
 * Advance from UI frame timestamps, resetting the baseline after a pause.
 * @param state the current engine state
 * @param timestamp the monotonic UI frame timestamp in milliseconds
 * @returns the advanced state with an updated timestamp, or the unchanged state for an inactive phase
 */
export function advanceFrame(
  state: EngineState,
  timestamp: number,
): EngineState {
  "worklet";
  if (state.phase !== "moving" && state.phase !== "terminal") return state;
  if (state.lastTimestamp === null)
    return { ...state, lastTimestamp: timestamp };
  const next = advanceEngine(state, timestamp - state.lastTimestamp);
  return { ...next, lastTimestamp: timestamp };
}
