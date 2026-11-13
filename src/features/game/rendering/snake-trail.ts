//import configuration
import { CELL_SIZE } from "../config/geometry";
import { SNAKE_STYLE } from "./style";

//import types
import { Direction } from "@/types/game/geometry";
import type { Coordinate } from "@/types/game/geometry";
import type { MovementSnapshot } from "@/types/game/engine";
import type { RenderPoint } from "@/types/game/rendering";

/** Interpolates cell centers using the engine's existing clock. */
export function movingCenter(
  from: Coordinate,
  to: Coordinate,
  progress: number,
): RenderPoint {
  "worklet";

  return {
    x: (from.x + (to.x - from.x) * progress + 0.5) * CELL_SIZE,
    y: (from.y + (to.y - from.y) * progress + 0.5) * CELL_SIZE,
  };
}

/** Removes duplicate and forward-collinear vertices without erasing reversals. */
export function simplifyTrail(points: RenderPoint[]): RenderPoint[] {
  "worklet";

  const result: RenderPoint[] = [];
  for (const point of points) {
    const last = result[result.length - 1];
    if (last && Math.hypot(point.x - last.x, point.y - last.y) < 1e-7) continue;

    while (result.length >= 2) {
      const a = result[result.length - 2];
      const b = result[result.length - 1];
      const cross =
        (b.x - a.x) * (point.y - b.y) - (b.y - a.y) * (point.x - b.x);
      const dot = (b.x - a.x) * (point.x - b.x) + (b.y - a.y) * (point.y - b.y);
      if (Math.abs(cross) > 1e-7 || dot <= 0) break;
      result.pop();
    }
    result.push(point);
  }
  return result;
}

/**
 * Extends the head and retracts the tail along the committed route. During
 * growth the engine duplicates the old tail, so that endpoint remains fixed.
 * Capacity stays a logical limit on native, matching the existing acknowledgement.
 */
export function buildSnakeTrail(
  snapshot: MovementSnapshot,
  capacity: number,
): RenderPoint[] {
  "worklet";

  const count = Math.min(snapshot.from.length, snapshot.to.length);
  if (count === 0 || count > capacity) return [];
  const progress = Math.max(0, Math.min(1, snapshot.progress));
  const head = movingCenter(snapshot.from[0], snapshot.to[0], progress);
  if (count === 1) return [head];

  const points = [head];
  for (let index = 0; index < count - 1; index += 1) {
    points.push(movingCenter(snapshot.from[index], snapshot.from[index], 0));
  }
  points.push(
    movingCenter(snapshot.from[count - 1], snapshot.to[count - 1], progress),
  );
  return simplifyTrail(points);
}

/** Resolves head rotation from snapshot geometry, with no retained session state. */
export function headAngle(
  snapshot: MovementSnapshot,
  reducedMotion: boolean,
): number {
  "worklet";

  const target =
    snapshot.direction === Direction.Down
      ? Math.PI / 2
      : snapshot.direction === Direction.Left
        ? Math.PI
        : snapshot.direction === Direction.Up
          ? -Math.PI / 2
          : 0;
  const head = snapshot.from[0];
  const neck = snapshot.from[1];
  const destination = snapshot.to[0];
  // Stationary/terminal snapshots already carry the committed direction.
  if (
    reducedMotion ||
    !head ||
    !neck ||
    !destination ||
    (head.x === destination.x && head.y === destination.y) ||
    (head.x === neck.x && head.y === neck.y)
  )
    return target;

  const previous = Math.atan2(head.y - neck.y, head.x - neck.x);
  const delta = Math.atan2(
    Math.sin(target - previous),
    Math.cos(target - previous),
  );
  const progress = Math.max(
    0,
    Math.min(1, snapshot.progress / SNAKE_STYLE.turnProgress),
  );
  return previous + delta * progress;
}

/**
 * Samples a quadratic with a conservative error bound. For equal parameter
 * steps, the curve-to-chord deviation is at most |a - 2b + c| / (4 n²).
 */
export function sampleQuadratic(
  a: RenderPoint,
  b: RenderPoint,
  c: RenderPoint,
): RenderPoint[] {
  "worklet";

  const curvature = Math.hypot(a.x - 2 * b.x + c.x, a.y - 2 * b.y + c.y);
  const steps = Math.max(
    1,
    Math.ceil(Math.sqrt(curvature / (4 * SNAKE_STYLE.chordError))),
  );
  const points: RenderPoint[] = [];
  for (let index = 1; index <= steps; index += 1) {
    const t = index / steps;
    const s = 1 - t;
    points.push({
      x: s * s * a.x + 2 * s * t * b.x + t * t * c.x,
      y: s * s * a.y + 2 * s * t * b.y + t * t * c.y,
    });
  }
  return points;
}

/** Rounds only actual turns, keeping both moving endpoints at their exact positions. */
export function roundTrail(points: RenderPoint[]): RenderPoint[] {
  "worklet";

  if (points.length < 3) return points;
  const result = [points[0]];
  for (let index = 1; index < points.length - 1; index += 1) {
    const a = points[index - 1];
    const b = points[index];
    const c = points[index + 1];
    const incoming = Math.hypot(b.x - a.x, b.y - a.y);
    const outgoing = Math.hypot(c.x - b.x, c.y - b.y);
    const radius = Math.min(SNAKE_STYLE.turnRadius, incoming / 2, outgoing / 2);
    if (radius === 0) continue;

    const entry = {
      x: b.x + ((a.x - b.x) * radius) / incoming,
      y: b.y + ((a.y - b.y) * radius) / incoming,
    };
    const exit = {
      x: b.x + ((c.x - b.x) * radius) / outgoing,
      y: b.y + ((c.y - b.y) * radius) / outgoing,
    };
    result.push(entry, ...sampleQuadratic(entry, b, exit));
  }
  result.push(points[points.length - 1]);
  return simplifyTrail(result);
}
