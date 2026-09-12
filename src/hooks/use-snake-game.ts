//import React
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

//import React Native
import { AppState, Platform } from "react-native";

//import Expo
import { useFocusEffect } from "expo-router";

//import animation and gestures
import { Gesture } from "react-native-gesture-handler";
import {
  useAnimatedReaction,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";
import { scheduleOnRN, scheduleOnUI } from "react-native-worklets";

//import game configuration
import {
  getInitialFoodPosition,
  getInitialSnakePosition,
  INITIAL_LAYOUT_SETTLE_MS,
  SWIPE_MIN_DISTANCE,
} from "@/features/game/config";

//import hooks
import type { useGameBoard } from "./use-game-board";

//import engine helpers
import { movementSnapshot } from "@/features/game/engine/movement-snapshot";
import { selectGameHaptic } from "@/features/game/engine/select-game-haptic";
import {
  acceptsSessionEvent,
  claimCompletion,
} from "@/features/game/engine/session-events";
import {
  acknowledgeRenderer,
  advanceFrame,
  createEngine,
  pauseEngine,
  queueDirection,
  resumeEngine,
} from "@/features/game/engine/snake-engine";

//import utilities
import { triggerGameHaptic } from "@/utils";

//import types
import type {
  EngineEvent,
  EngineState,
  GameHapticSnapshot,
  GameProps,
  SessionEvents,
} from "@/types/game";
import { Direction } from "@/types/game";

/**
 * Owns the boundary between React lifecycle and the UI-thread game engine. It
 * starts sessions after layout settles, keeps frame movement off the JS thread,
 * coordinates preallocated segment views, converts swipes into queued turns,
 * and pauses safely when the route or app loses focus.
 * @param board the measured, whole-cell board geometry from `useGameBoard`
 * @param props the selected game rules and route-level completion behavior
 * @param props.difficulty the movement timing and scoring configuration
 * @param props.onGameOver the callback delivered once when the active session completes
 * @returns the renderer snapshot and capacity, pan gesture, session controls,
 * pause state, and React-side score used for accessibility
 */
export function useSnakeGame(
  board: ReturnType<typeof useGameBoard>,
  { difficulty, onGameOver }: GameProps,
) {
  //shared values
  const runtime = useSharedValue<EngineState | null>(null);
  const interactionEnabled = useSharedValue(true);
  const snapshot = useDerivedValue(() => movementSnapshot(runtime.get()));

  //refs
  const events = useRef<SessionEvents>({
    sessionId: 0,
    mounted: false,
    delivered: false,
  });
  const foreground = useRef(AppState.currentState === "active");
  const focused = useRef(true);
  const initializedGrid = useRef<string | null>(null);
  const initialLayoutSettled = useRef(false);
  const initialLayoutStartedAt = useRef<number | null>(null);
  const callback = useRef(onGameOver);

  //states
  const [renderer, setRenderer] = useState({ sessionId: 0, capacity: 0 });
  const [status, setStatus] = useState({ isPaused: false, score: 0 });

  // Keep the completion callback current without restarting the session.
  useLayoutEffect(() => {
    callback.current = onGameOver;
  }, [onGameOver]);

  // Advance active movement and terminal holds on the UI thread.
  const frameCallback = useFrameCallback((frame) => {
    const state = runtime.get();

    if (
      !state ||
      (state.phase !== "moving" && state.phase !== "terminal") ||
      state.completionReady
    )
      return;

    runtime.set(advanceFrame(state, frame.timestamp));
  }, false);

  // Apply session events to React and deliver completion at most once.
  const receiveEvent = useCallback(
    (event: EngineEvent) => {
      if (!acceptsSessionEvent(events.current, event.sessionId)) return;

      frameCallback.setActive(
        foreground.current &&
          focused.current &&
          (event.phase === "moving" || event.phase === "terminal") &&
          !event.complete,
      );

      setStatus((current) =>
        current.isPaused === (event.phase === "paused") &&
        current.score === event.score
          ? current
          : { isPaused: event.phase === "paused", score: event.score },
      );

      setRenderer((current) =>
        current.sessionId === event.sessionId &&
        current.capacity >= event.capacity
          ? current
          : { sessionId: event.sessionId, capacity: event.capacity },
      );

      if (
        event.complete &&
        foreground.current &&
        focused.current &&
        claimCompletion(events.current, event.sessionId)
      ) {
        callback.current();
      }
    },
    [frameCallback],
  );

  // Bridge only changes in session status, score, capacity, or completion.
  useAnimatedReaction(
    (): EngineEvent | null => {
      const state = runtime.get();

      return state
        ? {
            sessionId: state.sessionId,
            phase: state.phase,
            score: state.committed.score,
            capacity: state.requestedCapacity,
            complete: state.completionReady,
          }
        : null;
    },
    (current, previous) => {
      if (
        current &&
        (!previous ||
          current.sessionId !== previous.sessionId ||
          current.phase !== previous.phase ||
          current.score !== previous.score ||
          current.capacity !== previous.capacity ||
          current.complete !== previous.complete)
      ) {
        scheduleOnRN(receiveEvent, current);
      }
    },
  );

  // Observe committed outcomes on the UI thread, consuming even suppressed events.
  useAnimatedReaction(
    (): GameHapticSnapshot | null => {
      const state = runtime.get();

      return state
        ? {
            sessionId: state.sessionId,
            score: state.committed.score,
            terminalReason: state.terminalReason,
            phase: state.phase,
            active: interactionEnabled.get(),
          }
        : null;
    },
    (current, previous) => {
      const haptic = selectGameHaptic(current, previous);

      if (haptic) triggerGameHaptic(haptic);
    },
  );

  // Invalidate callbacks and clear this session when the hook unmounts.
  useEffect(() => {
    const sessionEvents = events.current;
    sessionEvents.mounted = true;

    return () => {
      frameCallback.setActive(false);
      sessionEvents.mounted = false;

      const sessionId = sessionEvents.sessionId;

      scheduleOnUI(() => {
        interactionEnabled.set(false);
        if (runtime.get()?.sessionId === sessionId) runtime.set(null);
      });
    };
  }, [frameCallback, interactionEnabled, runtime]);

  // Start a fresh seeded session using the current measured board.
  const startSession = useCallback(
    (paused: boolean) => {
      if (!board.ready) return;

      frameCallback.setActive(false);

      const sessionId = ++events.current.sessionId;
      events.current.delivered = false;

      const options = {
        bounds: board.bounds,
        difficulty,
        sessionId,
        seed: Date.now() >>> 0,
        snake: getInitialSnakePosition(),
        food: getInitialFoodPosition(),
        paused: paused || !foreground.current || !focused.current,
      };

      scheduleOnUI(() => {
        runtime.set(createEngine(options));
      });
    },
    [board.ready, board.bounds, difficulty, frameCallback, runtime],
  );

  // Wait for initial layout and pause replacement sessions after grid changes.
  useEffect(() => {
    if (!board.ready) {
      // A temporarily unmeasurable board must not keep running off screen.
      if (initializedGrid.current !== null) {
        frameCallback.setActive(false);

        scheduleOnUI(() => {
          const state = runtime.get();

          if (state) runtime.set(pauseEngine(state));
        });
      }

      if (!initialLayoutSettled.current) {
        initializedGrid.current = null;
        initialLayoutStartedAt.current = null;
      }

      return;
    }

    const grid = `${board.columns}x${board.rows}`;
    if (initializedGrid.current === grid) return;

    initializedGrid.current = grid;

    if (!initialLayoutSettled.current) {
      const now = Date.now();
      initialLayoutStartedAt.current ??= now;
      const remaining = Math.max(
        0,
        INITIAL_LAYOUT_SETTLE_MS - (now - initialLayoutStartedAt.current),
      );
      const timer = setTimeout(() => {
        initialLayoutSettled.current = true;
        startSession(false);
      }, remaining);

      return () => clearTimeout(timer);
    }

    scheduleOnUI(() => {
      const state = runtime.get();

      if (state) runtime.set(pauseEngine(state));
    });

    startSession(true);
  }, [
    board.ready,
    board.columns,
    board.rows,
    frameCallback,
    startSession,
    runtime,
  ]);

  // React has committed the slot views before this acknowledgement reaches the UI runtime.
  useEffect(() => {
    const { sessionId, capacity } = renderer;

    scheduleOnUI(() => {
      const state = runtime.get();

      if (state) runtime.set(acknowledgeRenderer(state, sessionId, capacity));
    });
  }, [renderer, runtime]);

  // Disable input and pause gameplay whenever the app or route is inactive.
  const updateActivity = useCallback(() => {
    const enabled = foreground.current && focused.current;

    if (!enabled) frameCallback.setActive(false);

    scheduleOnUI(() => {
      interactionEnabled.set(enabled);

      const state = runtime.get();

      if (!enabled && state) runtime.set(pauseEngine(state));
    });
  }, [frameCallback, interactionEnabled, runtime]);

  // Track foreground activity and Android notification-shade focus.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      foreground.current = state === "active";
      updateActivity();
    });

    // Android may blur (notification shade) without changing AppState.
    const blur =
      Platform.OS === "android"
        ? AppState.addEventListener("blur", () => {
            foreground.current = false;
            updateActivity();
          })
        : null;

    const focus =
      Platform.OS === "android"
        ? AppState.addEventListener("focus", () => {
            foreground.current = AppState.currentState === "active";
            updateActivity();
          })
        : null;

    updateActivity();

    return () => {
      subscription.remove();
      blur?.remove();
      focus?.remove();
    };
  }, [updateActivity]);

  // Synchronize route focus with gameplay activity.
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      updateActivity();

      return () => {
        focused.current = false;
        updateActivity();
      };
    }, [updateActivity]),
  );

  // Toggle pause on the UI thread while interaction is enabled.
  const togglePause = () => {
    "worklet";

    const state = runtime.get();

    if (state && interactionEnabled.get())
      runtime.set(
        state.phase === "paused" ? resumeEngine(state) : pauseEngine(state),
      );
  };

  //gestures
  // Queue a direction from the dominant axis of the completed swipe.
  const pan = Gesture.Pan()
    .minDistance(SWIPE_MIN_DISTANCE)
    .onEnd((event) => {
      const state = runtime.get();

      if (!state || !interactionEnabled.get()) return;

      const direction =
        Math.abs(event.translationX) > Math.abs(event.translationY)
          ? event.translationX > 0
            ? Direction.Right
            : Direction.Left
          : event.translationY > 0
            ? Direction.Down
            : Direction.Up;

      runtime.set(queueDirection(state, direction));
    });

  //public game controls and presentation state
  return {
    snapshot,
    pan,
    togglePause,
    // Start an unpaused replacement session when activity allows it.
    restart: () => startSession(false),
    capacity: renderer.capacity,
    isPaused: status.isPaused,
    accessibleScore: status.score,
  };
}
