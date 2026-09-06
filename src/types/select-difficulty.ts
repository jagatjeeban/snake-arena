//import types
import { DifficultyLevel } from "./game";

export type SelectDifficultyProps = {
  onSelect: (difficulty: DifficultyLevel) => void;
};
