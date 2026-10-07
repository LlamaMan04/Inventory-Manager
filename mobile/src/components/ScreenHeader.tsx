import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/components/theme";

// Displays a consistent page title, optional eyebrow, and trailing action.
export function ScreenHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <View style={styles.heading}>
      <View style={styles.headingText}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    gap: 12, 
    marginBottom: 20 
  },
  headingText: { 
    flex: 1 
  },
  eyebrow: { 
    color: colors.muted, 
    fontSize: 11, 
    fontWeight: "700", 
    letterSpacing: 1.1, 
    textTransform: "uppercase", 
    marginBottom: 4 
  },
  title: { 
    color: colors.ink, 
    fontSize: 29, 
    fontWeight: "700", 
    letterSpacing: -0.7 
  },
});
