/** Rendering coordinates are logical pixels, not engine grid coordinates. */
export type RenderPoint = { x: number; y: number };

export type TrailSample = RenderPoint & {
  distanceFromTail: number;
  radius: number;
};

export type SnakeGeometry = {
  trail: RenderPoint[];
  samples: TrailSample[];
  taperLength: number;
  head: (RenderPoint & { angle: number }) | null;
};
