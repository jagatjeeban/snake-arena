import { Fragment, useEffect, useEffectEvent, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

//import constants
import { colors } from "@/constants";

//import types
import {
  Coordinate,
  Direction,
  GameProps,
  type GestureEventType,
} from "@/types/game";

//import game configs
import {
  FOOD_AREA,
  getInitialFoodPosition,
  getInitialSnakePosition,
  MAX_BUFFERED_DIRECTIONS,
  SWIPE_MIN_DISTANCE,
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

const Game = ({ difficulty, onGameOver }: GameProps) => {
  //hooks
  const board = useGameBoard();

  //states
  const [direction, setDirection] = useState<Direction>(Direction.Right);
  const [snake, setSnake] = useState<Coordinate[]>(getInitialSnakePosition);
  const [food, setFood] = useState<Coordinate>(getInitialFoodPosition);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [tickMs, setTickMs] = useState<number>(difficulty.initialTickMs);

  //refs
  const directionRef = useRef<Direction>(Direction.Right);
  const directionQueueRef = useRef<Direction[]>([]);
  const tickMsDecrementRef = useRef<number>(difficulty.initialTickMsDecrement);

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
  const moveSnake = useEffectEvent((): void => {
    const queuedDirection = directionQueueRef.current.shift();
    const nextDirection = queuedDirection ?? directionRef.current;

    directionRef.current = nextDirection;
    setDirection((current) =>
      current === nextDirection ? current : nextDirection,
    );

    const currentHead = snake[0];
    const newHead = getSnakeNextHeadPosition({ ...currentHead }, nextDirection);
    const snakeAteFood = checkEatsFood(currentHead, food, FOOD_AREA);
    const newSnake = snakeAteFood
      ? [newHead, ...snake]
      : [newHead, ...snake.slice(0, -1)];

    if (checkGameOver(snake, board.bounds)) {
      setIsGameOver(true);
      onGameOver();
      return;
    }

    //if eats food, grow the snake, generate new food position, increment score and increase speed of the snake
    if (snakeAteFood) {
      const decrement = tickMsDecrementRef.current;
      const newFoodPosition = getRandomFoodPosition(
        board.bounds.xMax,
        board.bounds.yMax,
        newSnake,
      );

      setFood(newFoodPosition);
      setSnake(newSnake);
      setScore((prevScore) => prevScore + difficulty.scoreIncrement);
      if (tickMs > difficulty.minimumTickMs) {
        setTickMs((prev) =>
          Math.max(difficulty.minimumTickMs, prev - decrement),
        );
        tickMsDecrementRef.current = Math.max(0, decrement - 1);
      }
      return;
    }

    setSnake(newSnake);
  });

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
    tickMsDecrementRef.current = difficulty.initialTickMsDecrement;

    setSnake(getInitialSnakePosition());
    setFood(getInitialFoodPosition());
    setDirection(Direction.Right);
    setScore(0);
    setTickMs(difficulty.initialTickMs);
    setIsGameOver(false);
    setIsPaused(false);
  };

  const pan = Gesture.Pan()
    .minDistance(SWIPE_MIN_DISTANCE)
    .runOnJS(true)
    .onEnd(handleGesture);

  useEffect(() => {
    if (!board.ready || isGameOver || isPaused) return;

    const intervalId = setInterval(() => {
      moveSnake();
    }, tickMs);
    return () => clearInterval(intervalId);
  }, [isGameOver, board.ready, isPaused, tickMs]);

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
              <Snake snake={snake} tickMs={tickMs} direction={direction} />
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
