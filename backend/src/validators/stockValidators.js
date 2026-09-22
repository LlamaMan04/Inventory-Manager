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

export const stockMovementSchema = z.object({
  type: z.enum(["receive", "ship", "transfer"]),
  itemId: z.coerce.number().int().positive("Item ID must be a positive integer"),
  from: z.coerce.number().int().positive("Source location must be a positive integer").optional(),
  to: z.coerce.number().int().positive("Destination location must be a positive integer").optional(),
  quantity: z.coerce.number().int().positive("Quantity must be a positive integer"),
}).superRefine((move, context) => {
  if (move.type !== "receive" && !move.from) {
    context.addIssue({ code: "custom", path: ["from"], message: "Source location is required" });
  }
  if (move.type !== "ship" && !move.to) {
    context.addIssue({ code: "custom", path: ["to"], message: "Destination location is required" });
  }
});

export const stockMovementBatchSchema = z.object({
  moves: z.array(stockMovementSchema).min(1, "At least one stock movement is required"),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("ID must be a positive integer"),
});