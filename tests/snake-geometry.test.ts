import assert from "node:assert/strict";
import { test } from "node:test";

import { buildSnakeGeometry } from "../src/features/game/rendering/snake-geometry";
import {
  roundTrail,
  sampleQuadratic,
  simplifyTrail,
} from "../src/features/game/rendering/snake-trail";
import { SNAKE_STYLE } from "../src/features/game/rendering/style";
import { CELL_SIZE } from "../src/features/game/config/geometry";
import { Direction } from "../src/types/game/geometry";
import type { Coordinate } from "../src/types/game/geometry";
import type { MovementSnapshot } from "../src/types/game/engine";

// Build the same transition shape used by the engine, including retained growth tails.
function snapshot(
  from: Coordinate[],
  destination: Coordinate,
  progress = 0,
  grows = false,
  direction = Direction.Right,
): MovementSnapshot {
  return {
    from: grows ? [...from, from[from.length - 1]] : from,
    to: [destination, ...(grows ? from : from.slice(0, -1))],
    progress,
    direction,
    food: null,
    score: 0,
  };
}

function close(actual: number, expected: number) {
  assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);
}

const straight = [
  { x: 4, y: 4 },
  { x: 3, y: 4 },
  { x: 2, y: 4 },
  { x: 1, y: 4 },
];

test("empty and insufficient-capacity snapshots never expose partial snakes", () => {
  assert.equal(
    buildSnakeGeometry(
      {
        from: [],
        to: [],
        progress: 0,
        direction: Direction.Right,
        food: null,
        score: 0,
      },
      0,
    ).head,
    null,
  );
  assert.equal(
    buildSnakeGeometry(snapshot(straight, { x: 5, y: 4 }), 3).head,
    null,
  );
});

test("a one-cell snake draws only its interpolated head", () => {
  const result = buildSnakeGeometry(
    snapshot([{ x: 1, y: 1 }], { x: 2, y: 1 }, 0.5),
    1,
  );
  assert.equal(result.samples.length, 0);
  assert.deepEqual(result.head, {
    x: 2 * CELL_SIZE,
    y: 1.5 * CELL_SIZE,
    angle: 0,
  });
});

test("simplification preserves bends and reversals while collapsing long straights", () => {
  assert.deepEqual(
    simplifyTrail([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 0 },
    ]),
    [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 0 },
    ],
  );
});

test("straight movement keeps length and translates both endpoints equally", () => {
  for (const progress of [0, 0.001, 0.25, 0.5, 0.99, 1]) {
    const geometry = buildSnakeGeometry(
      snapshot(straight, { x: 5, y: 4 }, progress),
      4,
    );
    assert.equal(geometry.trail.length, 2);
    close(geometry.trail[0].x, (4.5 + progress) * CELL_SIZE);
    close(geometry.trail[1].x, (1.5 + progress) * CELL_SIZE);
    close(geometry.samples[0].distanceFromTail, 3 * CELL_SIZE);
  }
});

test("growth keeps the exact tail and begins without a geometry jump", () => {
  const resting = {
    ...snapshot(straight, straight[0]),
    from: straight,
    to: straight,
  };
  const starting = buildSnakeGeometry(
    snapshot(straight, { x: 5, y: 4 }, 0, true),
    5,
  );
  assert.deepEqual(starting, buildSnakeGeometry(resting, 5));
  for (const progress of [0, 0.25, 0.5, 1]) {
    const geometry = buildSnakeGeometry(
      snapshot(straight, { x: 5, y: 4 }, progress, true),
      5,
    );
    assert.deepEqual(geometry.trail.at(-1), {
      x: 1.5 * CELL_SIZE,
      y: 4.5 * CELL_SIZE,
    });
    close(geometry.samples[0].distanceFromTail, (3 + progress) * CELL_SIZE);
  }
});

const directions = [
  { direction: Direction.Right, x: 1, y: 0 },
  { direction: Direction.Down, x: 0, y: 1 },
  { direction: Direction.Left, x: -1, y: 0 },
  { direction: Direction.Up, x: 0, y: -1 },
];

for (let orientation = 0; orientation < 4; orientation += 1) {
  for (const sign of [-1, 1]) {
    const previous = directions[orientation];
    const next = directions[(orientation + sign + 4) % 4];
    test(`${previous.direction} to ${next.direction}: axis-aligned trail, bounded rounding and shortest head turn`, () => {
      const cells = Array.from({ length: 4 }, (_, index) => ({
        x: 5 - previous.x * index,
        y: 5 - previous.y * index,
      }));
      for (const progress of [0, 0.001, 1 / 6, 1 / 3, 0.5, 0.999, 1]) {
        const state = snapshot(
          cells,
          { x: 5 + next.x, y: 5 + next.y },
          progress,
          false,
          next.direction,
        );
        const result = buildSnakeGeometry(state, 4);
        for (let index = 1; index < result.trail.length; index += 1) {
          const a = result.trail[index - 1];
          const b = result.trail[index];
          assert.ok(
            a.x === b.x || a.y === b.y,
            "trail cut a corner diagonally",
          );
        }
        const expected =
          Math.atan2(previous.y, previous.x) +
          ((sign * Math.PI) / 2) * Math.min(1, progress * 3);
        close(Math.sin(result.head!.angle), Math.sin(expected));
        close(Math.cos(result.head!.angle), Math.cos(expected));
        const reduced = buildSnakeGeometry(state, 4, true).head!;
        close(Math.cos(reduced.angle), next.x);
        close(Math.sin(reduced.angle), next.y);
        const rounded = roundTrail(result.trail);
        assert.deepEqual(rounded[0], result.trail[0]);
        assert.deepEqual(rounded.at(-1), result.trail.at(-1));
      }
    });
  }
}

