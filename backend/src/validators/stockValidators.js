import {z} from "zod";

export const createStockSchema = z.object({
  itemId: z.coerce.number().int().positive("Item ID must be a positive integer"),
  quantity: z.coerce.number().int().nonnegative("Quantity must be a non-negative integer"),
  locationId: z.coerce.number().int().positive("Location ID must be a positive integer"),
});

export const updateStockSchema = z.object({
  quantity: z.coerce.number().int().nonnegative("Quantity must be a non-negative integer").optional(),
  locationId: z.coerce.number().int().positive("Location ID must be a positive integer").optional(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("ID must be a positive integer"),
});