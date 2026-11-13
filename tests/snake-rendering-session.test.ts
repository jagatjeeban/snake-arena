import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createEngine,
  acknowledgeRenderer,
  advanceEngine,
  advanceFrame,
  pauseEngine,
  resumeEngine,
  queueDirection,
} from "../src/features/game/engine/snake-engine";
import { movementSnapshot } from "../src/features/game/engine/movement-snapshot";
import { buildSnakeGeometry } from "../src/features/game/rendering/snake-geometry";
import { Direction } from "../src/types/game/geometry";
import type { EngineState } from "../src/types/game/engine";

function engine(
  snake = [
    { x: 2, y: 2 },
    { x: 1, y: 2 },
  ],
  food = { x: 3, y: 2 },
) {
  return createEngine({
    bounds: { xMin: 0, xMax: 8, yMin: 0, yMax: 8 },
    snake,
    food,
    seed: 42,
    sessionId: 1,
    difficulty: {
      initialTickMs: 100,
      minimumTickMs: 20,
      initialTickMsDecrement: 5,
      scoreIncrement: 10,
    },
  });
}

function render(state: EngineState) {
  return buildSnakeGeometry(movementSnapshot(state), state.mountedCapacity);
}

function arrive(state: EngineState) {
  for (let i = 0; i < 5; i += 1) state = advanceEngine(state, 20);
  return state;
}

test("logical native capacity releases initialization, stale acknowledgements cannot release it", () => {
  const state = engine();
  assert.equal(render(state).head, null);
  assert.equal(acknowledgeRenderer(state, 0, 81), state);
  const ready = acknowledgeRenderer(state, 1, state.requestedCapacity);
  assert.equal(ready.phase, "moving");
  assert.ok(render(ready).head);
});

test("growth waits for capacity and food/score commit only on arrival", () => {
  let state = acknowledgeRenderer(engine(), 1, 2);
  assert.equal(state.phase, "waiting-for-renderer");
  const waiting = render(state);
  assert.equal(waiting.trail.length, 2);
  state = acknowledgeRenderer(state, 1, 3);
  for (let i = 0; i < 4; i += 1) state = advanceEngine(state, 20);
  assert.equal(movementSnapshot(state).score, 0);
  assert.deepEqual(movementSnapshot(state).food, { x: 3, y: 2 });
  assert.deepEqual(render(state).trail.at(-1), waiting.trail.at(-1));
  state = advanceEngine(state, 20);
  assert.equal(state.committed.snake.length, 3);
  assert.equal(movementSnapshot(state).score, 10);
  assert.notDeepEqual(movementSnapshot(state).food, { x: 3, y: 2 });
});

test("pause/resume retains the pose and ignores background wall-clock time", () => {
  let state = acknowledgeRenderer(engine(), 1, 81);
  state = advanceFrame(advanceFrame(state, 1000), 1020);
  const before = render(state);
  const paused = pauseEngine(state);
  assert.deepEqual(render(advanceFrame(paused, 99999)), before);
  state = advanceFrame(resumeEngine(paused), 100000);
  assert.deepEqual(render(state), before);
  assert.notDeepEqual(render(advanceFrame(state, 100020)), before);
});

test("restart derives fresh geometry without carrying rotation or tail state", () => {
  const old = advanceEngine(acknowledgeRenderer(engine(), 1, 81), 20);
  const fresh = {
    ...engine(
      [
        { x: 6, y: 6 },
        { x: 5, y: 6 },
      ],
      { x: 8, y: 8 },
    ),
    sessionId: 2,
  };
  assert.equal(acknowledgeRenderer(fresh, 1, 81), fresh);
  const ready = acknowledgeRenderer(fresh, 2, 81);
  assert.notDeepEqual(render(ready).head, render(old).head);
  assert.deepEqual(render(ready), render(ready));
});

test("queued turn starts with the preceding tick's pose", () => {
  let state = acknowledgeRenderer(engine(undefined, { x: 8, y: 8 }), 1, 81);
  state = queueDirection(state, Direction.Up);
  const completed = buildSnakeGeometry(
    { ...movementSnapshot(state), progress: 1 },
    81,
  );
  state = arrive(state);
  assert.deepEqual(render(state).head, completed.head);
  assert.deepEqual(render(state).samples, completed.samples);
});

test("wall and self collisions retain engine-owned terminal timing", () => {
  const wall = acknowledgeRenderer(
    engine(
      [
        { x: 8, y: 2 },
        { x: 7, y: 2 },
      ],
      { x: 0, y: 0 },
    ),
    1,
    81,
  );
  assert.equal(wall.terminalReason, "boundary");
  assert.ok(render(wall).head);
  assert.equal(wall.completionReady, false);

  let self = acknowledgeRenderer(
    engine(
      [
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
      ],
      { x: 0, y: 0 },
    ),
    1,
    81,
  );
  assert.equal(self.phase, "moving");
  self = arrive(self);
  assert.equal(self.terminalReason, "self-collision");
  assert.ok(render(self).head);
  assert.equal(self.completionReady, false);
});

test("full-board arrival renders the final grown snake", () => {
  let state = createEngine({
    bounds: { xMin: 0, xMax: 1, yMin: 0, yMax: 1 },
    snake: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    food: { x: 1, y: 0 },
    seed: 42,
    sessionId: 1,
    difficulty: {
      initialTickMs: 100,
      minimumTickMs: 20,
      initialTickMsDecrement: 5,
      scoreIncrement: 10,
    },
  });
  state = arrive(acknowledgeRenderer(state, 1, 4));
  assert.equal(state.terminalReason, "full-board");
  assert.equal(state.committed.snake.length, 4);
  assert.equal(movementSnapshot(state).food, null);
  assert.ok(render(state).samples.length > 0);
});
