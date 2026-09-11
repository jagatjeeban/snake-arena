import { useCallback, useMemo, useState } from "react";
import type { LayoutChangeEvent } from "react-native";

//import game config
import { CELL_SIZE, getDefaultBoundary } from "@/features/game/config";

/**
 * Measures the visible board and converts its pixel size into whole Snake Arena
 * cells. Partial edge cells are excluded so the engine never generates a
 * coordinate that the renderer cannot display completely.
 * @returns the layout handler, readiness state, grid dimensions, pixel-aligned
 * board size, and inclusive bounds consumed by the game engine
 */
export const useGameBoard = () => {
  //states
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Store a new board size only when layout dimensions actually change.
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    setSize((current) =>
      current.width === width && current.height === height
        ? current
        : { width, height },
    );
  }, []);

  const columns = Math.floor(size.width / CELL_SIZE);
  const rows = Math.floor(size.height / CELL_SIZE);
  const ready = columns > 0 && rows > 0;

  return {
    onLayout,
    ready,
    cellSize: CELL_SIZE,
    columns,
    rows,
    boardWidth: columns * CELL_SIZE,
    boardHeight: rows * CELL_SIZE,
    bounds: useMemo(
      () =>
        ready
          ? {
              xMin: 0,
              xMax: columns - 1,
              yMin: 0,
              yMax: rows - 1,
            }
          : getDefaultBoundary(),
      [rows, columns, ready],
    ),
  };
};
