import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createPrediction,
  getPredictionHistory,
} from "../controllers/predictionController.js";

const router = express.Router();

router.post("/", protect, createPrediction);
router.get("/", protect, getPredictionHistory);

export default router;