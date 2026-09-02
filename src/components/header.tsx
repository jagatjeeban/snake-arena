import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, View } from "react-native";

//import types
import type { HeaderProps } from "@/types/header";

//import constants
import { colors, fontWeight } from "@/constants";

//import components
import TextComponent from "./text-component";

const Header = ({ reloadGame, pauseGame, isPaused, score }: HeaderProps) => {
  return (
    <View style={styles.container}>
      <Pressable onPress={reloadGame}>
        <SymbolView
          name={{
            ios: "restart.circle",
            android: "restart_alt",
          }}
          size={35}
          tintColor={colors.primary}
        />
      </Pressable>
      <View style={styles.scoreContainer}>
        <TextComponent
          text={"🍎"}
          styleProfile={"large4"}
          containerStyle={styles.food}
        />
        <TextComponent
          text={score.toString()}
          color={colors.primary}
          styleProfile={"bigger1"}
          fontWeight={fontWeight[600]}
        />
      </View>
      <Pressable onPress={pauseGame}>
        <SymbolView
          name={{
            ios: isPaused ? "play.circle" : "pause.circle",
            android: isPaused ? "play_circle" : "pause_circle",
          }}
          size={35}
          tintColor={colors.primary}
        />
      </Pressable>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 15,
    marginHorizontal: 15,
    backgroundColor: colors.background,
  },
  food: {
    width: 30,
    height: 30,
    borderRadius: 10,
  },
  scoreContainer: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
  },
});
