import { memo } from "react";
import type { SnakeProps } from "@/types/snake";
import SnakeSegment from "./snake-segment";

const Snake = memo(function Snake({ capacity, snapshot }: SnakeProps) {
  return Array.from({ length: capacity }, (_, index) => (
    <SnakeSegment key={index} index={index} snapshot={snapshot} />
  ));
});

export default Snake;
