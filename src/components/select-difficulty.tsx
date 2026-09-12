import { PressableScale } from "pressto";
import { StyleSheet, View } from "react-native";

//import components
import TextComponent from "./text-component";

//import constants
import { colors, fontWeight, strings } from "@/constants";

//import types
import { DifficultyLevel } from "@/types/game";
import { SelectDifficultyProps } from "@/types/select-difficulty";

const difficultyLevels: [DifficultyLevel, DifficultyLevel, DifficultyLevel] = [
  "easy",
  "normal",
  "hard",
];

/**
 * Presents the supported speed presets on the home screen and reports the
 * player's selection to the route-level navigation handler.
 * @param props the difficulty-selection behavior
 * @param props.onSelect receives the selected Snake Arena difficulty level
 * @returns the difficulty heading and animated preset buttons
 */
const SelectDifficulty = ({ onSelect }: SelectDifficultyProps) => {
  return (
    <View style={styles.container}>
      <TextComponent
        text={strings.selectDifficultyLevel}
        color={colors.accent}
        styleProfile={"large4"}
        fontWeight={fontWeight[500]}
      />
      <View style={styles.btnContainer}>
        {difficultyLevels.map((level: DifficultyLevel, index: number) => (
          <PressableScale
            key={index}
            onPress={() => onSelect(level)}
            style={styles.difficultyBtn}
          >
            <TextComponent
              text={strings[level]}
              color={colors.background}
              fontWeight={fontWeight[500]}
              styleProfile={"large2"}
            />
          </PressableScale>
        ))}
      </View>
    </View>
  );
};

export default SelectDifficulty;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 50,
  },
  difficultyBtn: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    padding: 15,
    minWidth: "65%",
  },
  btnContainer: { alignSelf: "center", marginTop: 20, gap: 10 },
});
