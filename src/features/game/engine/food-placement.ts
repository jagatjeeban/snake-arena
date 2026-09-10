//import types
import type { Boundary, Coordinate } from "@/types/game";

/**
 * One seeded draw and one bounded board scan, even when the board is full.
 * @param bounds the inclusive board limits
 * @param snake the occupied snake cells
 * @param seed the current pseudorandom generator seed
 * @returns the selected food coordinate, or null for a full board, and the next seed
 */
export function selectFreeCell(
  bounds: Boundary,
  snake: Coordinate[],
  seed: number,
) {
  "worklet";
  const nextSeed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const width = bounds.xMax - bounds.xMin + 1;
  const capacity = width * (bounds.yMax - bounds.yMin + 1);
  const occupied: Record<number, boolean> = {};
  for (const cell of snake) {
    occupied[(cell.y - bounds.yMin) * width + cell.x - bounds.xMin] = true;
  }
  let freeCount = 0;
  for (let i = 0; i < capacity; i++) if (!occupied[i]) freeCount++;
  let target = Math.floor((nextSeed / 4294967296) * freeCount);
  for (let i = 0; i < capacity; i++) {
    if (!occupied[i] && target-- === 0) {
      return {
        food: {
          x: bounds.xMin + (i % width),
          y: bounds.yMin + Math.floor(i / width),
        } as Coordinate | null,
        seed: nextSeed,
      };
    }
  }
  return { food: null as Coordinate | null, seed: nextSeed };
}
