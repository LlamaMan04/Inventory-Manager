import { StyleSheet, Text } from "react-native";
import { colors } from "@/components/theme";

// Communicates that a list has no records to display.
export function EmptyState({ message }: { message: string }) {
  return <Text style={styles.empty}>{message}</Text>;
}

const styles = StyleSheet.create({
  empty: { 
    color: colors.muted, 
    textAlign: "center", 
    fontSize: 15, 
    paddingVertical: 30, 
    paddingHorizontal: 18 
  },
});
