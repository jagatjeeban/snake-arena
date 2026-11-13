//import packages
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnUI } from "react-native-worklets";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons/static";

//import constants
import { colors, fontSize, fontWeight } from "@/constants";

//import components
import TextComponent from "./text-component";

//import hooks
import { useResponsive } from "@/hooks";

//import types
import type { HeaderProps } from "@/types/components";

//constants
const SCORE_PULSE_SCALE = 1.2;
const SCORE_PULSE_DURATION_MS = 300;
const SCORE_PULSE_EASING = Easing.bezier(0.23, 1, 0.32, 1);

const AnimatedScore = Animated.createAnimatedComponent(TextInput);

/**
 * Renders restart, score, and pause controls for the active game session. The
 * visible score reads from the UI-thread snapshot for smooth updates, while
 * `accessibleScore` mirrors meaningful changes on React for screen readers.
 * @param props the active session controls and score state
 * @param props.reloadGame starts a new session on the current board
 * @param props.pauseGame toggles the engine between paused and active phases
 * @param props.isPaused determines the pause control's icon and accessible label
 * @param props.snapshot supplies the animated score without per-frame React renders
 * @param props.accessibleScore supplies the score announced by assistive technology
 * @returns the control bar displayed above the game board
 */
const Header = ({
  reloadGame,
  pauseGame,
  isPaused,
  snapshot,
  accessibleScore,
}: HeaderProps) => {
  //hooks
  const { fontSizeToRf } = useResponsive();

  const scoreSize = useSharedValue(1);

  const scoreProps = useAnimatedProps<TextInputProps & { text: string }>(
    () => ({
      text: String(snapshot.get().score),
      defaultValue: String(snapshot.get().score),
    }),
  );
  const animatedScoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreSize.get() }],
  }));

  // React to committed food scores on the UI thread; skip mount and reset on restart.
  useAnimatedReaction(
    () => snapshot.get().score,
    (score, previousScore) => {
      if (previousScore === null || score < previousScore) {
        scoreSize.set(1);
        return;
      }

      if (score > previousScore) {
        scoreSize.set(
          withSequence(
            ReduceMotion.System,
            withTiming(SCORE_PULSE_SCALE, {
              duration: SCORE_PULSE_DURATION_MS / 2,
              easing: SCORE_PULSE_EASING,
            }),
            withTiming(1, {
              duration: SCORE_PULSE_DURATION_MS / 2,
              easing: SCORE_PULSE_EASING,
            }),
          ),
        );
      }
    },
  );

  const pause = Gesture.Tap().onEnd((_event, success) => {
    if (success) pauseGame();
  });

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Restart game"
        hitSlop={8}
        onPress={reloadGame}
      >
        <MaterialDesignIcons
          name="restart"
          size={fontSizeToRf(35)}
          color={colors.primary}
        />
      </Pressable>
      <View style={styles.scoreContainer}>
        <TextComponent
          text={"🍎"}
          styleProfile={"large4"}
          containerStyle={styles.food}
        />
        <AnimatedScore
          testID="game-score"
          accessibilityLabel={`Score: ${accessibleScore}`}
          animatedProps={scoreProps}
          editable={false}
          caretHidden
          pointerEvents="none"
          underlineColorAndroid="transparent"
          style={[
            styles.score,
            animatedScoreStyle,
            { fontSize: fontSizeToRf(fontSize.bigger) },
          ]}
        />
      </View>
      <GestureDetector gesture={pause}>
        <View
          accessible
          accessibilityRole="button"
          accessibilityLabel={isPaused ? "Resume game" : "Pause game"}
          hitSlop={8}
          onAccessibilityTap={() => scheduleOnUI(pauseGame)}
        >
          <MaterialDesignIcons
            name={isPaused? "play-circle-outline": "pause-circle-outline"}
            size={fontSizeToRf(35)}
            color={colors.primary}
          />
        </View>
      </GestureDetector>
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
  score: {
    color: colors.primary,
    fontWeight: fontWeight[700],
    padding: 0,
    minWidth: 48,
    textAlign: "center",
  },
});
