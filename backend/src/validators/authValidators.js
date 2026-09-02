import {z} from "zod";

export const addUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["ADMIN", "USER"], "Role must be either 'ADMIN' or 'USER'").optional(),
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
});