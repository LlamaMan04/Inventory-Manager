// Roles supported by the backend authorization model.
export type UserRole = "ADMIN" | "USER";

// Authenticated account returned by the API.
export type User = {
  id: number;
  username: string;
  role: UserRole;
};

// Catalog item stored in inventory.
export type Item = {
  id: number;
  name: string;
  description?: string | null;
  barcode?: string | null;
};

// Physical location where stock can be held.
export type Location = {
  id: number;
  name: string;
  description?: string | null;
};

// Quantity of one item at one location.
export type Stock = {
  id: number;
  itemId: number;
  locationId: number;
  quantity: number;
  item?: Item;
  location?: Location;
};

// Complete client-side inventory snapshot.
export type InventoryData = {
  items: Item[];
  locations: Location[];
  stocks: Stock[];
  users: User[];
};

// Supported stock movement operations.
export type MovementType = "receive" | "ship" | "transfer";

// Movement staged locally before final submission.
export type PendingMove = {
  type: MovementType;
  itemId: number;
  from?: number;
  to?: number;
  quantity: number;
};

// Empty snapshot used while the app is booting or signed out.
export const emptyInventoryData: InventoryData = {
  items: [],
  locations: [],
  stocks: [],
  users: [],
};
