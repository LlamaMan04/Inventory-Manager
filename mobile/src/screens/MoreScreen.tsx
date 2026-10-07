import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Field, PrimaryButton, ScreenHeader, SecondaryButton, colors } from "@/components";
import type { InventoryApi } from "@/lib/api";
import type { InventoryData, User } from "@/types";

// Hosts account settings, administrator account access, and sign-out.
export function MoreScreen({
  user,
  api,
  data,
  setData,
  runAction,
  onSignOut,
}: {
  user: User;
  api: InventoryApi;
  data: InventoryData;
  setData: (setter: (current: InventoryData) => InventoryData) => void;
  runAction: (action: () => Promise<unknown>, message: string) => Promise<boolean>;
  onSignOut: () => void;
}) {
  const [password, setPassword] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);

  if (showAccounts) {
    return (
      <>
        <ScreenHeader eyebrow="Manage / Administration" title="Accounts" />
        <SecondaryButton label="Back to account" onPress={() => setShowAccounts(false)} compact />
        <View style={styles.list}>
          {data.users.map((account) => (
            <View key={account.id} style={styles.account}>
              <Text style={styles.name}>{account.username}</Text>
              <Text style={styles.role}>{account.role}</Text>
            </View>
          ))}
        </View>
      </>
    );
  }

  if (showPassword) {
    // Validates and submits the password change request.
    const save = async () => {
      if (password.newPassword.length < 6 || password.newPassword !== password.confirmPassword) return;
      const success = await runAction(() => api.updatePassword(password), "Password updated.");
      if (success) 
        setShowPassword(false);
    };

    return (
      <>
        <ScreenHeader eyebrow="Account / Security" title="Change password" />
        <SecondaryButton label="Back to account" onPress={() => setShowPassword(false)} compact />
        <View style={styles.panel}>
          <Field 
            label="Current password" 
            value={password.oldPassword} 
            onChangeText={(oldPassword) => setPassword((current) => ({ ...current, oldPassword }))} 
            secureTextEntry 
          />
          <Field 
            label="New password" 
            value={password.newPassword} 
            onChangeText={(newPassword) => setPassword((current) => ({ ...current, newPassword }))} 
            secureTextEntry 
          />
          <Field
            label="Confirm password"
            value={password.confirmPassword}
            onChangeText={(confirmPassword) => setPassword((current) => ({ ...current, confirmPassword }))}
            secureTextEntry
          />
          <PrimaryButton label="Update password" onPress={save} />
        </View>
      </>
    );
  }

  // Loads the latest user list before opening administrator account view.
  const openAccounts = async () => {
    try {
      const response = await api.users();
      setData((current) => ({ ...current, users: response.data.users }));
      setShowAccounts(true);
    } catch {
      // The next refresh will retry.
    }
  };

  return (
    <>
      <ScreenHeader eyebrow="Account" title="More" />
      <View style={styles.profile}>
        <Text style={styles.avatar}>{user.username.slice(0, 1).toUpperCase()}</Text>
        <View>
          <Text style={styles.profileName}>{user.username}</Text>
          <Text style={styles.role}>{user.role === "ADMIN" ? "Administrator" : "Team member"}</Text>
        </View>
      </View>
      <View style={styles.list}>
        <SecondaryButton label="Change password" onPress={() => setShowPassword(true)} />
        {user.role === "ADMIN" ? <SecondaryButton label="Accounts" onPress={openAccounts} /> : null}
        <SecondaryButton label="Sign out" onPress={onSignOut} destructive />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  profile: { 
    backgroundColor: colors.ink, 
    borderRadius: 18, 
    padding: 18, 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 13 
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: colors.cyan,
    color: colors.ink,
    fontSize: 21,
    fontWeight: "900",
  },
  profileName: { 
    color: colors.ivory, 
    fontSize: 18, 
    fontWeight: "800" 
  },
  role: { 
    color: colors.cyanDeep, 
    fontSize: 12, 
    fontWeight: "800", 
    marginTop: 4 
  },
  list: { 
    gap: 10, 
    marginTop: 17 
  },
  account: { 
    backgroundColor: colors.panel, 
    borderRadius: 16, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: "#E4EEEE" 
  },
  name: { 
    color: colors.ink, 
    fontSize: 16, 
    fontWeight: "800" 
  },
  panel: { 
    marginTop: 16, 
    backgroundColor: colors.panel, 
    borderRadius: 18, 
    padding: 16, 
    gap: 14 
  },
});
