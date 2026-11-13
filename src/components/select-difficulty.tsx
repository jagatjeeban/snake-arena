import { PressableScale } from "pressto";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";

//import components
import TextComponent from "./text-component";

//import constants
import { colors, fontWeight, strings } from "@/constants";

//import types
import { DifficultyLevel } from "@/types/game";
import { SelectDifficultyProps } from "@/types/components";

//import hooks
import { useResponsive } from "@/hooks";

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
const SelectDifficulty = ({ onSelect, onInfoReq }: SelectDifficultyProps) => {

  const {fontSizeToRf} = useResponsive();

  return (
    <View style={styles.mainContainer}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
      }}>
        <TextComponent
          text={strings.selectDifficultyLevel}
          color={colors.accent}
          styleProfile={"large4"}
          fontWeight={fontWeight[500]}
        />
        <Pressable onPress={onInfoReq}>
          <MaterialDesignIcons
            name={"information-slab-circle-outline"}
            size={fontSizeToRf(22)}
            color={colors.primary}
          />
        </Pressable>
      </View>
      <View style={styles.container}>
        {difficultyLevels.map((level: DifficultyLevel, index: number) => (
          <View key={index} style={styles.btnRowContainer}>
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
          </View>
        ))}
      </View>
    </View>
  );
};

export default SelectDifficulty;

const styles = StyleSheet.create({
  mainContainer: {
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
  container: {
    alignSelf: "center",
    marginTop: 20,
    gap: 10
  },
  btnRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent:'space-between'
  }
});
