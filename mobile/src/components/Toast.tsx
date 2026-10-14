import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/components/theme";

// Displays transient success or error feedback when a message is provided.
export function Toast({ message, type = "notice" }: { message?: string; type?: "notice" | "error" }) {
  if (!message) return null;
  return (
    <View style={[styles.toast, type === "error" && styles.errorToast]}>
      <Text style={[styles.toastText, type === "error" && styles.errorToastText]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: { 
    backgroundColor: "#D9F9F5", 
    borderWidth: 1, 
    borderColor: "#A0ECE5", 
    borderRadius: 12, 
    paddingHorizontal: 14, 
    paddingVertical: 11, 
    marginBottom: 14 
  },
  errorToast: { 
    backgroundColor: colors.dangerSoft, 
    borderColor: "#F5B7B1" 
  },
  toastText: { 
    color: "#126B67", 
    fontSize: 14, 
    fontWeight: "700" 
  },
  errorToastText: { 
    color: colors.danger 
  },
});
