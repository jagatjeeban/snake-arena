import {
  acceptsSessionEvent,
  claimCompletion,
} from "@/features/game/engine/session-events";
import {
  acknowledgeRenderer,
  advanceEngine,
  advanceFrame,
  createEngine,
  movementSnapshot,
  pauseEngine,
  queueDirection,
  resumeEngine,
  segmentPosition,
  selectFreeCell,
  type EngineState,
} from "@/features/game/engine/snake-engine";
import { Direction, type Coordinate } from "@/types/game";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const bounds = { xMin: 0, yMin: 0, xMax: 9, yMax: 9 };
const difficulty = {
  initialTickMs: 100,
  minimumTickMs: 30,
  initialTickMsDecrement: 20,
  scoreIncrement: 10,
};
function engine(
  options: Partial<Parameters<typeof createEngine>[0]> = {},
  capacity = 100,
) {
  const state = createEngine({
    bounds,
    difficulty,
    sessionId: 1,
    seed: 123,
    snake: [{ x: 3, y: 3 }],
    food: { x: 4, y: 3 },
    ...options,
  });
  return acknowledgeRenderer(state, state.sessionId, capacity);
}
function advance(state: EngineState, ms: number) {
  while (ms > 0) {
    const delta = Math.min(ms, 10);
    state = advanceEngine(state, delta);
    ms -= delta;
  }
  return state;
}
function position(state: EngineState, index = 0) {
  return segmentPosition(movementSnapshot(state), index);
}

describe("arrival commits", () => {
  it("holds food, score and committed length until arrival, then changes them once", () => {
    const initial = engine();
    const before = advance(initial, 99);
    assert.deepEqual(before.committed.food, initial.committed.food);
    assert.equal(before.committed.score, 0);
    assert.equal(before.committed.snake.length, 1);
    assert.deepEqual(position(before), { x: 3.99, y: 3 });
    assert.deepEqual(position(before, 1), { x: 3, y: 3 });
    const arrived = advance(before, 1);
    assert.equal(arrived.committed.score, 10);
    assert.equal(arrived.committed.snake.length, 2);
    assert.notDeepEqual(arrived.committed.food, initial.committed.food);
    assert.equal(arrived.pending?.durationMs, 80);
    assert.equal(arrived.committed.decrement, 19);
    assert.equal(advance(arrived, 1).committed.score, 10);
  });
  it("does not eat neighboring cells", () => {
    for (const food of [
      { x: 4, y: 4 },
      { x: 3, y: 4 },
      { x: 5, y: 3 },
    ]) {
      const state = advance(engine({ food }), 100);
      assert.equal(state.committed.score, 0);
      assert.deepEqual(state.committed.food, food);
    }
  });
  it("retains the old tail during growth with every slot present before arrival", () => {
    const snake = [
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
    ];
    const state = advance(engine({ snake }), 50);
    assert.deepEqual(position(state, 2), { x: 1.5, y: 3 });
    assert.deepEqual(position(state, 3), { x: 1, y: 3 });
    const arrived = advance(state, 50);
    assert.deepEqual(position(arrived, 3), { x: 1, y: 3 });
  });
  it("preserves straight and turning continuity, carrying remainder into the new speed", () => {
    let state = queueDirection(engine(), Direction.Down);
    state = advance(state, 90);
    state = advanceEngine(state, 20);
    assert.deepEqual(state.committed.snake[0], { x: 4, y: 3 });
    assert.equal(state.pending?.direction, Direction.Down);
    assert.equal(state.elapsedMs, 10);
    assert.deepEqual(position(state), { x: 4, y: 3.125 });
    assert.deepEqual(position(state, 1), { x: 3.125, y: 3 });
    assert.equal(state.pending?.durationMs, 80);
  });
  it("preserves all difficulty decrements and clamps only following moves", () => {
    let state = engine({
      difficulty: {
        ...difficulty,
        initialTickMs: 40,
        initialTickMsDecrement: 20,
      },
    });
    assert.equal(advance(state, 39).pending?.durationMs, 40);
    state = advance(state, 40);
    assert.equal(state.committed.durationMs, 30);
    assert.equal(state.committed.decrement, 19);
  });
});

