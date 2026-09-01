import express from "express";
import { addUser, login, logout, removeUser, updatePassword, getAllUsers } from "../controllers/authController.js";
import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateMiddleware.js";
import { addUserSchema, loginSchema, updatePasswordSchema } from "../validators/authValidators.js";

const router = express.Router();

router.get("/users", [verifyToken, verifyAdmin], getAllUsers);
router.post("/register", [verifyToken, verifyAdmin, validateRequest(addUserSchema)], addUser);
router.post("/", validateRequest(loginSchema), login);
router.post("/logout", verifyToken, logout);
router.delete("/remove/:id", [verifyToken, verifyAdmin], removeUser);
router.post("/update-password", [verifyToken, validateRequest(updatePasswordSchema)], updatePassword);

export default router;