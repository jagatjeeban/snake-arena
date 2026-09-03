//import types
import { Coordinate, Direction } from "./game";

export type SnakeSegmentProps = {
  segment: Coordinate;
  tickMs: number;
  index: number;
  direction: Direction;
};
