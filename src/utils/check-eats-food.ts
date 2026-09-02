//import types
import type { Coordinate } from "@/types/game";

/**
 * function to check if the snake can eat the food
 * @param head coordinate of the snake's head
 * @param food coordinate of the food
 * @param area food area
 * @returns true if the snake's head is in the food area else false
 */
export const checkEatsFood = (
  head: Coordinate,
  food: Coordinate,
  area: number,
): boolean => {
  const distBetweenFoodAndSnakeX = Math.abs(head.x - food.x);
  const distBetweenFoodAndSnakeY = Math.abs(head.y - food.y);

  return distBetweenFoodAndSnakeX < area && distBetweenFoodAndSnakeY < area;
};
