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
import { DifficultyLevel } from "@/types/game";
import { router } from "expo-router";

export default function Index() {
  //hooks
  const { width, height } = useResponsive();

  const snakeAnimationStyle: ViewStyle = useMemo(() => {
    return {
      width: width,
      height: height / 2.5,
    };
  }, [width, height]);

  //function to navigate to the game
  const navigateToGame = (difficulty: DifficultyLevel): void => {
    router.push({
      pathname: "/playground",
      params: { difficulty },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LottieView
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
    // alignItems: "center",
    // justifyContent: "center",
    backgroundColor: colors.background,
  },
});
