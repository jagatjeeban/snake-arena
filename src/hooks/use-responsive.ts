import { useWindowDimensions } from "react-native";

type PercentValue = string | number;

/**
 * Normalizes a numeric input that may be passed as a number, numeric string,
 * or percentage string and returns it as a finite number.
 *
 * @param {number|string} value Input value to validate and normalize.
 * @param {string} inputName Human-readable input label used in the error message.
 * @returns {number} The normalized finite numeric value.
 * @throws {TypeError} Throws when the input cannot be converted to a valid finite number.
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
 * Custom hook for responsive layout across devices
 * @returns
 */
export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  //returns responsive width
  const rw = (percent: PercentValue): number =>
    (width * getValidatedNumericValue(percent, "rw")) / 100;

  //returns responsive height
  const rh = (percent: PercentValue): number =>
    (height * getValidatedNumericValue(percent, "rh")) / 100;

  //returns responsive font size
  const rf = (percent: PercentValue): number => {
    const validatedPercent = getValidatedNumericValue(percent, "rf");
    const widthDimension = Math.min(width, height);
    const aspectHeight = (16 / 9) * widthDimension;
    const diagonal = Math.sqrt(aspectHeight ** 2 + widthDimension ** 2);
    return (diagonal * validatedPercent) / 100;
  };

  //current device orientation
  const isLandscape: boolean = width > height;

  //returns responsive size based on device orientation (for icons, image dimensions e.t.c.)
  const adaptiveSize = (percent: PercentValue) => {
    if (isLandscape) return rh(percent);
    else return rw(percent);
  };

  //converts and returns fixed font size to responsive font size
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
