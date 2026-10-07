import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/components/theme";

// Lets the user choose one value from a compact horizontal set of options.
export function SegmentedControl<T extends string>({ 
  options, 
  value, 
  onChange 
}: { 
  options: { value: T; label: string }[]; 
  value: T; 
  onChange: (value: T) => void 
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable 
            key={option.value} 
            onPress={() => onChange(option.value)} 
            style={({ pressed }) => [styles.segment, selected && styles.segmentSelected, pressed && styles.pressed]}
          >
            <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
              {option.label}
            </Text>``
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segmented: { 
    flexDirection: "row", 
    borderRadius: 13, 
    backgroundColor: colors.soft, 
    padding: 4, 
    gap: 3 
  },
  segment: { 
    flex: 1, 
    minHeight: 38, 
    borderRadius: 10, 
    alignItems: "center", 
    justifyContent: "center", 
    paddingHorizontal: 7 
  },
  segmentSelected: { 
    backgroundColor: colors.ink 
  },
  segmentText: { 
    color: colors.inkMuted, 
    fontSize: 13, 
    fontWeight: "800", 
    textTransform: "capitalize" 
  },
  segmentTextSelected: { 
    color: colors.ivory 
  },
  pressed: { 
    opacity: 0.74 
  },
});
