import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { useMemo } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//import constants
import { colors, fontWeight, strings } from "@/constants";

//import hooks
import { useResponsive } from "@/hooks";

//import components
import { SelectDifficulty, TextComponent } from "@/components";

//import types
import { DifficultyLevel } from "@/types/game";

/**
 * Renders Snake Arena's landing screen and starts a game with the difficulty
 * selected by the player.
 * @returns the welcome animation and difficulty-selection controls
 */
export default function Index() {
  //hooks
  const { width, height } = useResponsive();

  const snakeAnimationStyle: ViewStyle = useMemo(() => {
    return {
      width: width,
      height: height / 2.5,
    };
  }, [width, height]);

  // Open a new playground route with the selected difficulty in its route params.
  const navigateToGame = (difficulty: DifficultyLevel): void => {
    router.push({
      pathname: "/playground",
      params: { difficulty },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LottieView
        // Metro resolves the bundled Lottie asset through require.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        source={require("@/assets/animations/snake.lottie")}
        autoPlay
        loop
        speed={0.75}
        style={snakeAnimationStyle}
      />
      <TextComponent
        text={strings.welcomeToSnakeArena}
        color={colors.primary}
        textAlign={"center"}
        fontWeight={fontWeight[800]}
        styleProfile={"largest3"}
      />
      <SelectDifficulty onSelect={navigateToGame} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
