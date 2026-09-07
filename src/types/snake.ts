import type { SharedValue } from "react-native-reanimated";
import type { MovementSnapshot } from "@/features/game/engine/snake-engine";

export type SnakeProps = {
  capacity: number;
  snapshot: SharedValue<MovementSnapshot>;
};
