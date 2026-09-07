/** RN-side guard: invalidate synchronously, before queued UI callbacks can arrive. */
export type SessionEvents = {
  sessionId: number;
  mounted: boolean;
  delivered: boolean;
};

export function acceptsSessionEvent(events: SessionEvents, sessionId: number) {
  return events.mounted && events.sessionId === sessionId;
}

export function claimCompletion(events: SessionEvents, sessionId: number) {
  if (!acceptsSessionEvent(events, sessionId) || events.delivered) return false;
  events.delivered = true;
  return true;
}
