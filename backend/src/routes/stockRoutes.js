import express from "express";
import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware.js";
import { getAllStock, getStockById, createStock, updateStock, deleteStock } from "../controllers/stockController.js";
import { validateRequest, validateParams } from "../middlewares/validateMiddleware.js";
import { createStockSchema, updateStockSchema, idParamSchema } from "../validators/stockValidators.js";

const router = express.Router();
const lockAdmin = [verifyToken, verifyAdmin];

router.get("/", verifyToken, getAllStock);
router.get("/:id", verifyToken, validateParams(idParamSchema), getStockById);
router.post("/", verifyToken, validateRequest(createStockSchema), createStock);
router.patch("/:id", verifyToken, validateParams(idParamSchema), validateRequest(updateStockSchema), updateStock);
router.delete("/:id", lockAdmin, validateParams(idParamSchema), deleteStock);

export default router;