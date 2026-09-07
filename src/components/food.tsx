import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { CELL_SIZE, FOOD_SIZE } from "@/features/game/config";
import type { MovementSnapshot } from "@/features/game/engine/snake-engine";

const Food = ({ snapshot }: { snapshot: SharedValue<MovementSnapshot> }) => {
  const style = useAnimatedStyle(() => {
    const food = snapshot.get().food;
    return {
      opacity: food ? 1 : 0,
      transform: [
        { translateX: (food?.x ?? 0) * CELL_SIZE },
        { translateY: (food?.y ?? 0) * CELL_SIZE },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      testID="game-food"
      style={[styles.food, style]}
    >
      <Text allowFontScaling={false} style={styles.apple}>
        🍎
      </Text>
    </Animated.View>
  );
};

export default Food;

const styles = StyleSheet.create({
  food: {
    position: "absolute",
    left: 0,
    top: 0,
    width: FOOD_SIZE,
    height: FOOD_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  apple: { fontSize: 12, lineHeight: FOOD_SIZE, includeFontPadding: false },
});
