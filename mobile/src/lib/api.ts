import type { Item, Location, MovementType, User, UserRole } from "@/types";

// Shape shared by successful API responses.
type ApiResponse<T> = {
  data: T;
  message?: string;
  token?: string;
};

type LoginResponse = ApiResponse<User> & {
  token: string;
};

type UserListResponse = ApiResponse<{ users: User[] }>;

// Adds a protocol and removes trailing slashes from a user-entered API address.
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

  // Sends an authenticated JSON request and turns HTTP failures into Error objects.
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

  // Creates a session and returns the authenticated user and token.
  login(username: string, password: string) {
    return this.request<LoginResponse>("/auth", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  // Invalidates the current server session.
  logout() {
    return this.request("/auth/logout", { method: "POST" });
  }

  // Retrieves the currently authenticated user.
  getMyUser() {
    return this.request<ApiResponse<User>>("/auth/users/me");
  }

  // Lists all users for administrator account management.
  users() {
    return this.request<UserListResponse>("/auth/users");
  }

  // Creates a new user account.
  register(data: { username: string; password: string; role: UserRole }) {
    return this.request("/auth/register", { method: "POST", body: JSON.stringify(data) });
  }

  // Changes a user's role.
  updateUser(id: number, role: UserRole) {
    return this.request(`/auth/role/${id}`, { method: "PATCH", body: JSON.stringify({ role }) });
  }

  // Removes a user account.
  removeUser(id: number) {
    return this.request(`/auth/remove/${id}`, { method: "DELETE" });
  }

  // Changes the current user's password.
  updatePassword(data: { oldPassword: string; newPassword: string }) {
    return this.request("/auth/update-password", { method: "POST", body: JSON.stringify(data) });
  }

  // Retrieves catalog items.
  items() {
    return this.request<ApiResponse<Item[]>>("/item");
  }

  // Adds a catalog item.
  createItem(data: Omit<Item, "id">) {
    return this.request("/item", { method: "POST", body: JSON.stringify(data) });
  }

  // Updates an existing catalog item.
  updateItem(id: number, data: Omit<Item, "id">) {
    return this.request(`/item/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  }

  // Deletes a catalog item.
  removeItem(id: number) {
    return this.request(`/item/${id}`, { method: "DELETE" });
  }

  // Retrieves storage locations.
  locations() {
    return this.request<ApiResponse<Location[]>>("/location");
  }

  // Adds a storage location.
  createLocation(data: Omit<Location, "id">) {
    return this.request("/location", { method: "POST", body: JSON.stringify(data) });
  }

  // Updates an existing storage location.
  updateLocation(id: number, data: Omit<Location, "id">) {
    return this.request(`/location/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  }

  // Deletes a storage location.
  removeLocation(id: number) {
    return this.request(`/location/${id}`, { method: "DELETE" });
  }

  // Retrieves current stock positions.
  stocks() {
    return this.request<ApiResponse<import("@/types").Stock[]>>("/stock");
  }

  // Applies staged receive, ship, or transfer movements.
  moveStock(moves: { type: MovementType; itemId: number; from?: number; to?: number; quantity: number }[]) {
    return this.request("/stock/movements", { method: "POST", body: JSON.stringify({ moves }) });
  }
}
