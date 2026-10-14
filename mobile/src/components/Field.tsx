import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions, type TextInputProps } from "react-native";
import { colors } from "@/components/theme";

// Provides the app's shared labeled text input for forms and search fields.
export function Field({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  keyboardType, 
  autoCapitalize = "sentences", 
  editable = true, 
  multiline, 
  textContentType 
}: { 
  label: string; 
  value: string; 
  onChangeText: (value: string) => void; 
  placeholder?: string; 
  secureTextEntry?: boolean; 
  keyboardType?: KeyboardTypeOptions; 
  autoCapitalize?: TextInputProps["autoCapitalize"]; 
  editable?: boolean; 
  multiline?: boolean; 
  textContentType?: TextInputProps["textContentType"] 
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput 
        value={value} 
        onChangeText={onChangeText} 
        placeholder={placeholder} 
        placeholderTextColor="#8A9994" 
        secureTextEntry={secureTextEntry} 
        keyboardType={keyboardType} 
        autoCapitalize={autoCapitalize} 
        editable={editable} 
        multiline={multiline} 
        textContentType={textContentType} 
        style={[styles.input, multiline && styles.textarea, !editable && styles.disabledInput]} 
      />
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
  input: { 
    minHeight: 50, 
    borderWidth: 1, 
    borderColor: colors.line, 
    backgroundColor: colors.panel, 
    color: colors.ink, 
    borderRadius: 12, 
    paddingHorizontal: 14, 
    fontSize: 16 
  },
  textarea: { 
    minHeight: 94, 
    paddingTop: 13, 
    textAlignVertical: "top" 
  },
  disabledInput: { 
    backgroundColor: "#EFF4F4" 
  },
});
