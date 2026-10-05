import type { Item, Location, MovementType, User, UserRole } from "@/types";

type ApiResponse<T> = {
  data: T;
  message?: string;
  token?: string;
};

type LoginResponse = ApiResponse<User> & {
  token: string;
};

type UserListResponse = ApiResponse<{ users: User[] }>;

export function normalizeApiUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) throw new Error("Enter the backend API URL.");
  return /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
}

export class InventoryApi {
  constructor(
    private readonly baseUrl: string,
    private readonly getToken: () => string | null,
    private readonly onUnauthorized: () => void,
  ) {}

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const body = (await response.json().catch(() => ({}))) as { message?: string } & T;
    if (!response.ok) {
      if (response.status === 401) this.onUnauthorized();
      throw new Error(body.message || "Request failed.");
    }

    return body as T;
  }

  login(username: string, password: string) {
    return this.request<LoginResponse>("/auth", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  logout() {
    return this.request("/auth/logout", { method: "POST" });
  }

  getMyUser() {
    return this.request<ApiResponse<User>>("/auth/users/me");
  }

  users() {
    return this.request<UserListResponse>("/auth/users");
  }

  register(data: { username: string; password: string; role: UserRole }) {
    return this.request("/auth/register", { method: "POST", body: JSON.stringify(data) });
  }

  updateUser(id: number, role: UserRole) {
    return this.request(`/auth/role/${id}`, { method: "PATCH", body: JSON.stringify({ role }) });
  }

  removeUser(id: number) {
    return this.request(`/auth/remove/${id}`, { method: "DELETE" });
  }

  updatePassword(data: { oldPassword: string; newPassword: string }) {
    return this.request("/auth/update-password", { method: "POST", body: JSON.stringify(data) });
  }

  items() {
    return this.request<ApiResponse<Item[]>>("/item");
  }

  createItem(data: Omit<Item, "id">) {
    return this.request("/item", { method: "POST", body: JSON.stringify(data) });
  }

  updateItem(id: number, data: Omit<Item, "id">) {
    return this.request(`/item/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  }

  removeItem(id: number) {
    return this.request(`/item/${id}`, { method: "DELETE" });
  }

  locations() {
    return this.request<ApiResponse<Location[]>>("/location");
  }

  createLocation(data: Omit<Location, "id">) {
    return this.request("/location", { method: "POST", body: JSON.stringify(data) });
  }

  updateLocation(id: number, data: Omit<Location, "id">) {
    return this.request(`/location/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  }

  removeLocation(id: number) {
    return this.request(`/location/${id}`, { method: "DELETE" });
  }

  stocks() {
    return this.request<ApiResponse<import("@/types").Stock[]>>("/stock");
  }

  moveStock(moves: { type: MovementType; itemId: number; from?: number; to?: number; quantity: number }[]) {
    return this.request("/stock/movements", { method: "POST", body: JSON.stringify({ moves }) });
  }
}
