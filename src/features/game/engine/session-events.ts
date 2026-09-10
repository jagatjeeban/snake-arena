//import types
import type { SessionEvents } from "@/types/game";

/**
 * Accept callbacks only for the currently mounted game session.
 * @param events the current session identity and mounted status
 * @param sessionId the identity attached to the incoming event
 * @returns whether the event belongs to the currently mounted session
 */
export function acceptsSessionEvent(
  events: SessionEvents,
  sessionId: number,
): boolean {
  return events.mounted && events.sessionId === sessionId;
}

/**
 * Claim completion once per mounted session, ignoring stale or repeated events.
 * @param events the session guard whose delivered flag is set when completion is claimed
 * @param sessionId the identity attached to the completion event
 * @returns true for the first valid completion claim, or false for stale or repeated claims
 */
export function claimCompletion(
  events: SessionEvents,
  sessionId: number,
): boolean {
  if (!acceptsSessionEvent(events, sessionId) || events.delivered) return false;
  events.delivered = true;
  return true;
}
