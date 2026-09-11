import { memo } from "react";

//import types
import type { SnakeProps } from "@/types/snake";

//import components
import SnakeSegment from "./snake-segment";

/**
 * Mounts the segment-slot capacity requested by the engine. The renderer keeps
 * spare slots ready so food-driven growth can continue entirely on the UI thread.
 * @param props the renderer capacity and shared movement snapshot
 * @param props.capacity the number of snake segment views to keep mounted
 * @param props.snapshot supplies positions for active slots and hides unused ones
 * @returns the preallocated collection of animated snake segments
 */
const Snake = memo(function Snake({ capacity, snapshot }: SnakeProps) {
  return Array.from({ length: capacity }, (_, index) => (
    <SnakeSegment key={index} index={index} snapshot={snapshot} />
  ));
});

export default Snake;
