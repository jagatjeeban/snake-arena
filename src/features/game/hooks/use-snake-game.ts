import { useFocusEffect } from "expo-router";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AppState, Platform } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  useAnimatedReaction,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";
import { scheduleOnRN, scheduleOnUI } from "react-native-worklets";

//import hooks
import type { useGameBoard } from "@/hooks/use-game-board";

//import types
import {
  Direction,
  EngineEvent,
  EngineState,
  GameProps,
  SessionEvents,
} from "@/types/game";

//import game configs
import {
  getInitialFoodPosition,
  getInitialSnakePosition,
  SWIPE_MIN_DISTANCE,
} from "../config";

//import session events
import { acceptsSessionEvent, claimCompletion } from "../engine/session-events";

//import engine functions
import {
  acknowledgeRenderer,
  advanceFrame,
  createEngine,
  movementSnapshot,
  pauseEngine,
  queueDirection,
  resumeEngine,
} from "../engine/snake-engine";

// Native stack transitions can report an interim safe-area height before the
// destination screen settles. Start once from the latest measured grid.
const INITIAL_LAYOUT_SETTLE_MS = 1_000;

export function useSnakeGame(
  board: ReturnType<typeof useGameBoard>,
  { difficulty, onGameOver }: GameProps,
) {
  const runtime = useSharedValue<EngineState | null>(null);
  const interactionEnabled = useSharedValue(true);
  const snapshot = useDerivedValue(() => movementSnapshot(runtime.get()));
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
  const [renderer, setRenderer] = useState({ sessionId: 0, capacity: 0 });
  const [status, setStatus] = useState({ isPaused: false, score: 0 });
  useLayoutEffect(() => {
    callback.current = onGameOver;
  }, [onGameOver]);

  const receiveEvent = useCallback((event: EngineEvent) => {
    if (!acceptsSessionEvent(events.current, event.sessionId)) return;
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
  }, []);

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

  useFrameCallback((frame) => {
    const state = runtime.get();
    if (
      !state ||
      (state.phase !== "moving" && state.phase !== "terminal") ||
      state.completionReady
    )
      return;
    runtime.set(advanceFrame(state, frame.timestamp));
  });

  useEffect(() => {
    const sessionEvents = events.current;
    sessionEvents.mounted = true;
    return () => {
      sessionEvents.mounted = false;
      const sessionId = sessionEvents.sessionId;
      scheduleOnUI(() => {
        if (runtime.get()?.sessionId === sessionId) runtime.set(null);
      });
    };
  }, [runtime]);

  const startSession = useCallback(
    (paused: boolean) => {
      if (!board.ready) return;
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
    [board.ready, board.bounds, difficulty, runtime],
  );

  useEffect(() => {
    if (!board.ready) {
      // A temporarily unmeasurable board must not keep running off screen.
      if (initializedGrid.current !== null) {
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
  }, [board.ready, board.columns, board.rows, startSession, runtime]);

  // React has committed the slot views before this acknowledgement reaches the UI runtime.
  useEffect(() => {
    const { sessionId, capacity } = renderer;
    scheduleOnUI(() => {
      const state = runtime.get();
      if (state) runtime.set(acknowledgeRenderer(state, sessionId, capacity));
    });
  }, [renderer, runtime]);

  const updateActivity = useCallback(() => {
    const enabled = foreground.current && focused.current;
    scheduleOnUI(() => {
      interactionEnabled.set(enabled);
      const state = runtime.get();
      if (!enabled && state) runtime.set(pauseEngine(state));
    });
  }, [interactionEnabled, runtime]);

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

  const togglePause = () => {
    "worklet";
    const state = runtime.get();
    if (state && interactionEnabled.get())
      runtime.set(
        state.phase === "paused" ? resumeEngine(state) : pauseEngine(state),
      );
  };

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

  return {
    snapshot,
    pan,
    togglePause,
    restart: () => startSession(false),
    capacity: renderer.capacity,
    isPaused: status.isPaused,
    accessibleScore: status.score,
  };
}
