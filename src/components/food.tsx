import { StyleSheet } from "react-native";

//import types
import { Coordinate } from "@/types/game";

//import game config
import { CELL_SIZE, FOOD_SIZE } from "@/features/game/config";

//import components
import TextComponent from "./text-component";

const Food = ({ x, y }: Coordinate) => {
  return (
    <TextComponent
      text={"🍎"}
      styleProfile={"normal4"}
      containerStyle={[
        { left: x * CELL_SIZE, top: y * CELL_SIZE },
        styles.food,
      ]}
    />
  );
};

export default Food;

const styles = StyleSheet.create({
  food: {
    position: "absolute",
    width: FOOD_SIZE,
    height: FOOD_SIZE,
    borderRadius: 10,
  },
});
