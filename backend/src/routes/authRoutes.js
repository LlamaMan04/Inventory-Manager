import express from "express";
import { addUser, login, logout, refreshJWT, removeUser, updateUserRole, updatePassword, getAllUsers, getMyUser } from "../controllers/authController.js";
import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware.js";
import { validateRequest, validateParams } from "../middlewares/validateMiddleware.js";
import { addUserSchema, loginSchema, updatePasswordSchema, updateUserRoleSchema, idParamSchema } from "../validators/authValidators.js";

const router = express.Router();
const lockAdmin = [verifyToken, verifyAdmin];

router.get("/users", lockAdmin, getAllUsers);
router.get("/users/me", verifyToken, getMyUser);
router.post("/register", lockAdmin, validateRequest(addUserSchema), addUser);
router.patch("/role/:id", lockAdmin, validateParams(idParamSchema), validateRequest(updateUserRoleSchema), updateUserRole);
router.post("/", validateRequest(loginSchema), login);
router.post("/logout", verifyToken, logout);
router.post("/refresh", refreshJWT);
router.delete("/remove/:id", lockAdmin, validateParams(idParamSchema), removeUser);
router.post("/update-password", verifyToken, validateRequest(updatePasswordSchema), updatePassword);

export default router;