import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  barcode: z.string().min(1).optional(),
});

export const updateItemSchema = z.object({
  name: z.string().min(1, "Item name is required").optional(),
  description: z.string().optional(),
  barcode: z.string().min(1).optional(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("ID must be a positive integer"),
});