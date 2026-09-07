import { useCallback, useMemo, useState } from "react";
import type { LayoutChangeEvent } from "react-native";

//import game config
import { CELL_SIZE, getDefaultBoundary } from "@/features/game/config";

export const useGameBoard = () => {
  //states
  const [size, setSize] = useState({ width: 0, height: 0 });

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
    measuredWidth: size.width,
    measuredHeight: size.height,
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
