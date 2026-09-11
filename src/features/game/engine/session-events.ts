//import types
import type { SessionEvents } from "@/types/game";

/**
 * Guards the React thread from delayed UI-thread callbacks. Restarting the game
 * increments the active session ID, and unmounting clears the mounted flag, so
 * events from either older state are safely ignored.
 * @param events the React-side guard for the current game session
 * @param sessionId the session identity carried by the incoming engine event
 * @returns whether the event belongs to the session currently shown to the player
 */
export function acceptsSessionEvent(
  events: SessionEvents,
  sessionId: number,
): boolean {
  return events.mounted && events.sessionId === sessionId;
}

/**
 * Claims the one allowed game-over delivery for an active session. The function
 * mutates `events.delivered` so repeated animated reactions cannot navigate away
 * from the playground more than once.
 * @param events the React-side session guard updated by a successful claim
 * @param sessionId the session identity carried by the completion event
 * @returns true only for the first valid completion from the mounted session
 */
export function claimCompletion(
  events: SessionEvents,
  sessionId: number,
): boolean {
  if (!acceptsSessionEvent(events, sessionId) || events.delivered) return false;

  events.delivered = true;

  return true;
}
