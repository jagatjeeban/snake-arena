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
 * Renders application text with shared typography and responsive sizing.
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
