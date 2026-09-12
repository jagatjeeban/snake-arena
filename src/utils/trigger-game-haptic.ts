//import haptics
import { Presets } from "react-native-pulsar";

//import types
import type { GameHaptic } from "@/types/game";

/**
 * Plays one native preset for a gameplay event, including calls from the UI
 * runtime. Callers must suppress inactive sessions and duplicate events.
 * @param type the gameplay event whose haptic pattern should be triggered
 */
export const triggerGameHaptic = (type: GameHaptic): void => {
  "worklet";

  switch (type) {
    case "eat-food":
      Presets.pip();
      break;

    case "eat-special-food":
      Presets.coinDrop();
      break;

    case "wall-collision":
      Presets.System.impactRigid();
      break;

    case "self-collision":
      Presets.aftershock();
      break;

    case "level-up":
      Presets.ascent();
      break;

    case "game-over":
      Presets.lament();
      break;

    case "high-score":
      Presets.fanfare();
      break;

    case "full-board":
      Presets.triumph();
      break;
  }
};