describe("collision and board rules", () => {
  it("allows entry into a vacated tail cell", () => {
    const state = engine({
      snake: [
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
        { x: 3, y: 2 },
      ],
      food: { x: 9, y: 9 },
    });
    assert.equal(state.pending?.outcome, "move");
    assert.equal(advance(state, 100).terminalReason, null);
  });
  it("animates self-collision to overlap, then freezes", () => {
    const state = engine({
      snake: [
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
      ],
      food: { x: 9, y: 9 },
    });
    assert.equal(state.pending?.outcome, "self-collision");
    assert.equal(advance(state, 99).terminalReason, null);
    const collision = advance(state, 100);
    assert.equal(collision.terminalReason, "self-collision");
    assert.deepEqual(position(collision), position(collision, 4));
    assert.deepEqual(position(advance(collision, 200)), position(collision));
  });
  it("never prepares or renders an out-of-bounds destination", () => {
    let state = engine({ snake: [{ x: 8, y: 3 }], food: { x: 0, y: 0 } });
    state = advance(state, 99);
    assert.equal(state.phase, "moving");
    state = advance(state, 1);
    assert.equal(state.terminalReason, "boundary");
    assert.deepEqual(position(state), { x: 9, y: 3 });
    assert.equal(state.pending, null);
  });
  it("selects inclusive maximum cells and returns null on a full board with a repeatable seed", () => {
    const small = { xMin: 2, xMax: 3, yMin: 4, yMax: 5 };
    const snake = [
      { x: 2, y: 4 },
      { x: 3, y: 4 },
      { x: 2, y: 5 },
    ];
    const first = selectFreeCell(small, snake, 1);
    assert.deepEqual(first.food, { x: 3, y: 5 });
    assert.deepEqual(first, selectFreeCell(small, snake, 1));
    assert.equal(selectFreeCell(small, [...snake, first.food!], 1).food, null);
  });
  it("completes the full board at arrival, hides food and holds the board", () => {
    const state = advance(
      engine({
        bounds: { xMin: 0, xMax: 1, yMin: 0, yMax: 0 },
        snake: [{ x: 0, y: 0 }],
        food: { x: 1, y: 0 },
      }),
      100,
    );
    assert.equal(state.terminalReason, "full-board");
    assert.equal(movementSnapshot(state).food, null);
    assert.equal(state.committed.score, 10);
    assert.equal(advance(state, 299).completionReady, false);
    assert.equal(advance(state, 300).completionReady, true);
  });
  it("keeps valid starting coordinates and replaces invalid coordinates on a tiny board", () => {
    assert.deepEqual(engine().pending?.from[0], { x: 3, y: 3 });
    const state = engine({ bounds: { xMin: 0, xMax: 0, yMin: 0, yMax: 0 } });
    assert.deepEqual(state.committed.snake, [{ x: 0, y: 0 }]);
    assert.equal(state.terminalReason, "full-board");
  });
});

