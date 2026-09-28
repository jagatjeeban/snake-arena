//import React and native layout
import { memo } from "react";
import { StyleSheet } from "react-native";
import { Canvas, Group, Path } from "@shopify/react-native-skia";
import { useDerivedValue, useReducedMotion } from "react-native-reanimated";

//import constants and rendering helpers
import { colors } from "@/constants";
import { buildSnakeGeometry } from "@/features/game/rendering/snake-geometry";
import { buildSnakePaths } from "@/features/game/rendering/snake-path.native";

//import types
import type { SnakeProps } from "@/types/snake";

/**
 * Draws every native snake layer from the same UI-thread frame. Capacity retains
 * the existing session acknowledgement contract, without mounting segment views.
 * The default snake.tsx remains the renderer selected for web.
 */
const Snake = memo(function Snake({ capacity, snapshot }: SnakeProps) {
  const reducedMotion = useReducedMotion();
  const frame = useDerivedValue(() =>
    buildSnakePaths(
      buildSnakeGeometry(snapshot.get(), capacity, reducedMotion),
    ),
  );
  const body = useDerivedValue(() => frame.get().body);
  const highlight0 = useDerivedValue(() => frame.get().highlights[0]);
  const highlight1 = useDerivedValue(() => frame.get().highlights[1]);
  const highlight2 = useDerivedValue(() => frame.get().highlights[2]);
  const highlight3 = useDerivedValue(() => frame.get().highlights[3]);
  const head = useDerivedValue(() => frame.get().head);
  const headHighlight = useDerivedValue(() => frame.get().headHighlight);
  const eyes = useDerivedValue(() => frame.get().eyes);
  const pupils = useDerivedValue(() => frame.get().pupils);

  return (
    <Canvas
      testID="snake-canvas"
      pointerEvents="none"
      accessible={false}
      style={StyleSheet.absoluteFill}
    >
      <Path path={body} color={colors.primary} />
      <Group clip={body} color={colors.secondary}>
        <Path path={highlight0} opacity={0.12} />
        <Path path={highlight1} opacity={0.24} />
        <Path path={highlight2} opacity={0.36} />
        <Path path={highlight3} opacity={0.48} />
      </Group>
      <Path path={head} color={colors.primary} />
      <Path path={headHighlight} color={colors.secondary} opacity={0.48} />
      <Path path={eyes} color={colors.background} />
      <Path path={pupils} color={colors.primary} />
    </Canvas>
  );
});

export default Snake;
