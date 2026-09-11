/**
 * Calculates the first step in Snake Arena's progressively smaller speed-up
 * sequence. Decreasing the decrement by one after each food pickup lets the
 * engine approach the minimum tick duration smoothly instead of overshooting it.
 * @param startTickMs the starting movement duration in milliseconds
 * @param minTickMs the fastest allowed movement duration in milliseconds
 * @returns the initial whole-millisecond decrement for the speed-up sequence
 */
export const getTickMsDecrement = (
  startTickMs: number,
  minTickMs: number,
): number => {
  const startTickMsDecrement = Math.ceil(
    (Math.sqrt(1 + 8 * (startTickMs - minTickMs)) - 1) / 2,
  );

  return startTickMsDecrement;
};
