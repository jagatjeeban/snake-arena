import { useWindowDimensions } from "react-native";

type PercentValue = string | number;

/**
 * Normalizes the number-like values accepted by Snake Arena's responsive
 * helpers. Accepting `25`, `"25"`, and `"25%"` keeps call sites concise while
 * failing early when an invalid layout value would otherwise produce `NaN`.
 * @param value the number, numeric string, or percentage string to normalize
 * @param inputName identifies the responsive helper in validation errors
 * @returns the finite numeric portion of the supplied value
 * @throws TypeError when the value cannot produce a finite number
 */
const getValidatedNumericValue = (
  value: PercentValue,
  inputName: string,
): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    const normalizedValue = trimmedValue.endsWith("%")
      ? trimmedValue.slice(0, -1).trim()
      : trimmedValue;

    if (normalizedValue !== "") {
      const parsedValue = Number(normalizedValue);
      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }
  }

  throw new TypeError(
    `useResponsive expected a number or numeric string for ${inputName}, received ${String(value)}`,
  );
};

//constants
const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;
const designWidthDim = Math.min(DESIGN_WIDTH, DESIGN_HEIGHT);
const designAspectHeight = (16 / 9) * designWidthDim;
const DESIGN_DIAGONAL = Math.sqrt(
  designAspectHeight ** 2 + designWidthDim ** 2,
);

/**
 * Builds responsive sizing helpers from the current window dimensions. Width
 * and height percentages follow the device, while font scaling uses a stable
 * 16:9 diagonal so Snake Arena typography scales consistently across aspect ratios.
 * @returns current dimensions, orientation, percentage-based size helpers, and
 * a converter from design font sizes to responsive font sizes
 */
export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  // Convert a percentage of the current window width into density-independent pixels.
  const rw = (percent: PercentValue): number =>
    (width * getValidatedNumericValue(percent, "rw")) / 100;

  // Convert a percentage of the current window height into density-independent pixels.
  const rh = (percent: PercentValue): number =>
    (height * getValidatedNumericValue(percent, "rh")) / 100;

  // Scale typography against a normalized diagonal derived from the shortest side.
  const rf = (percent: PercentValue): number => {
    const validatedPercent = getValidatedNumericValue(percent, "rf");
    const widthDimension = Math.min(width, height);
    const aspectHeight = (16 / 9) * widthDimension;
    const diagonal = Math.sqrt(aspectHeight ** 2 + widthDimension ** 2);

    return (diagonal * validatedPercent) / 100;
  };

  // Expose orientation for layout decisions that cannot use one fixed dimension.
  const isLandscape: boolean = width > height;

  // Scale icons and images against the axis that best fits the current orientation.
  const adaptiveSize = (percent: PercentValue) => {
    if (isLandscape) return rh(percent);
    else return rw(percent);
  };

  // Convert a font size from the 375x812 design reference into the current scale.
  const fontSizeToRf = (fontSize: number) => {
    const validatedFontSize = getValidatedNumericValue(
      fontSize,
      "fontSizeToRf",
    );
    const percentage = (validatedFontSize * 100) / DESIGN_DIAGONAL;

    return rf(percentage);
  };

  return {
    width,
    height,
    isLandscape,
    adaptiveSize,
    rw,
    rh,
    rf,
    fontSizeToRf,
  };
};
