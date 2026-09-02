import express from "express";
import { addUser, login, logout, removeUser, updatePassword, getAllUsers } from "../controllers/authController.js";
import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateMiddleware.js";
import { addUserSchema, loginSchema, updatePasswordSchema } from "../validators/authValidators.js";

const router = express.Router();
const lockAdmin = [verifyToken, verifyAdmin];

router.get("/users", lockAdmin, getAllUsers);
router.post("/register", lockAdmin, validateRequest(addUserSchema), addUser);
router.post("/", validateRequest(loginSchema), login);
router.post("/logout", verifyToken, logout);
router.delete("/remove/:id", lockAdmin, removeUser);
router.post("/update-password", verifyToken, validateRequest(updatePasswordSchema), updatePassword);

export default router;