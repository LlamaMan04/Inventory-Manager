import express from "express";
import { addUser, login, logout, removeUser } from "../controllers/authController.js";
import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateMiddleware.js";
import { addUserSchema, loginSchema } from "../validators/authValidators.js";

const router = express.Router();

router.post("/register", [verifyToken, verifyAdmin, validateRequest(addUserSchema)], addUser);
router.post("/", validateRequest(loginSchema), login);
router.post("/logout", verifyToken, logout);
router.delete("/remove/:id", [verifyToken, verifyAdmin], removeUser);

export default router;