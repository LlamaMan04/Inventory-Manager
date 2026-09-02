import express from "express";
import { verifyToken, verifyAdmin } from "../middlewares/authMiddleware.js";
import { validateRequest, validateParams } from "../middlewares/validateMiddleware.js";
import { getAllLocations, getLocationById, createLocation, updateLocation, deleteLocation } from "../controllers/locationController.js";
import { createLocationSchema, updateLocationSchema, idParamSchema } from "../validators/locationValidators.js";

const router = express.Router();
const lockAdmin = [verifyToken, verifyAdmin];

router.get("/", verifyToken, getAllLocations);
router.get("/:id", verifyToken, validateParams(idParamSchema), getLocationById);
router.post("/", verifyToken, validateRequest(createLocationSchema), createLocation);
router.patch("/:id", verifyToken, validateParams(idParamSchema), validateRequest(updateLocationSchema), updateLocation);
router.delete("/:id", lockAdmin, validateParams(idParamSchema), deleteLocation);

export default router;