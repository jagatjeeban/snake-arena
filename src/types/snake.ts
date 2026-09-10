//import types
import type { SharedValue } from "react-native-reanimated";
import type { MovementSnapshot } from "./game";

export type SnakeProps = {
  capacity: number;
  snapshot: SharedValue<MovementSnapshot>;
};
