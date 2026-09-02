export type GestureEventType = {
  translationX: number;
  translationY: number;
};

export type Coordinate = {
  x: number;
  y: number;
};

export enum Direction {
  Right,
  Left,
  Up,
  Down,
}

export type Boundary = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};
