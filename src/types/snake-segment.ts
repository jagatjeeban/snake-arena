import type { SnakeProps } from "./snake";

export type SnakeSegmentProps = Pick<SnakeProps, "snapshot"> & {
  index: number;
};
