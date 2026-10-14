import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Tab } from "@/app";
import { Toast } from "@/components";
import { colors } from "@/components/theme";

// Renders the persistent brand header and device sign-out action.
export function AppHeader({ onSignOut }: { onSignOut: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>N</Text>
        </View>
        <View>
          <Text style={styles.brandName}>Northstar</Text>
          <Text style={styles.tagline}>Inventory control</Text>
        </View>
      </View>
      <Pressable onPress={onSignOut} style={styles.signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

// Provides the primary tab navigation for the authenticated app.
export function BottomTabs({ 
  active, 
  onChange, 
  isAdmin 
}: { 
  active: Tab; 
  onChange: (tab: Tab) => void; 
  isAdmin: boolean 
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Home" },
    { id: "stock", label: "Stock" },
    { id: "move", label: "Move" },
    { id: "manage", label: "Manage" },
    { id: "more", label: isAdmin ? "Admin" : "More" },
  ];

  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => onChange(tab.id)}
          style={[styles.tab, active === tab.id && styles.activeTab]}
        >
          <Text style={[styles.tabLabel, active === tab.id && styles.activeTabText]}>
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// Wraps each tab in scrolling, pull-to-refresh, and feedback UI.
export function AppScreen({
  children,
  refreshing,
  onRefresh,
  error,
  notice,
}: {
  children: ReactNode;
  refreshing: boolean;
  onRefresh: () => void;
  error?: string;
  notice?: string;
}) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      automaticallyAdjustKeyboardInsets
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.ink}
        />
      }
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <Toast message={notice} />
      <Toast message={error} type="error" />
      {children}
    </ScrollView>
  );
}

// Shows the branded loading state while local session data is restored.
export function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <View style={styles.loadingMark}>
        <Text style={styles.loadingMarkText}>N</Text>
      </View>
      <ActivityIndicator color={colors.cyan} size="large" />
      <Text style={styles.loadingText}>Loading workspace...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { 
    minHeight: 70, 
    backgroundColor: colors.ink, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 18 
  },
  brandRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10 
  },
  brandMark: { 
    width: 35, 
    height: 35, 
    backgroundColor: colors.cyan, 
    borderRadius: 10, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  brandMarkText: { 
    color: colors.ink, 
    fontSize: 20, 
    fontWeight: "900" 
  },
  brandName: { 
    color: colors.ivory, 
    fontSize: 17, 
    fontWeight: "800" 
  },
  tagline: { 
    color: "#AAB6A9", 
    fontSize: 11 
  },
  signOut: { 
    padding: 8 
  },
  signOutText: { 
    color: colors.cyan, 
    fontSize: 13, 
    fontWeight: "800" 
  },
  scroll: { 
    flex: 1 
  },
  content: { 
    padding: 18, 
    paddingBottom: 140,
    flexGrow: 1 
  },
  tabs: { 
    minHeight: 65, 
    backgroundColor: colors.ink, 
    flexDirection: "row", 
    padding: 5, 
    gap: 4 
  },
  tab: { 
    flex: 1, 
    borderRadius: 12, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  activeTab: { 
    backgroundColor: "#28433E" 
  },
  tabLabel: { 
    color: "#AAB6A9", 
    fontSize: 11, 
    fontWeight: "700" 
  },
  activeTabText: { 
    color: colors.cyan 
  },
  loading: { 
    flex: 1, 
    backgroundColor: colors.ink, 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 17 
  },
  loadingMark: { 
    width: 57, 
    height: 57, 
    borderRadius: 16, 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: colors.cyan 
  },
  loadingMarkText: { 
    color: colors.ink, 
    fontSize: 32, 
    fontWeight: "900" 
  },
  loadingText: { 
    color: colors.ivory, 
    fontSize: 15, 
    fontWeight: "700" 
  },
});
