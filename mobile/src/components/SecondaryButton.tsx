import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/components/theme";

// Renders a secondary action with an optional destructive treatment.
export function SecondaryButton({ 
  label, 
  onPress, 
  destructive, 
  compact 
}: { 
  label: string; 
  onPress: () => void; 
  destructive?: boolean; 
  compact?: boolean 
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.secondary, 
                               compact && styles.secondaryCompact, 
                               destructive && styles.dangerButton, 
                               pressed && styles.pressed]}
    >
      <Text style={[styles.secondaryText, destructive && styles.dangerButtonText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  secondary: { 
    minHeight: 44, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: colors.line, 
    backgroundColor: colors.panel, 
    paddingHorizontal: 15, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  secondaryCompact: {
    minHeight: 38, 
    paddingHorizontal: 12 
  },
  secondaryText: { 
    color: colors.ink, 
    fontSize: 14, 
    fontWeight: "700" 
  },
  dangerButton: {
    borderColor: "#F5B7B1", 
    backgroundColor: colors.dangerSoft 
  },
  dangerButtonText: { 
    color: colors.danger 
  },
  pressed: { 
    opacity: 0.74 
  },
});
