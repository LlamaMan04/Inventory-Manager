import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/components/theme";

// Presents a read-only field that opens a selection sheet when pressed.
export function SelectField({ 
  label, 
  value, 
  placeholder, 
  onPress 
}: { 
  label: string; 
  value?: string; 
  placeholder: string; 
  onPress: () => void 
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.select, pressed && styles.pressed]}>
        <Text numberOfLines={1} style={[styles.selectText, !value && styles.placeholder]}>{value || placeholder}</Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { 
    gap: 7 
  },
  fieldLabel: { 
    color: colors.inkMuted, 
    fontSize: 13, 
    fontWeight: "700" 
  },
  select: { 
    minHeight: 50, 
    borderWidth: 1, 
    borderColor: colors.line, 
    backgroundColor: colors.panel,
    borderRadius: 12, 
    paddingHorizontal: 14, 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12 
  },
  selectText: { 
    color: colors.ink, 
    fontSize: 16, 
    flex: 1 
  },
  placeholder: { 
    color: "#8A9994" 
  },
  chevron: { 
    color: colors.inkMuted, 
    fontSize: 19 
  },
  pressed: { 
    opacity: 0.74 
  },
});
