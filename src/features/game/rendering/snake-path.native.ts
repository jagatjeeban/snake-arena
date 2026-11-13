//import Skia
import { FillType, Skia } from "@shopify/react-native-skia";
import type { SkPathBuilder } from "@shopify/react-native-skia";

//import rendering configuration and types
import { SNAKE_STYLE } from "./style";
import type { RenderPoint, SnakeGeometry } from "@/types/game/rendering";

// A clockwise trapezoid and clockwise disks share nonzero winding. All overlaps
// are filled in one draw, avoiding holes and translucent seams at tight bends.
function addStrip(
  path: SkPathBuilder,
  a: RenderPoint,
  b: RenderPoint,
  ra: number,
  rb: number,
) {
  "worklet";

  const length = Math.hypot(b.x - a.x, b.y - a.y);
  if (length < 1e-7) return;
  const nx = -(b.y - a.y) / length;
  const ny = (b.x - a.x) / length;
  path
    .moveTo(a.x + nx * ra, a.y + ny * ra)
    .lineTo(a.x - nx * ra, a.y - ny * ra)
    .lineTo(b.x - nx * rb, b.y - ny * rb)
    .lineTo(b.x + nx * rb, b.y + ny * rb)
    .close();
}

/**
 * Converts one frame's pure geometry into immutable native paths. Skia is kept
 * out of the engine, pure tests, and web's import graph. No paths escape to JS.
 */
export function buildSnakePaths(geometry: SnakeGeometry) {
  "worklet";

  const body = Skia.PathBuilder.Make().setFillType(FillType.Winding);
  const highlights = [0, 1, 2, 3].map(() =>
    Skia.PathBuilder.Make().setFillType(FillType.Winding),
  );
  const head = Skia.PathBuilder.Make();
  const eyes = Skia.PathBuilder.Make();
  const pupils = Skia.PathBuilder.Make();
  const headHighlight = Skia.PathBuilder.Make();
  const { samples, taperLength } = geometry;

  for (let index = 0; index < samples.length; index += 1) {
    const point = samples[index];
    if (point.radius > 0) body.addCircle(point.x, point.y, point.radius);
    const next = samples[index + 1];
    if (!next) continue;
    addStrip(body, point, next, point.radius, next.radius);

    const fade = Math.min(
      1,
      (point.distanceFromTail + next.distanceFromTail) / (2 * taperLength),
    );
    const band = Math.min(3, Math.floor(fade * 4));
    const path = highlights[band];
    const aScale = point.radius / SNAKE_STYLE.bodyRadius;
    const bScale = next.radius / SNAKE_STYLE.bodyRadius;
    // A consistent upper-left light source avoids flips when the snake turns.
    const a = {
      x: point.x - SNAKE_STYLE.highlightOffset * aScale,
      y: point.y - SNAKE_STYLE.highlightOffset * aScale,
    };
    const b = {
      x: next.x - SNAKE_STYLE.highlightOffset * bScale,
      y: next.y - SNAKE_STYLE.highlightOffset * bScale,
    };
    const ra = SNAKE_STYLE.highlightRadius * aScale;
    const rb = SNAKE_STYLE.highlightRadius * bScale;
    addStrip(path, a, b, ra, rb);
    if (ra > 0) path.addCircle(a.x, a.y, ra);
    if (rb > 0) path.addCircle(b.x, b.y, rb);
  }

  if (geometry.head) {
    const pose = geometry.head;
    const matrix = Skia.Matrix().translate(pose.x, pose.y).rotate(pose.angle);
    head
      .addOval({
        x: -SNAKE_STYLE.headLength / 2,
        y: -SNAKE_STYLE.headWidth / 2,
        width: SNAKE_STYLE.headLength,
        height: SNAKE_STYLE.headWidth,
      })
      .transform(matrix);
    for (const side of [-1, 1]) {
      eyes.addCircle(
        SNAKE_STYLE.eyeForward,
        side * SNAKE_STYLE.eyeSide,
        SNAKE_STYLE.eyeRadius,
      );
      pupils.addCircle(
        SNAKE_STYLE.eyeForward + SNAKE_STYLE.pupilForward,
        side * SNAKE_STYLE.eyeSide,
        SNAKE_STYLE.pupilRadius,
      );
    }
    eyes.transform(matrix);
    pupils.transform(matrix);
    headHighlight
      .addOval({
        x: -SNAKE_STYLE.headLength * 0.3,
        y: -SNAKE_STYLE.headWidth * 0.3,
        width: SNAKE_STYLE.headLength * 0.4,
        height: SNAKE_STYLE.headWidth * 0.12,
      })
      .transform(matrix);
  }

  return {
    body: body.build(),
    highlights: highlights.map((path) => path.build()),
    head: head.build(),
    eyes: eyes.build(),
    pupils: pupils.build(),
    headHighlight: headHighlight.build(),
  };
}
