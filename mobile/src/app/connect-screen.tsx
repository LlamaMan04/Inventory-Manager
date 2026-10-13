import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { normalizeApiUrl } from "@/lib/api";
import { colors, Field, PrimaryButton, Toast } from "@/components";

// Guides a user through backend URL entry and credential-based sign-in.
export function ConnectScreen({ 
  initialUrl, 
  onLogin, 
  error 
}: { 
  initialUrl: string; 
  onLogin: (url: string, username: string, password: string) => Promise<void>; 
  error?: string 
}) {
  const [step, setStep] = useState<"url" | "credentials">("url");
  const [form, setForm] = useState({ url: initialUrl, username: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  
  // Validates and normalizes the backend address before showing credentials.
  const continueToCredentials = () => {
    try {
      setForm((current) => ({ ...current, url: normalizeApiUrl(current.url) }));
      setLocalError("");
      setStep("credentials");
    } catch (caught) {
      setLocalError(caught instanceof Error ? caught.message : "Invalid API URL.");
    }
  };

  // Advances the form or submits credentials to the app-level login handler.
  const submit = async () => {
    if (step === "url") return continueToCredentials();

    setBusy(true);
    setLocalError("");
    try {
      await onLogin(form.url, form.username, form.password);
    } catch (caught) {
      setLocalError(caught instanceof Error ? caught.message : "Unable to sign in.");
      setBusy(false);
    }
  };

  const displayedError = localError || error;

  return (
    <SafeAreaProvider style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.screen}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.panel}>
            <Text style={styles.brand}>Northstar</Text>
            <Text style={styles.eyebrow}>Connect your workspace</Text>
            <Text style={styles.title}>Inventory that moves with your team.</Text>
            <Text style={styles.copy}>
              Connect to your self-hosted workspace, then inspect stock and record movements from anywhere.
            </Text>
            <View style={styles.form}>
              {step === "url" ? (
                <Field
                  label="Backend API URL"
                  value={form.url}
                  onChangeText={(url) => setForm((current) => ({ ...current, url }))}
                  placeholder="http://192.168.1.25:5001"
                  autoCapitalize="none"
                />
              ) : (
                <>
                  <Field
                    label="Username"
                    value={form.username}
                    onChangeText={(username) => setForm((current) => ({ ...current, username }))}
                    autoCapitalize="none"
                  />
                  <Field
                    label="Password"
                    value={form.password}
                    onChangeText={(password) => setForm((current) => ({ ...current, password }))}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </>
              )}
              {displayedError ? <Toast message={displayedError} type="error" /> : null}
              <PrimaryButton
                label={step === "url" ? "Continue to sign in" : "Connect & sign in"}
                onPress={submit}
                loading={busy}
                disabled={step === "credentials" && (!form.username || !form.password)}
              />
              {step === "credentials" ? (
                <Pressable onPress={() => setStep("url")}>
                  <Text style={styles.changeUrl}>Change API address</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: colors.ink 
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  screen: { 
    flexGrow: 1, 
    justifyContent: "center", 
    padding: 20,
    paddingBottom: 140,
  },
  panel: { 
    backgroundColor: colors.ivory, 
    borderRadius: 25, 
    padding: 22 
  },
  brand: { 
    color: colors.ink, 
    fontSize: 20, 
    fontWeight: "900", 
    marginBottom: 30 
  },
  eyebrow: { 
    color: colors.muted, 
    fontSize: 11, 
    fontWeight: "800", 
    textTransform: "uppercase" 
  },
  title: { 
    color: colors.ink, 
    fontSize: 32, 
    fontWeight: "900", 
    lineHeight: 36, 
    marginTop: 9 
  },
  copy: { 
    color: colors.inkMuted, 
    fontSize: 15, 
    lineHeight: 22, 
    marginTop: 12 
  },
  form: { 
    gap: 15, 
    marginTop: 23 
  },
  changeUrl: { 
    color: colors.cyanDeep, 
    textAlign: "center", 
    fontSize: 14, 
    fontWeight: "800", 
    paddingVertical: 6 
  },
});
