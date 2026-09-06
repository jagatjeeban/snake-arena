import { Fragment, useEffect, useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

//import constants
import { colors } from "@/constants";

//import game configs
import {
  ANIMATION_OVERLAP_MS,
  CELL_SIZE,
  SNAKE_SEGMENT_OFFSET,
  SNAKE_SEGMENT_SIZE,
} from "@/features/game/config";

//import types
import { Direction } from "@/types/game";
import type { SnakeSegmentProps } from "@/types/snake-segment";

const SnakeSegment = ({
  segment,
  index,
  tickMs,
  direction,
}: SnakeSegmentProps) => {
  //shared values
  const translateX = useSharedValue<number>(
    segment.x * CELL_SIZE + SNAKE_SEGMENT_OFFSET,
  );
  const translateY = useSharedValue<number>(
    segment.y * CELL_SIZE + SNAKE_SEGMENT_OFFSET,
  );

  const xAxis = direction === Direction.Left || direction === Direction.Right;

  useEffect(() => {
    const animation = {
      duration: tickMs + ANIMATION_OVERLAP_MS,
      easing: Easing.linear,
    };

    translateX.set(
      withTiming(segment.x * CELL_SIZE + SNAKE_SEGMENT_OFFSET, animation),
    );
    translateY.set(
      withTiming(segment.y * CELL_SIZE + SNAKE_SEGMENT_OFFSET, animation),
    );
  }, [segment.x, segment.y, tickMs, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.get() },
      { translateY: translateY.get() },
    ],
  }));

  const snakeEyeDirection: ViewStyle = useMemo(() => {
    return {
      flexDirection: xAxis ? "column" : "row",
      alignItems: xAxis
        ? direction === Direction.Left
          ? "flex-start"
          : "flex-end"
        : direction === Direction.Up
          ? "flex-start"
          : "flex-end",
    };
  }, [xAxis, direction]);
  const margin = 3;
  const snakeEyeMargin: ViewStyle = useMemo(() => {
    return {
      marginTop: direction === Direction.Up ? margin : undefined,
      marginLeft: direction === Direction.Left ? margin : undefined,
      marginRight: direction === Direction.Right ? margin : undefined,
      marginBottom: direction === Direction.Down ? margin : undefined,
    };
  }, [direction]);
  // const segmentRadius: ViewStyle = useMemo(() => {
  //   return {
  //     borderRadius: index === 0 ? 3 : undefined,
  //   };
  // }, [index]);

  return (
    <Animated.View style={[styles.segment, snakeEyeDirection, animatedStyle]}>
      {index === 0 && (
        <Fragment>
          <View style={[styles.eye, snakeEyeMargin]} />
          <View style={[styles.eye, snakeEyeMargin]} />
        </Fragment>
      )}
    </Animated.View>
  );
};

export default SnakeSegment;

const styles = StyleSheet.create({
  segment: {
    position: "absolute",
    justifyContent: "space-evenly",
    left: 0,
    top: 0,
    width: SNAKE_SEGMENT_SIZE,
    height: SNAKE_SEGMENT_SIZE,
    borderRadius: SNAKE_SEGMENT_SIZE / 2,
    backgroundColor: colors.primary,
  },
  eye: {
    backgroundColor: colors.background,
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
});
