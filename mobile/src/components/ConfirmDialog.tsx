import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SecondaryButton } from "@/components/SecondaryButton";
import { colors } from "@/components/theme";

// Asks the user to confirm an irreversible action.
export function ConfirmDialog({ 
  visible, 
  title, 
  message, 
  confirmLabel = "Remove", 
  onConfirm, 
  onCancel 
}: { 
  visible: boolean; 
  title: string; 
  message: string; 
  confirmLabel?: string; 
  onConfirm: () => void; 
  onCancel: () => void 
}) {
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

const styles = StyleSheet.create({
  modalBackdrop: { 
    flex: 1, 
    backgroundColor: "rgba(10, 23, 21, 0.47)", 
    justifyContent: "flex-end" 
  },
  dialog: { 
    margin: 20, 
    borderRadius: 20, 
    backgroundColor: colors.panel, 
    padding: 22, 
    alignSelf: "stretch" 
  },
  dialogTitle: { 
    color: colors.ink, 
    fontSize: 21, 
    fontWeight: "800", 
    marginBottom: 8 
  },
  dialogCopy: { 
    color: colors.inkMuted, 
    fontSize: 15, 
    lineHeight: 21 
  },
  dialogActions: { 
    flexDirection: "row", 
    justifyContent: "flex-end", 
    gap: 9, 
    marginTop: 22 
  },
});
