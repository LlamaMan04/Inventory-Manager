export type UserRole = "ADMIN" | "USER";

export type User = {
  id: number;
  username: string;
  role: UserRole;
};

export type Item = {
  id: number;
  name: string;
  description?: string | null;
  barcode?: string | null;
};

export type Location = {
  id: number;
  name: string;
  description?: string | null;
};

export type Stock = {
  id: number;
  itemId: number;
  locationId: number;
  quantity: number;
  item?: Item;
  location?: Location;
};

export type InventoryData = {
  items: Item[];
  locations: Location[];
  stocks: Stock[];
  users: User[];
};

export type MovementType = "receive" | "ship" | "transfer";

export type PendingMove = {
  type: MovementType;
  itemId: number;
  from?: number;
  to?: number;
  quantity: number;
};

export const emptyInventoryData: InventoryData = {
  items: [],
  locations: [],
  stocks: [],
  users: [],
};
