import { router, useLocalSearchParams } from "expo-router";

//import components
import { Game } from "@/components";

//import game configs
import { getDifficultyConfig } from "@/features/game/config";

//import types
import { DifficultyLevel } from "@/types/game";

/**
 * Resolves the difficulty route parameter and hosts one playable game session.
 * Completing the session returns the player to the previous screen, with the
 * home route used as a safe fallback for direct links.
 * @returns the configured Snake Arena game screen
 */
const Playground = () => {
  const { difficulty } = useLocalSearchParams<{
    difficulty: DifficultyLevel;
  }>();

  // Leave the completed game without assuming the playground has a back entry.
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
