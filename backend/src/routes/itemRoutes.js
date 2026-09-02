import express from "express";
import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware.js";
import { validateRequest, validateParams } from "../middlewares/validateMiddleware.js";
import { getAllItems, getItemById, createItem, updateItem, deleteItem } from "../controllers/itemController.js";
import { createItemSchema, updateItemSchema, idParamSchema } from "../validators/itemValidators.js";

const router = express.Router();
const lockAdmin = [verifyToken, verifyAdmin];

router.get("/", verifyToken, getAllItems);
router.get("/:id", verifyToken, validateParams(idParamSchema), getItemById);
router.post("/", verifyToken, validateRequest(createItemSchema), createItem);
router.patch("/:id", verifyToken, validateParams(idParamSchema), validateRequest(updateItemSchema), updateItem);
router.delete("/:id", lockAdmin, validateParams(idParamSchema), deleteItem);

export default router;