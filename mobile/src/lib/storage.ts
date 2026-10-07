import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PendingMove, User } from "@/types";

const keys = {
  apiUrl: "inventory_api_url",
  token: "inventory_token",
  user: "inventory_user",
  pendingMoves: "inventory_pending_moves",
};

// Reads and parses a JSON value, treating missing or corrupt data as empty.
async function readJson<T>(key: string): Promise<T | null> {
  const value = await AsyncStorage.getItem(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export const storage = {
  // Restores the saved backend address and authenticated session.
  getSession: async () => {
    const [apiUrl, token, user] = await Promise.all([
      AsyncStorage.getItem(keys.apiUrl),
      AsyncStorage.getItem(keys.token),
      readJson<User>(keys.user),
    ]);
    return { apiUrl, token, user };
  },

  // Persists the values needed to reopen an authenticated session.
  saveSession: (apiUrl: string, token: string, user: User) =>
    AsyncStorage.multiSet([
      [keys.apiUrl, apiUrl],
      [keys.token, token],
      [keys.user, JSON.stringify(user)],
    ]),

  // Removes only authentication data; the configured backend address is retained.
  clearSession: () => AsyncStorage.multiRemove([keys.token, keys.user]),

  // Loads movements that were staged but not finalized.
  getPendingMoves: () => readJson<PendingMove[]>(keys.pendingMoves),

  // Persists the current staged movement list.
  savePendingMoves: (moves: PendingMove[]) => AsyncStorage.setItem(keys.pendingMoves, JSON.stringify(moves)),
  
  // Removes staged movements after the server accepts them.
  clearPendingMoves: () => AsyncStorage.removeItem(keys.pendingMoves),
};
