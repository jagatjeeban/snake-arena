import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";

//import components
import { Game } from "@/components";

//import game configs
import { getDifficultyConfig } from "@/features/game/config";

//import types
import { DifficultyLevel } from "@/types/game";

const Playground = () => {
  const { difficulty } = useLocalSearchParams<{
    difficulty: DifficultyLevel;
  }>();

  //function to navigate back to the home screen
  const navigateBackToHome = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <Game
      difficulty={getDifficultyConfig(difficulty)}
      onGameOver={navigateBackToHome}
    />
  );
};

export default Playground;

const styles = StyleSheet.create({});
