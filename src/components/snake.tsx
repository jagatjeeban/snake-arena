import { Fragment } from "react/jsx-runtime";

//import types
import { type Coordinate } from "@/types/game";
import type { SnakeProps } from "@/types/snake";

//import components
import SnakeSegment from "./snake-segment";

const Snake = ({ snake, tickMs, direction }: SnakeProps) => {
  return (
    <Fragment>
      {snake.map((segment: Coordinate, index: number) => {
        return (
          <SnakeSegment
            key={index}
            index={index}
            segment={segment}
            direction={direction}
            tickMs={tickMs}
          />
        );
      })}
    </Fragment>
  );
};

export default Snake;