test("sampled quadratic stays within the specified chord-error bound", () => {
  const a = { x: 0, y: 0 },
    b = { x: 4.5, y: 0 },
    c = { x: 4.5, y: 4.5 };
  const samples = [a, ...sampleQuadratic(a, b, c)];
  for (let index = 0; index < samples.length - 1; index += 1) {
    for (let part = 0; part <= 10; part += 1) {
      const f = part / 10,
        t = (index + f) / (samples.length - 1),
        s = 1 - t;
      const exact = {
        x: s * s * a.x + 2 * s * t * b.x + t * t * c.x,
        y: s * s * a.y + 2 * s * t * b.y + t * t * c.y,
      };
      const line = {
        x: samples[index].x + (samples[index + 1].x - samples[index].x) * f,
        y: samples[index].y + (samples[index + 1].y - samples[index].y) * f,
      };
      assert.ok(
        Math.hypot(exact.x - line.x, exact.y - line.y) <=
          SNAKE_STYLE.chordError,
      );
    }
  }
});

test("taper boundaries are inserted on a long straight, radii shrink monotonically to zero", () => {
  const cells = Array.from({ length: 20 }, (_, index) => ({
    x: 20 - index,
    y: 4,
  }));
  const geometry = buildSnakeGeometry(
    snapshot(cells, { x: 21, y: 4 }, 0.5),
    20,
  );
  for (const boundary of [7.5, 15, 22.5, 30]) {
    assert.ok(
      geometry.samples.some((point) => point.distanceFromTail === boundary),
    );
  }
  for (let index = 1; index < geometry.samples.length; index += 1) {
    assert.ok(
      geometry.samples[index].radius <= geometry.samples[index - 1].radius,
    );
  }
  assert.equal(geometry.samples.at(-1)!.radius, 0);
});

test("a tiny growing snake never produces NaN or a bulb extending beyond its tip", () => {
  for (const progress of [0, 1e-6, 0.01, 0.5, 1]) {
    const result = buildSnakeGeometry(
      snapshot([{ x: 1, y: 1 }], { x: 2, y: 1 }, progress, true),
      2,
    );
    for (const point of result.samples) {
      assert.ok(Number.isFinite(point.radius));
      assert.ok(point.radius <= point.distanceFromTail);
    }
  }
});

test("end of a tick and start of the next have identical body geometry", () => {
  const first = snapshot(straight, { x: 4, y: 3 }, 1, false, Direction.Up);
  const next = snapshot(first.to, { x: 3, y: 3 }, 0, false, Direction.Left);
  const a = buildSnakeGeometry(first, 4);
  const b = buildSnakeGeometry(next, 4);
  assert.deepEqual(a.samples, b.samples);
  close(a.head!.angle, b.head!.angle);
});

test("near-full serpentine board stays finite, bounded, and deterministic", () => {
  const cells: Coordinate[] = [];
  for (let y = 0; y < 40; y += 1) {
    for (let index = 0; index < 24; index += 1)
      cells.push({ x: y % 2 ? 23 - index : index, y });
  }
  const state: MovementSnapshot = {
    from: cells,
    to: cells,
    progress: 0,
    direction: Direction.Left,
    score: 0,
    food: null,
  };
  const a = buildSnakeGeometry(state, cells.length);
  assert.deepEqual(a, buildSnakeGeometry(state, cells.length));
  for (const point of a.samples) {
    assert.ok(Number.isFinite(point.x + point.y + point.radius));
    assert.ok(point.x >= CELL_SIZE / 2 && point.x <= 23.5 * CELL_SIZE);
    assert.ok(point.y >= CELL_SIZE / 2 && point.y <= 39.5 * CELL_SIZE);
  }
  assert.ok(a.samples.length < cells.length, "straight rows should collapse");
});

test("stationary snapshots do not replay head turns", () => {
  const state = snapshot(straight, { x: 4, y: 3 }, 1, false, Direction.Up);
  const stopped = { ...state, from: state.to, progress: 0 };
  close(buildSnakeGeometry(stopped, 4).head!.angle, -Math.PI / 2);
});
