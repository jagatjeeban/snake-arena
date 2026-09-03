import { Coordinate, Direction } from "./game";

export type SnakeProps = {
  snake: Coordinate[];
  tickMs: number;
  direction: Direction;
};
