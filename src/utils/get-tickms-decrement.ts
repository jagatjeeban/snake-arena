/**
 * function to get the starting tick ms decrement value
 * @param startTickMs the starting value of tick ms
 * @param minTickMs the minimum value of tick ms allowed
 * @returns the starting value of tick ms decrement
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
