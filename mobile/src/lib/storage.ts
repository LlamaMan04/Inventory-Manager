import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PendingMove, User } from "@/types";

const keys = {
  apiUrl: "inventory_api_url",
  token: "inventory_token",
  user: "inventory_user",
  pendingMoves: "inventory_pending_moves",
};

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
  getSession: async () => {
    const [apiUrl, token, user] = await Promise.all([
      AsyncStorage.getItem(keys.apiUrl),
      AsyncStorage.getItem(keys.token),
      readJson<User>(keys.user),
    ]);
    return { apiUrl, token, user };
  },
  saveSession: (apiUrl: string, token: string, user: User) =>
    AsyncStorage.multiSet([
      [keys.apiUrl, apiUrl],
      [keys.token, token],
      [keys.user, JSON.stringify(user)],
    ]),
  clearSession: () => AsyncStorage.multiRemove([keys.token, keys.user]),
  getPendingMoves: () => readJson<PendingMove[]>(keys.pendingMoves),
  savePendingMoves: (moves: PendingMove[]) => AsyncStorage.setItem(keys.pendingMoves, JSON.stringify(moves)),
  clearPendingMoves: () => AsyncStorage.removeItem(keys.pendingMoves),
};
