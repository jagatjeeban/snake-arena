import { StyleSheet, View } from "react-native";
import { Fragment } from "react/jsx-runtime";

//import types
import type { Coordinate } from "@/types/game";
import type { SnakeProps } from "@/types/snake";

//import constants
import { colors } from "@/constants";

//import game configs
import { CELL_SIZE } from "@/features/game/config";

const Snake = ({ snake }: SnakeProps) => {
  return (
    <Fragment>
      {snake.map((segment: Coordinate, index: number) => {
        const segmentStyle = {
          left: segment.x * CELL_SIZE,
          top: segment.y * CELL_SIZE,
        };
        return <View key={index} style={[styles.snake, segmentStyle]} />;
      })}
    </Fragment>
  );
};

export default Snake;

const styles = StyleSheet.create({
  snake: {
    width: CELL_SIZE + 5,
    height: CELL_SIZE + 5,
    backgroundColor: colors.primary,
    position: "absolute",
    borderRadius: 7.5,
  },
});
