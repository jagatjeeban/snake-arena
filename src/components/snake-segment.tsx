import { memo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

//import constants
import { colors } from "@/constants";

//import game configs
import { CELL_SIZE, SNAKE_SEGMENT_SIZE } from "@/features/game/config";

//import engine helpers
import { segmentPosition } from "@/features/game/engine/movement-snapshot";

//import types
import { Direction } from "@/types/game";
import type { SnakeSegmentProps } from "@/types/snake-segment";

/**
 * Rotates the head's eyes toward the engine's current movement direction. It
 * reads the shared snapshot on the UI thread so turns do not wait for React.
 * @param props the head segment's shared movement snapshot
 * @param props.snapshot supplies the current snake direction
 * @returns the animated pair of eyes rendered inside the head segment
 */
function HeadEyes({ snapshot }: Pick<SnakeSegmentProps, "snapshot">) {
  const eyeStyle = useAnimatedStyle(() => {
    const direction = snapshot.get().direction;
    const degrees =
      direction === Direction.Down
        ? 90
        : direction === Direction.Left
          ? 180
          : direction === Direction.Up
            ? -90
            : 0;

    return { transform: [{ rotate: `${degrees}deg` }] };
  });

  return (
    <Animated.View style={[styles.eyes, eyeStyle]}>
      <View style={styles.eye} />
      <View style={styles.eye} />
    </Animated.View>
  );
}

/**
 * Renders one preallocated snake slot and interpolates its grid position from
 * the shared movement snapshot. Unused slots stay mounted but invisible, which
 * lets the snake grow without mounting views during a movement frame.
 * @param props the segment index and shared game snapshot
 * @param props.index identifies the head at zero and body slots thereafter
 * @param props.snapshot supplies movement endpoints and interpolation progress
 * @returns one animated segment, including eyes when it is the head
 */
const SnakeSegment = memo(function SnakeSegment({
  index,
  snapshot,
}: SnakeSegmentProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const position = segmentPosition(snapshot.get(), index);

    return {
      opacity: position ? 1 : 0,
      transform: [
        { translateX: (position?.x ?? 0) * CELL_SIZE },
        { translateY: (position?.y ?? 0) * CELL_SIZE },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      testID={index === 0 ? "snake-head" : undefined}
      style={[styles.segment, animatedStyle]}
    >
      {index === 0 && <HeadEyes snapshot={snapshot} />}
    </Animated.View>
  );
});

export default SnakeSegment;

const styles = StyleSheet.create({
  segment: {
    position: "absolute",
    left: 0,
    top: 0,
    width: SNAKE_SEGMENT_SIZE,
    height: SNAKE_SEGMENT_SIZE,
    borderRadius: SNAKE_SEGMENT_SIZE / 2,
    backgroundColor: colors.primary,
  },
  eyes: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-evenly",
    alignItems: "flex-end",
    paddingRight: 3,
  },
  eye: {
    backgroundColor: colors.background,
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
});
