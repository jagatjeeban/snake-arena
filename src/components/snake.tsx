import { StyleSheet, View } from "react-native";
import { Fragment } from "react/jsx-runtime";

//import types
import { type Coordinate } from "@/types/game";
import type { SnakeProps } from "@/types/snake";

//import constants
import { colors } from "@/constants";

//import game configs
import { CELL_SIZE } from "@/features/game/config";

const Snake = ({ snake, direction }: SnakeProps) => {
  return (
    <Fragment>
      {snake.map((segment: Coordinate, index: number) => {
        const segmentStyle = {
          left: segment.x * CELL_SIZE,
          top: segment.y * CELL_SIZE,
          // borderLeftWidth:
          //   direction === Direction.Right
          //     ? index !== snake.length - 1
          //       ? 0.3
          //       : undefined
          //     : undefined,
          // borderTopWidth:
          //   direction === Direction.Down
          //     ? index !== snake.length - 1
          //       ? 0.3
          //       : undefined
          //     : undefined,
          // borderRightWidth:
          //   direction === Direction.Left
          //     ? index !== snake.length - 1
          //       ? 0.3
          //       : undefined
          //     : undefined,
          // borderBottomWidth:
          //   direction === Direction.Up
          //     ? index !== snake.length - 1
          //       ? 0.3
          //       : undefined
          //     : undefined,
          // borderColor: colors.background,
        };
        return <View key={index} style={[styles.snake, segmentStyle]} />;
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
