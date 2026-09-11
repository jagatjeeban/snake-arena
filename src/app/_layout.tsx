import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

/**
 * Provides the app-wide gesture-handler root and headerless Expo Router stack.
 * The wrapper is required so playground gestures can be recognized anywhere in
 * the route tree.
 * @returns the root navigation layout shared by the home and playground screens
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </GestureHandlerRootView>
  );
}
