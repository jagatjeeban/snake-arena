export type Coordinate = {
  x: number;
  y: number;
};

export enum Direction {
  Right = "Right",
  Left = "Left",
  Up = "Up",
  Down = "Down",
}

export type Boundary = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};
