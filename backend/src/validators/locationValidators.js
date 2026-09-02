import { z } from "zod";

export const createLocationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  description: z.string().optional(),
});

export const updateLocationSchema = z.object({
  name: z.string().min(1, "Location name is required").optional(),
  description: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("ID must be a positive integer"),
});