describe("clock, lifecycle and renderer readiness", () => {
  it("preserves fractional pause progress, ignores input, and resets the frame baseline", () => {
    let state = advanceFrame(engine(), 1000);
    state = advanceFrame(state, 1025);
    const paused = pauseEngine(queueDirection(state, Direction.Down));
    assert.equal(paused.queuedDirection, null);
    assert.equal(queueDirection(paused, Direction.Down), paused);
    assert.deepEqual(position(advanceFrame(paused, 10000)), position(state));
    state = advanceFrame(resumeEngine(paused), 20000);
    assert.equal(state.elapsedMs, 25);
    assert.equal(advanceFrame(state, 20010).elapsedMs, 35);
  });
  it("counts the terminal hold only while active, continuing after explicit resume", () => {
    let state = engine({ snake: [{ x: 9, y: 3 }] });
    state = advance(state, 150);
    state = pauseEngine(state);
    assert.equal(advance(state, 10000).terminalElapsedMs, 150);
    state = resumeEngine(state);
    assert.equal(advance(state, 149).completionReady, false);
    assert.equal(advance(state, 150).completionReady, true);
  });
  it("buffers only one legal turn relative to the active move", () => {
    const state = engine();
    assert.equal(queueDirection(state, Direction.Left), state);
    const queued = queueDirection(state, Direction.Down);
    assert.equal(queueDirection(queued, Direction.Up), queued);
    const turned = advance(queued, 100);
    assert.equal(queueDirection(turned, Direction.Up), turned);
    assert.equal(
      queueDirection(turned, Direction.Left).queuedDirection,
      Direction.Left,
    );
  });
  it("caps large deltas, allowing at most one completion even at maximum speed", () => {
    let state = engine({
      difficulty: { ...difficulty, initialTickMs: 30 },
      food: { x: 0, y: 0 },
    });
    state = advance(state, 29);
    state = advanceEngine(state, 5000);
    assert.deepEqual(state.committed.snake[0], { x: 4, y: 3 });
    assert.equal(state.elapsedMs, 29);
    assert.equal(advanceEngine(state, Number.NaN), state);
  });
  it("runs continuously with 60 and 120 Hz deltas", () => {
    for (const hz of [60, 120]) {
      let state = engine({ food: { x: 0, y: 0 } });
      for (let frame = 1; frame <= hz / 2; frame++) {
        state = advanceEngine(state, 1000 / hz);
        assert.ok(
          Math.abs(position(state)!.x - (3 + (frame * 10) / hz)) < 0.000001,
        );
      }
    }
  });
  it("holds an eating move coherently when the growth slot is unavailable", () => {
    let state = engine({}, 1);
    assert.equal(state.phase, "waiting-for-renderer");
    assert.equal(movementSnapshot(state).to.length, 1);
    assert.equal(advance(state, 1000).committed.score, 0);
    assert.equal(acknowledgeRenderer(state, 0, 100), state);
    state = acknowledgeRenderer(state, 1, 2);
    assert.equal(state.phase, "moving");
    assert.deepEqual(position(state, 1), { x: 3, y: 3 });
    assert.equal(advance(state, 100).committed.score, 10);
  });
  it("requests slots in batches before capacity is exhausted and respects board capacity", () => {
    const snake: Coordinate[] = Array.from({ length: 32 }, (_, x) => ({
      x: 32 - x,
      y: 1,
    }));
    let state = engine({
      bounds: { xMin: 0, xMax: 99, yMin: 0, yMax: 1 },
      snake,
      food: { x: 33, y: 1 },
    });
    state = { ...state, requestedCapacity: 48 };
    state = advance(state, 100);
    assert.equal(state.requestedCapacity, 80);
    assert.ok(state.requestedCapacity <= state.boardCapacity);
  });
  it("renderer acknowledgement while paused never resumes movement", () => {
    let state = pauseEngine(engine({}, 1));
    state = acknowledgeRenderer(state, 1, 33);
    assert.equal(state.phase, "paused");
    assert.equal(resumeEngine(state).phase, "moving");
  });
  it("new paused sessions replace all pending progress and ignore obsolete acknowledgements", () => {
    const old = advance(engine(), 75);
    const next = createEngine({
      bounds: { ...bounds, xMax: 2 },
      difficulty,
      sessionId: old.sessionId + 1,
      seed: 9,
      snake: [{ x: 3, y: 3 }],
      food: { x: 4, y: 3 },
      paused: true,
    });
    assert.equal(next.phase, "paused");
    assert.equal(next.elapsedMs, 0);
    assert.equal(next.pending, null);
    assert.equal(acknowledgeRenderer(next, old.sessionId, 99), next);
  });
  it("invalidates callbacks on restart/unmount and delivers completion once", () => {
    const events = { sessionId: 1, mounted: true, delivered: false };
    assert.equal(claimCompletion(events, 1), true);
    assert.equal(claimCompletion(events, 1), false);
    events.sessionId = 2;
    events.delivered = false;
    assert.equal(acceptsSessionEvent(events, 1), false);
    assert.equal(claimCompletion(events, 1), false);
    events.mounted = false;
    assert.equal(claimCompletion(events, 2), false);
  });
});
