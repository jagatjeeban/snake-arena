import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

//import constants
import { colors } from "@/constants";

//import types
import { Coordinate, Direction, type GestureEventType } from "@/types/game";

//import game configs
import {
  getIntialFoodPosition,
  getIntialSnakePosition,
  MAX_BUFFERED_DIRECTIONS,
  SCORE_INCREMENT,
  SWIPE_MIN_DISTANCE,
  TICK_MS,
} from "@/features/game/config";

//import components
import Food from "./food";
import Header from "./header";
import Snake from "./snake";

//import hooks
import { useGameBoard } from "@/hooks";

//import utility functions
import {
  checkEatsFood,
  checkGameOver,
  checkOppositeDirection,
  getRandomFoodPosition,
  getSnakeNextHeadPosition,
} from "@/utils";

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
  const [tickMs, setTickMs] = useState<number>(TICK_MS);

  //refs
  const directionRef = useRef<Direction>(Direction.Right);
  const directionQueueRef = useRef<Direction[]>([]);

  //function to queue the directions to execute them in next ticks
  const queueDirection = (nextDirection: Direction): void => {
    const queue = directionQueueRef.current;

    const lastQueuedDirection =
      queue.length > 0 ? queue[queue.length - 1] : directionRef.current;

    if (
      nextDirection === lastQueuedDirection ||
      checkOppositeDirection(lastQueuedDirection, nextDirection)
    ) {
      return;
    }

    if (queue.length >= MAX_BUFFERED_DIRECTIONS) {
      return;
    }

    queue.push(nextDirection);
  };

  //function to move the snake in the requested/queued direction
  const moveSnake = useCallback((): void => {
    const queuedDirection = directionQueueRef.current.shift();

    const nextDirection = queuedDirection ?? directionRef.current;

    directionRef.current = nextDirection;
    setDirection((current) =>
      current === nextDirection ? current : nextDirection,
    );

    const newHead = getSnakeNextHeadPosition({ ...snake[0] }, nextDirection);

    if (checkGameOver(snake, board.bounds)) {
      setIsGameOver(true);
      return;
    }

    //if eats food, grow the snake, generate new food position, increment score and increase speed of the snake
    const snakeAteFood = checkEatsFood(newHead, food, 2);
    if (snakeAteFood) {
      setFood(getRandomFoodPosition(board.bounds.xMax, board.bounds.yMax));
      setSnake((prev) => [newHead, ...prev]);
      setScore((prevScore) => prevScore + SCORE_INCREMENT);
      setTickMs((prev) => Math.max(0, prev - 10));
      return;
    }

    setSnake((prev) => [newHead, ...prev.slice(0, -1)]);
  }, [snake, food, direction, board.bounds]);

  //function to handle the gesture update event
  const handleGesture = (event: GestureEventType): void => {
    const { translationX, translationY } = event;

    const nextDirection =
      Math.abs(translationX) > Math.abs(translationY)
        ? translationX > 0
          ? Direction.Right
          : Direction.Left
        : translationY > 0
          ? Direction.Down
          : Direction.Up;

    queueDirection(nextDirection);
  };

  //function to play/pause the game
  const playOrPauseGame = (): void => {
    setIsPaused((prev) => !prev);
  };

  //function to restart the game
  const restartGame = (): void => {
    directionRef.current = Direction.Right;
    directionQueueRef.current = [];

    setSnake(getIntialSnakePosition());
    setFood(getIntialFoodPosition());
    setDirection(Direction.Right);
    setScore(0);
    setTickMs(TICK_MS);
    setIsGameOver(false);
    setIsPaused(false);
  };

  const pan = Gesture.Pan()
    .minDistance(SWIPE_MIN_DISTANCE)
    .runOnJS(true)
    .onEnd(handleGesture);

  useEffect(() => {
    if (!board.ready || isGameOver || isPaused) return;

    const intervalId = setInterval(moveSnake, tickMs);
    return () => clearInterval(intervalId);
  }, [snake, isGameOver, board.ready, isPaused, moveSnake]);

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
              <Snake snake={snake} direction={direction} />
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
    overflow: "hidden",
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
