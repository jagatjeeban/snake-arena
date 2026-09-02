import { StyleSheet } from "react-native";

//import components
import { Game } from "@/components";

export default function Index() {
  return <Game />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
