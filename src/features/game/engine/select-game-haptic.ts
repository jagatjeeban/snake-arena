//import types
import type { GameHaptic, GameHapticSnapshot } from "@/types/game";

/**
 * Selects one feedback event from committed gameplay changes without invoking
 * native APIs. Terminal outcomes take priority over a simultaneous food pickup.
 * @param current the latest session, committed score, terminal reason, phase, and activity
 * @param previous the last observation, including suppressed changes; null establishes a silent baseline
 * @returns the event to play, or null for inactive, repeated, or replacement-session observations
 */
export function selectGameHaptic(
  current: GameHapticSnapshot | null,
  previous: GameHapticSnapshot | null,
): GameHaptic | null {
  "worklet";

  if (
    !current ||
    !previous ||
    current.sessionId !== previous.sessionId ||
    !current.active ||
    current.phase === "paused"
  )
    return null;

  if (previous.terminalReason === null && current.terminalReason !== null) {
    switch (current.terminalReason) {
      case "boundary":
        return "wall-collision";
      case "self-collision":
        return "self-collision";
      case "full-board":
        return "full-board";
    }
  }

  if (current.terminalReason !== null) return null;

  return current.score > previous.score ? "eat-food" : null;
}
