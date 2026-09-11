//import constants
import { fontSize } from "@/constants";

//import types
import type { TextTheme } from "@/types/text-theme";

// Build one theme entry while keeping font-family support centralized for future use.
const createTextTheme = (fontSize: number, fontFamily?: string): TextTheme => ({
  fontSize,
  //   fontFamily,
});

//text theme required strings
export const textThemeReq = {
  largest3: "largest3",
  largest2: "largest2",
  largest1: "largest1",
  bigger2: "bigger2",
  bigger1: "bigger1",
  large4: "large4",
  large3: "large3",
  large2: "large2",
  large1: "large1",
  normal4: "normal4",
  normal3: "normal3",
  normal2: "normal2",
  normal1: "normal1",
  small4: "small4",
  small3: "small3",
  small2: "small2",
  small1: "small1",
  small0: "small0",
} as const;

export type TextThemeName = keyof typeof textStyleMap;

//default text style
const defaultTextStyle = createTextTheme(
  fontSize.xxxNormal,
  //   fontFamily.outfitRegular,
);

const textStyleMap = {
  [textThemeReq.largest3]: createTextTheme(
    fontSize.xxxLargest,
    // fontFamily.outfitBold,
  ),
  [textThemeReq.largest2]: createTextTheme(
    fontSize.xLargest,
    // fontFamily.outfitBold,
  ),
  [textThemeReq.largest1]: createTextTheme(
    fontSize.largest,
    // fontFamily.outfitBold,
  ),
  [textThemeReq.bigger2]: createTextTheme(
    fontSize.xBigger,
    // fontFamily.outfitSemiBold,
  ),
  [textThemeReq.bigger1]: createTextTheme(
    fontSize.bigger,
    // fontFamily.outfitSemiBold,
  ),
  [textThemeReq.large4]: createTextTheme(
    fontSize.xxxxLarge,
    // fontFamily.outfitMedium,
  ),
  [textThemeReq.large3]: createTextTheme(
    fontSize.xxxLarge,
    // fontFamily.outfitMedium,
  ),
  [textThemeReq.large2]: createTextTheme(
    fontSize.xLarge,
    // fontFamily.outfitMedium,
  ),
  [textThemeReq.large1]: createTextTheme(
    fontSize.large,
    // fontFamily.outfitMedium,
  ),
  [textThemeReq.normal4]: createTextTheme(
    fontSize.xxxNormal,
    // fontFamily.outfitRegular,
  ),
  [textThemeReq.normal3]: createTextTheme(
    fontSize.xxNormal,
    // fontFamily.outfitRegular,
  ),
  [textThemeReq.normal2]: createTextTheme(
    fontSize.xNormal,
    // fontFamily.outfitRegular,
  ),
  [textThemeReq.normal1]: createTextTheme(
    fontSize.normal,
    // fontFamily.outfitRegular,
  ),
  [textThemeReq.small4]: createTextTheme(
    fontSize.xxSmall,
    // fontFamily.outfitRegular,
  ),
  [textThemeReq.small3]: createTextTheme(
    fontSize.xSmall,
    // fontFamily.outfitRegular,
  ),
  [textThemeReq.small2]: createTextTheme(
    fontSize.small,
    // fontFamily.outfitRegular,
  ),
  [textThemeReq.small1]: createTextTheme(
    fontSize.xTiny,
    // fontFamily.outfitRegular,
  ),
  [textThemeReq.small0]: createTextTheme(
    fontSize.tiny,
    // fontFamily.outfitRegular,
  ),
} as const;

/**
 * Resolves a named Snake Arena typography profile for `TextComponent` and falls
 * back to the standard body size when no profile is requested.
 * @param req the optional shared typography profile name
 * @returns the profile's base text style before component-level overrides
 */
const textTheme = (req?: TextThemeName): TextTheme =>
  req ? textStyleMap[req] : defaultTextStyle;

export default textTheme;
