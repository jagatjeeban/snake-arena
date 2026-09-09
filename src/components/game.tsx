import { StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

//import constants
import { colors } from "@/constants";

//import hooks
import { useGameBoard, useSnakeGame } from "@/hooks";

//import types
import type { GameProps } from "@/types/game";

//import components
import Food from "./food";
import Header from "./header";
import Snake from "./snake";

const Game = (props: GameProps) => {
  //hooks
  const board = useGameBoard();
  const game = useSnakeGame(board, props);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        isPaused={game.isPaused}
        pauseGame={game.togglePause}
        reloadGame={game.restart}
        snapshot={game.snapshot}
        accessibleScore={game.accessibleScore}
      />
      <GestureDetector gesture={game.pan}>
        <View
          testID="game-board"
          style={styles.boundaries}
          onLayout={board.onLayout}
        >
          <Snake capacity={game.capacity} snapshot={game.snapshot} />
          <Food snapshot={game.snapshot} />
        </View>
      </GestureDetector>
    </SafeAreaView>
  );
};

export default Game;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  boundaries: {
    flex: 1,
    backgroundColor: colors.background,
    marginHorizontal: 15,
    marginTop: 5,
    overflow: "hidden",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
});
