//import types
import {
  Boundary,
  Coordinate,
  DifficultyConfig,
  Direction,
  EngineState,
  MovementSnapshot,
  PendingMove,
  TerminalReason,
} from "../../../types/game";

export const SEGMENT_BATCH_SIZE = 32;
export const SPARE_SEGMENT_THRESHOLD = 16;
export const TERMINAL_HOLD_MS = 300;

export function sameCell(a: Coordinate, b: Coordinate): boolean {
  "worklet";
  return a.x === b.x && a.y === b.y;
}

function inBounds(point: Coordinate, bounds: Boundary): boolean {
  "worklet";
  return (
    Number.isInteger(point.x) &&
    Number.isInteger(point.y) &&
    point.x >= bounds.xMin &&
    point.x <= bounds.xMax &&
    point.y >= bounds.yMin &&
    point.y <= bounds.yMax
  );
}

/** One seeded draw and one bounded board scan, even when the board is full. */
export function selectFreeCell(
  bounds: Boundary,
  snake: Coordinate[],
  seed: number,
) {
  "worklet";
  const nextSeed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const width = bounds.xMax - bounds.xMin + 1;
  const capacity = width * (bounds.yMax - bounds.yMin + 1);
  const occupied: Record<number, boolean> = {};
  for (const cell of snake) {
    occupied[(cell.y - bounds.yMin) * width + cell.x - bounds.xMin] = true;
  }
  let freeCount = 0;
  for (let i = 0; i < capacity; i++) if (!occupied[i]) freeCount++;
  let target = Math.floor((nextSeed / 4294967296) * freeCount);
  for (let i = 0; i < capacity; i++) {
    if (!occupied[i] && target-- === 0) {
      return {
        food: {
          x: bounds.xMin + (i % width),
          y: bounds.yMin + Math.floor(i / width),
        } as Coordinate | null,
        seed: nextSeed,
      };
    }
  }
  return { food: null as Coordinate | null, seed: nextSeed };
}

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

function prepare(state: EngineState): EngineState {
  "worklet";
  const { committed } = state;
  const direction = state.queuedDirection ?? committed.direction;
  const head = committed.snake[0];
  const destination = {
    x:
      head.x +
      (direction === Direction.Right
        ? 1
        : direction === Direction.Left
          ? -1
          : 0),
    y:
      head.y +
      (direction === Direction.Down ? 1 : direction === Direction.Up ? -1 : 0),
  };
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

export function queueDirection(
  state: EngineState,
  direction: Direction,
): EngineState {
  "worklet";
  if (state.phase !== "moving" || state.queuedDirection !== null) return state;
  const current = state.pending?.direction ?? state.committed.direction;
  const opposite =
    (current === Direction.Right && direction === Direction.Left) ||
    (current === Direction.Left && direction === Direction.Right) ||
    (current === Direction.Up && direction === Direction.Down) ||
    (current === Direction.Down && direction === Direction.Up);
  return opposite || current === direction
    ? state
    : { ...state, queuedDirection: direction };
}

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

export function resumeEngine(state: EngineState): EngineState {
  "worklet";
  if (state.phase !== "paused") return state;
  const next = { ...state, phase: state.pausedPhase, lastTimestamp: null };
  return acknowledgeRenderer(next, next.sessionId, next.mountedCapacity);
}

/** Inject deltas for deterministic tests; the app supplies monotonic UI frame timestamps. */
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
