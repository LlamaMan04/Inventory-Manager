import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "@/components/theme";

// Displays selectable items in a modal bottom sheet.
export function ChoiceSheet({ 
  visible, 
  title, 
  choices, 
  onSelect, 
  onClose 
}: { 
  visible: boolean; 
  title: string; 
  choices: { id: number; label: string; detail?: string }[]; 
  onSelect: (id: number) => void; 
  onClose: () => void 
}) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.close}>x</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.choiceList}>
            {choices.map((choice) => (
              <Pressable 
                key={choice.id} 
                onPress={() => onSelect(choice.id)} 
                style={({ pressed }) => [styles.choice, pressed && styles.pressed]}
              >
                <View style={styles.choiceText}>
                  <Text style={styles.choiceLabel}>{choice.label}</Text>
                  {choice.detail ? <Text style={styles.choiceDetail}>{choice.detail}</Text> : null}
                </View>
                <Text style={styles.choiceArrow}>&gt;</Text>
              </Pressable>
            ))}
          </ScrollView>
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
  sheet: { 
    maxHeight: "76%", 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    backgroundColor: colors.canvas, 
    paddingTop: 10, 
    paddingBottom: 26 
  },
  sheetHandle: { 
    width: 38, 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: "#B7C8C9", 
    alignSelf: "center", 
    marginBottom: 14 
  },
  sheetHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 20, 
    paddingBottom: 12 
  },
  sheetTitle: { 
    color: colors.ink, 
    fontSize: 20, 
    fontWeight: "800" 
  },
  close: { 
    color: colors.inkMuted, 
    fontSize: 28, 
    lineHeight: 28 
  },
  choiceList: { 
    paddingHorizontal: 14, 
    paddingBottom: 14 
  },
  choice: { 
    minHeight: 61, 
    backgroundColor: colors.panel, 
    borderRadius: 14, 
    marginBottom: 8, 
    paddingHorizontal: 15, 
    flexDirection: "row",
    alignItems: "center", 
    gap: 10 
  },
  choiceText: { 
    flex: 1 
  },
  choiceLabel: { 
    color: colors.ink, 
    fontSize: 16, 
    fontWeight: "700" 
  },
  choiceDetail: { 
    color: colors.muted, 
    fontSize: 13, 
    marginTop: 2 
  },
  choiceArrow: { 
    color: colors.cyanDeep, 
    fontSize: 26, 
    fontWeight: "400" 
  },
  pressed: { 
    opacity: 0.74 
  },
});
