//import rendering helpers
import { buildSnakeTrail, headAngle, roundTrail } from "./snake-trail";
import { SNAKE_STYLE } from "./style";

//import types
import type { MovementSnapshot, RenderPoint, SnakeGeometry, TrailSample } from "@/types/game";

/** Adds exact taper/fade boundaries even when the tail lies on one long straight. */
export function taperTrail(points: RenderPoint[]): {
  samples: TrailSample[];
  taperLength: number;
} {
  "worklet";

  if (points.length < 2) return { samples: [], taperLength: 0 };
  const distances = new Array<number>(points.length).fill(0);
  for (let index = points.length - 2; index >= 0; index -= 1) {
    distances[index] =
      distances[index + 1] +
      Math.hypot(
        points[index].x - points[index + 1].x,
        points[index].y - points[index + 1].y,
      );
  }
  const taperLength = Math.min(SNAKE_STYLE.taperLength, distances[0] / 2);
  if (taperLength === 0) return { samples: [], taperLength: 0 };

  // Keep this helper inside the serialized worklet. A separate module-local
  // function was unavailable when Reanimated evaluated taperTrail on the UI thread.
  const makeSample = (
    point: RenderPoint,
    distanceFromTail: number,
  ): TrailSample => {
    const radius = Math.min(
      SNAKE_STYLE.bodyRadius * Math.min(1, distanceFromTail / taperLength),
      distanceFromTail * 0.9,
    );
    return { ...point, distanceFromTail, radius };
  };

  const samples: TrailSample[] = [];
  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const distance = distances[index];
    samples.push(makeSample(point, distance));
    const next = points[index + 1];
    if (!next) continue;

    for (let quarter = 4; quarter >= 1; quarter -= 1) {
      const boundary = (taperLength * quarter) / 4;
      if (boundary >= distance || boundary <= distances[index + 1]) continue;
      const t = (distance - boundary) / (distance - distances[index + 1]);
      samples.push(
        makeSample(
          {
            x: point.x + (next.x - point.x) * t,
            y: point.y + (next.y - point.y) * t,
          },
          boundary,
        ),
      );
    }
  }
  return { samples, taperLength };
}

/** Creates the one deterministic per-frame model shared by all native drawing layers. */
export function buildSnakeGeometry(
  snapshot: MovementSnapshot,
  capacity: number,
  reducedMotion = false,
): SnakeGeometry {
  "worklet";

  const trail = buildSnakeTrail(snapshot, capacity);
  const { samples, taperLength } = taperTrail(roundTrail(trail));
  return {
    trail,
    samples,
    taperLength,
    head: trail.length
      ? { ...trail[0], angle: headAngle(snapshot, reducedMotion) }
      : null,
  };
}
