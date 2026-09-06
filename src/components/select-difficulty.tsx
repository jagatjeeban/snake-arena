import { PressableScale, PressablesConfig } from "pressto";
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
          <PressablesConfig
            key={index}
            config={{ baseScale: 1, minScale: 1.05 }}
          >
            <PressableScale
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
          </PressablesConfig>
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
