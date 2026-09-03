import { StyleSheet } from "react-native";
import { Fragment } from "react/jsx-runtime";

//import types
import { type Coordinate } from "@/types/game";
import type { SnakeProps } from "@/types/snake";

//import constants
import { colors } from "@/constants";

//import game configs
import { CELL_SIZE } from "@/features/game/config";

//import components
import SnakeSegment from "./snake-segment";

const Snake = ({ snake, tickMs }: SnakeProps) => {
  return (
    <Fragment>
      {snake.map((segment: Coordinate, index: number) => {
        // const segmentStyle = {
        //   left: segment.x * CELL_SIZE,
        //   top: segment.y * CELL_SIZE,
        // };
        return <SnakeSegment key={index} segment={segment} tickMs={tickMs} />;
      })}
    </Fragment>
  );
};

export default Snake;

const styles = StyleSheet.create({
  snake: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: colors.primary,
    position: "absolute",
    borderRadius: 7.5,
    // borderWidth: 0.2,
    // borderColor: colors.background,
  },
});
