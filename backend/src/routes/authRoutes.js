import express from "express";
import { addUser, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", addUser);
router.post("/", login);

export default router;