import { Fragment, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

//import constants
import { colors } from "@/constants";

//import types
import { Coordinate, Direction, type GestureEventType } from "@/types/game";

//import game config
import {
  getIntialFoodPosition,
  getIntialSnakePosition,
  SCORE_INCREMENT,
  TICK_MS,
} from "@/features/game/config";

//import components
import Food from "./food";
import Header from "./header";
import Snake from "./snake";

//import hooks
import { useGameBoard } from "@/hooks";

//import utility functions
import { checkEatsFood, checkGameOver, getRandomFoodPosition } from "@/utils";

const Game = () => {
  //hooks
  const board = useGameBoard();

  //states
  const [direction, setDirection] = useState<Direction>(Direction.Right);
  const [snake, setSnake] = useState<Coordinate[]>(getIntialSnakePosition);
  const [food, setFood] = useState<Coordinate>(getIntialFoodPosition);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  //function to move the snake in the current direction
  const moveSnake = (): void => {
    const snakeHead = snake[0];
    const newHead = { ...snakeHead };

    if (checkGameOver(snakeHead, board.bounds)) {
      setIsGameOver(true);
      return;
    }

    switch (direction) {
      case Direction.Up:
        newHead.y -= 1;
        break;
      case Direction.Down:
        newHead.y += 1;
        break;
      case Direction.Left:
        newHead.x -= 1;
        break;
      case Direction.Right:
        newHead.x += 1;
        break;
      default:
        break;
    }

    //if eats food, grow the snake
    if (checkEatsFood(newHead, food, 2)) {
      setFood(getRandomFoodPosition(board.bounds.xMax, board.bounds.yMax));
      setSnake((prev) => [newHead, ...prev]);
      setScore((prevScore) => prevScore + SCORE_INCREMENT);
      return;
    }

    setSnake((prev) => [newHead, ...prev.slice(0, -1)]);
  };

  //function to handle the gesture update event
  const handleGesture = (event: GestureEventType): void => {
    const { translationX, translationY } = event;
    const xAxis = Math.abs(translationX) > Math.abs(translationY);

    if (xAxis) {
      if (translationX > 0) {
        //move right
        setDirection((currDir) =>
          currDir !== Direction.Left ? Direction.Right : currDir,
        );
      } else {
        //move left
        setDirection((currDir) =>
          currDir !== Direction.Right ? Direction.Left : currDir,
        );
      }
    } else {
      if (translationY > 0) {
        //move down
        setDirection((currDir) =>
          currDir !== Direction.Up ? Direction.Down : currDir,
        );
      } else {
        //move up
        setDirection((currDir) =>
          currDir !== Direction.Down ? Direction.Up : currDir,
        );
      }
    }
  };

  //function to play/pause the game
  const playOrPauseGame = (): void => {
    setIsPaused((prev) => !prev);
  };

  //function to restart the game
  const restartGame = (): void => {
    setSnake(getIntialSnakePosition());
    setFood(getIntialFoodPosition());
    setScore(0);
    setDirection(Direction.Right);
    setIsGameOver(false);
    setIsPaused(false);
  };

  const pan = Gesture.Pan().runOnJS(true).onEnd(handleGesture);

  useEffect(() => {
    if (!board.ready || isGameOver || isPaused) return;

    const intervalId = setInterval(() => {
      moveSnake();
    }, TICK_MS);
    return () => clearInterval(intervalId);
  }, [snake, isGameOver, board.ready, isPaused]);

  return (
    <GestureDetector gesture={pan}>
      <SafeAreaView style={styles.container}>
        <Header
          isPaused={isPaused}
          pauseGame={playOrPauseGame}
          reloadGame={restartGame}
          score={score}
        />
        <View style={styles.boundaries} onLayout={board.onLayout}>
          {board.ready && (
            <Fragment>
              <Snake snake={snake} />
              <Food x={food.x} y={food.y} />
            </Fragment>
          )}
        </View>
      </SafeAreaView>
    </GestureDetector>
  );
};

export default Game;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  boundaries: {
    flex: 1,
    backgroundColor: colors.background,
    marginHorizontal: 15,
    marginTop: 5,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  food: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
