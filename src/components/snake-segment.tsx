import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

//import constants
import { colors } from "@/constants";

//import game configs
import { CELL_SIZE } from "@/features/game/config";

//import types
import type { SnakeSegmentProps } from "@/types/snake-segment";

const SnakeSegment = ({ segment, tickMs }: SnakeSegmentProps) => {
  //shared values
  const translateX = useSharedValue(segment.x * CELL_SIZE);
  const translateY = useSharedValue(segment.y * CELL_SIZE);

  useEffect(() => {
    const animation = {
      duration: tickMs,
      easing: Easing.linear,
    };

    translateX.set(withTiming(segment.x * CELL_SIZE, animation));
    translateY.set(withTiming(segment.y * CELL_SIZE, animation));
  }, [segment.x, segment.y, tickMs, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.get() },
      { translateY: translateY.get() },
    ],
  }));

  return <Animated.View style={[styles.segment, animatedStyle]} />;
};

export default SnakeSegment;

const styles = StyleSheet.create({
  segment: {
    position: "absolute",
    left: 0,
    top: 0,
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    backgroundColor: colors.primary,
  },
});
