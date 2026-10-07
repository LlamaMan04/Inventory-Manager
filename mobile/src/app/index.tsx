import { useCallback, useEffect, useMemo, useState } from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { InventoryApi, normalizeApiUrl } from "@/lib/api";
import { storage } from "@/lib/storage";
import { emptyInventoryData, type InventoryData, type PendingMove, type User } from "@/types";
import { AppHeader, AppScreen, BottomTabs, LoadingScreen } from "@/app/app-shell";
import { ConnectScreen } from "@/app/connect-screen";
import { MoreScreen } from "@/screens/MoreScreen";
import { MoveScreen } from "@/screens/MoveScreen";
import { OverviewScreen } from "@/screens/OverviewScreen";
import { StockScreen } from "@/screens/StockScreen";
import { ManageScreen } from "@/screens/ManageScreen";

export type Tab = "overview" | "stock" | "move" | "manage" | "more";

// Used when no server address has been saved on the device yet.
const defaultApiUrl = "http://server.address:PORT";

// Converts unknown thrown values into a message suitable for the UI.
function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

// Owns the authenticated session, inventory refresh lifecycle, and tab navigation.
export default function Index() {
  const [booting, setBooting] = useState(true);
  const [apiUrl, setApiUrl] = useState(defaultApiUrl);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<InventoryData>(emptyInventoryData);
  const [pending, setPending] = useState<PendingMove[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // Clears local authentication state after sign-out or an unauthorized API response.
  const clearSession = useCallback((message = "") => {
    void storage.clearSession();
    setToken(null);
    setUser(null);
    setData(emptyInventoryData);
    setActiveTab("overview");
    setNotice("");
    setError(message);
  }, []);

  // Recreates the API client whenever the server URL or access token changes.
  const api = useMemo(
    () => new InventoryApi(apiUrl, () => token, () => clearSession("Your session has ended. Please sign in again.")),
    [apiUrl, clearSession, token],
  );

  // Loads all inventory collections in parallel and updates the current snapshot.
  const refreshInventory = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      const [items, locations, stocks] = await Promise.all([api.items(), api.locations(), api.stocks()]);
      setData((current) => ({ ...current, items: items.data, locations: locations.data, stocks: stocks.data }));
      setError("");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setRefreshing(false);
    }
  }, [api, token]);

  useEffect(() => {
    // Restores the saved session and staged movements before rendering the app.
    const bootstrap = async () => {
      const [session, storedMoves] = await Promise.all([storage.getSession(), storage.getPendingMoves()]);
      if (session.apiUrl) 
        setApiUrl(session.apiUrl);
      if (session.token && session.user) { 
        setToken(session.token); 
        setUser(session.user); 
      }
      if (storedMoves) 
        setPending(storedMoves);
      setBooting(false);
    };
    void bootstrap();
  }, []);

  // Refreshes inventory after bootstrap and whenever the active session changes.
  useEffect(() => {
    if (booting || !token || !user) 
      return;

    const timer = setTimeout(() => void refreshInventory(), 0);
    return () => clearTimeout(timer);
  }, [booting, refreshInventory, token, user]);

  // Persists staged movements so an interrupted session can resume later.
  useEffect(() => { 
    if (!booting) { 
      void storage.savePendingMoves(pending); 
    } 
  }, [booting, pending]);

  // Removes transient success notices after a short display period.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Authenticates against the configured backend and stores the returned session.
  const login = async (url: string, username: string, password: string) => {
    const endpoint = normalizeApiUrl(url);
    const loginApi = new InventoryApi(endpoint, () => null, () => undefined);
    const response = await loginApi.login(username, password);
    await storage.saveSession(endpoint, response.token, response.data);

    setApiUrl(endpoint); 
    setToken(response.token); 
    setUser(response.data); 
    setError(""); 
    setActiveTab("overview");
  };

  // Attempts a server logout, then always clears the local session.
  const signOut = async () => {
    try { 
      if (token) await api.logout(); 
    } 
    catch { 
      /* Local sign out is still valid offline. */ 
    }
    clearSession();
  };

  // Runs a mutating API action, refreshes the inventory, and reports its result.
  const runAction = useCallback(async (action: () => Promise<unknown>, successMessage: string) => {
    try {
      await action(); 
      await refreshInventory(); 
      setError(""); 
      setNotice(successMessage); 
      return true;
    } 
    catch (caught) { 
      setError(errorMessage(caught)); 
      return false; 
    }
  }, [refreshInventory]);

  // Sends all staged movements together and clears them after success.
  const finalizeMoves = async () => {
    if (!pending.length) return false;

    const success = await runAction(() => api.moveStock(pending), "Stock movements finalized.");
    if (success) { 
      setPending([]); 
      await storage.clearPendingMoves(); 
    }
    return success;
  };

  // Renders the appropriate screen based on the current session and active tab.
  if (booting) 
    return <LoadingScreen />;
  if (!token || !user) 
    return <ConnectScreen initialUrl={apiUrl} onLogin={login} error={error} />;

  // Selects the screen for the active bottom-tab route.
  const screenProps = { refreshing, onRefresh: refreshInventory, error, notice };
  let screen: React.ReactNode;

  switch (activeTab) {
    case "stock": 
      screen = <StockScreen data={data} onMove={() => setActiveTab("move")} />; 
      break;
    case "move": 
      screen = <MoveScreen 
        data={data} 
        pending={pending} 
        setPending={setPending} 
        onFinalize={finalizeMoves} 
        onError={setError} 
      />; 
      break;
    case "manage": 
      screen = <ManageScreen data={data} api={api} runAction={runAction} />; 
      break;
    case "more": 
      screen = <MoreScreen 
        user={user} 
        api={api} 
        data={data} 
        setData={setData} 
        runAction={runAction} 
        onSignOut={signOut} 
      />; 
      break;
    default: 
      screen = <OverviewScreen data={data} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A1715" }} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <AppHeader onSignOut={signOut} />
      <View style={{ flex: 1, backgroundColor: "#F4F8F7" }}>
        <AppScreen {...screenProps}>{screen}</AppScreen>
      </View>
      <BottomTabs active={activeTab} onChange={setActiveTab} isAdmin={user.role === "ADMIN"} />
    </SafeAreaView>
  );
}
