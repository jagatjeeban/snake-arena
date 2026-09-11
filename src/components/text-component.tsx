import type {
  PressableProps,
  StyleProp,
  TextProps,
  TextStyle,
  ViewStyle,
} from "react-native";
import { Pressable, Text } from "react-native";

//import constants
import { colors } from "@/constants";

//import hooks
import { useResponsive } from "@/hooks";

//import themes
import textTheme from "@/themes/text-theme";

//import types
import type { TextThemeName } from "@/themes/text-theme";

type TextComponentProps = {
  containerStyle?: StyleProp<ViewStyle>;
  text: string;
  margin?: TextStyle["marginVertical"];
  required?: boolean;
  onTextLayout?: TextProps["onTextLayout"];
  selectable?: TextProps["selectable"];
  clickEvent?: PressableProps["onPress"];
  numOfLine?: TextProps["numberOfLines"];
  textAlign?: TextStyle["textAlign"];
  color?: TextStyle["color"];
  customFontSize?: TextStyle["fontSize"];
  styleProfile?: TextThemeName;
  customStyle?: TextStyle;
  fontWeight?: TextStyle["fontWeight"];
  fontFamily?: TextStyle["fontFamily"];
};

/**
 * Renders app text through Snake Arena's typography and responsive-size rules.
 * It also provides the shared required marker and optional press behavior so
 * screens do not recreate those conventions independently.
 * @param props the text content, typography overrides, and optional interaction
 * @param props.text the visible string to render
 * @param props.styleProfile selects a shared text-theme size
 * @param props.customFontSize overrides the profile's base font size
 * @param props.customStyle applies final text-style overrides, including line height
 * @param props.required appends the shared required-field marker when true
 * @param props.clickEvent enables the press wrapper when supplied
 * @returns responsive application text inside an optional press target
 */
const TextComponent = ({
  containerStyle = {},
  text,
  margin,
  required = false,
  onTextLayout,
  selectable = false,
  clickEvent,
  numOfLine,
  textAlign,
  color,
  customFontSize,
  styleProfile,
  customStyle = {},
  fontWeight,
  fontFamily,
}: TextComponentProps) => {
  const { fontSizeToRf } = useResponsive();

  const resolvedTextStyle = textTheme(styleProfile);
  const baseFontSize = customFontSize ?? resolvedTextStyle.fontSize ?? 14;
  const resolvedFontSize = fontSizeToRf(baseFontSize);

  //   const resolvedFontFamily = fontFamily ?? resolvedTextStyle.fontFamily;
  const resolvedLineHeight =
    customStyle?.lineHeight ?? Math.round(resolvedFontSize * 1.15); // avoid clipping descenders on some fonts

  return (
    <Pressable
      disabled={!clickEvent}
      onPress={clickEvent}
      style={containerStyle}
    >
      <Text
        numberOfLines={numOfLine}
        onTextLayout={onTextLayout}
        selectable={selectable}
        style={{
          textAlign: textAlign,
          color: color ?? colors.background,
          flexWrap: "wrap",
          marginVertical: margin,
          fontSize: resolvedFontSize,
          fontWeight: fontWeight,
          //   fontFamily: resolvedFontFamily,
          lineHeight: resolvedLineHeight,
          ...customStyle,
        }}
      >
        {text}
        {required ? <Text style={{ color: colors.baseRed }}>{"*"}</Text> : null}
      </Text>
    </Pressable>
  );
};

export default TextComponent;
