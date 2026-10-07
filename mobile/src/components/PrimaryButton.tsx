import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { colors } from "@/components/theme";

// Renders the main call-to-action button, including disabled and loading states.
export function PrimaryButton({ 
  label, 
  onPress, 
  disabled, 
  compact, 
  loading, 
  style 
}: { 
  label: string; 
  onPress: () => void; 
  disabled?: boolean; 
  compact?: boolean; 
  loading?: boolean; 
  style?: ViewStyle 
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [styles.primary, 
                               compact && styles.primaryCompact, 
                               (disabled || loading) && styles.disabled, 
                               pressed && !disabled && styles.pressed, 
                               style]}
    >
      {loading ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.primaryText}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: { 
    minHeight: 48, 
    borderRadius: 14,
    backgroundColor: colors.cyan, 
    alignItems: "center", 
    justifyContent: "center", 
    paddingHorizontal: 18 
  },
  primaryCompact: { 
    minHeight: 40, 
    paddingHorizontal: 14, 
    borderRadius: 12 
  },
  primaryText: { 
    color: colors.ink, 
    fontSize: 15, 
    fontWeight: "800" 
  },
  disabled: { 
    opacity: 0.55 
  },
  pressed: { 
    opacity: 0.74 
  },
});
