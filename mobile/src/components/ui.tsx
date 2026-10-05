import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

export const colors = {
  ink: "#182321",
  inkMuted: "#52615A",
  canvas: "#F0F6F6",
  panel: "#FFFFFF",
  line: "#D7E3E3",
  cyan: "#6DEAF3",
  cyanDeep: "#2AC6D0",
  ivory: "#F4F6F0",
  soft: "#DCECEF",
  muted: "#718078",
  danger: "#B42318",
  dangerSoft: "#FEE4E2",
};

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

export function PrimaryButton({
  label,
  onPress,
  disabled,
  compact,
  loading,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  compact?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primary,
        compact && styles.primaryCompact,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.primaryText}>{label}</Text>}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, destructive, compact }: { label: string; onPress: () => void; destructive?: boolean; compact?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.secondary, compact && styles.secondaryCompact, destructive && styles.dangerButton, pressed && styles.pressed]}
    >
      <Text style={[styles.secondaryText, destructive && styles.dangerButtonText]}>{label}</Text>
    </Pressable>
  );
}

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
  textContentType,
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
  textContentType?: TextInputProps["textContentType"];
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

export function SelectField({ label, value, placeholder, onPress }: { label: string; value?: string; placeholder: string; onPress: () => void }) {
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

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable key={option.value} onPress={() => onChange(option.value)} style={({ pressed }) => [styles.segment, selected && styles.segmentSelected, pressed && styles.pressed]}>
            <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ChoiceSheet({
  visible,
  title,
  choices,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  choices: { id: number; label: string; detail?: string }[];
  onSelect: (id: number) => void;
  onClose: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12}><Text style={styles.close}>×</Text></Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.choiceList}>
            {choices.map((choice) => (
              <Pressable key={choice.id} onPress={() => onSelect(choice.id)} style={({ pressed }) => [styles.choice, pressed && styles.pressed]}>
                <View style={styles.choiceText}>
                  <Text style={styles.choiceLabel}>{choice.label}</Text>
                  {choice.detail ? <Text style={styles.choiceDetail}>{choice.detail}</Text> : null}
                </View>
                <Text style={styles.choiceArrow}>›</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function ConfirmDialog({ visible, title, message, confirmLabel = "Remove", onConfirm, onCancel }: { visible: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.modalBackdrop} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={() => undefined}>
          <Text style={styles.dialogTitle}>{title}</Text>
          <Text style={styles.dialogCopy}>{message}</Text>
          <View style={styles.dialogActions}>
            <SecondaryButton label="Cancel" onPress={onCancel} compact />
            <SecondaryButton label={confirmLabel} onPress={onConfirm} destructive compact />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <Text style={styles.empty}>{message}</Text>;
}

export function Toast({ message, type = "notice" }: { message?: string; type?: "notice" | "error" }) {
  if (!message) return null;
  return <View style={[styles.toast, type === "error" && styles.errorToast]}><Text style={[styles.toastText, type === "error" && styles.errorToastText]}>{message}</Text></View>;
}

const styles = StyleSheet.create({
  heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20 },
  headingText: { flex: 1 },
  eyebrow: { color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1.1, textTransform: "uppercase", marginBottom: 4 },
  title: { color: colors.ink, fontSize: 29, fontWeight: "700", letterSpacing: -0.7 },
  primary: { minHeight: 48, borderRadius: 14, backgroundColor: colors.cyan, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  primaryCompact: { minHeight: 40, paddingHorizontal: 14, borderRadius: 12 },
  primaryText: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  secondary: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, paddingHorizontal: 15, alignItems: "center", justifyContent: "center" },
  secondaryCompact: { minHeight: 38, paddingHorizontal: 12 },
  secondaryText: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  dangerButton: { borderColor: "#F5B7B1", backgroundColor: colors.dangerSoft },
  dangerButtonText: { color: colors.danger },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.74 },
  field: { gap: 7 },
  fieldLabel: { color: colors.inkMuted, fontSize: 13, fontWeight: "700" },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, color: colors.ink, borderRadius: 12, paddingHorizontal: 14, fontSize: 16 },
  textarea: { minHeight: 94, paddingTop: 13, textAlignVertical: "top" },
  disabledInput: { backgroundColor: "#EFF4F4" },
  select: { minHeight: 50, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: 12, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  selectText: { color: colors.ink, fontSize: 16, flex: 1 },
  placeholder: { color: "#8A9994" },
  chevron: { color: colors.inkMuted, fontSize: 19 },
  segmented: { flexDirection: "row", borderRadius: 13, backgroundColor: colors.soft, padding: 4, gap: 3 },
  segment: { flex: 1, minHeight: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 7 },
  segmentSelected: { backgroundColor: colors.ink },
  segmentText: { color: colors.inkMuted, fontSize: 13, fontWeight: "800", textTransform: "capitalize" },
  segmentTextSelected: { color: colors.ivory },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(10, 23, 21, 0.47)", justifyContent: "flex-end" },
  sheet: { maxHeight: "76%", borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.canvas, paddingTop: 10, paddingBottom: 26 },
  sheetHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: "#B7C8C9", alignSelf: "center", marginBottom: 14 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 12 },
  sheetTitle: { color: colors.ink, fontSize: 20, fontWeight: "800" },
  close: { color: colors.inkMuted, fontSize: 28, lineHeight: 28 },
  choiceList: { paddingHorizontal: 14, paddingBottom: 14 },
  choice: { minHeight: 61, backgroundColor: colors.panel, borderRadius: 14, marginBottom: 8, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", gap: 10 },
  choiceText: { flex: 1 },
  choiceLabel: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  choiceDetail: { color: colors.muted, fontSize: 13, marginTop: 2 },
  choiceArrow: { color: colors.cyanDeep, fontSize: 26, fontWeight: "400" },
  dialog: { margin: 20, borderRadius: 20, backgroundColor: colors.panel, padding: 22, alignSelf: "stretch" },
  dialogTitle: { color: colors.ink, fontSize: 21, fontWeight: "800", marginBottom: 8 },
  dialogCopy: { color: colors.inkMuted, fontSize: 15, lineHeight: 21 },
  dialogActions: { flexDirection: "row", justifyContent: "flex-end", gap: 9, marginTop: 22 },
  empty: { color: colors.muted, textAlign: "center", fontSize: 15, paddingVertical: 30, paddingHorizontal: 18 },
  toast: { backgroundColor: "#D9F9F5", borderWidth: 1, borderColor: "#A0ECE5", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 14 },
  errorToast: { backgroundColor: colors.dangerSoft, borderColor: "#F5B7B1" },
  toastText: { color: "#126B67", fontSize: 14, fontWeight: "700" },
  errorToastText: { color: colors.danger },
});
