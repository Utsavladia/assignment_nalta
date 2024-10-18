import express from "express";
import {
  driverLocation,
  nearbyDriver,
} from "../controllers/driverController.js";

const router = express.Router();

router.post("/location", driverLocation);
router.get("/nearby", nearbyDriver);

export default router;
