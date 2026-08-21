import express from "express";
import multer from "multer";
import protect from "../middleware/authMiddleware.js";

import {
  createPrediction,
  getPredictionHistory,
  deletePrediction,
  clearPredictionHistory,
} from "../controllers/PredictionController.js";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      allowedTypes.includes(
        file.mimetype
      )
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, PNG, and WEBP images are allowed"
        )
      );
    }
  },
});


/*
============================================================
CREATE PREDICTION
POST /api/predictions
============================================================
*/

router.post(
  "/",
  protect,
  upload.single("image"),
  createPrediction
);


/*
============================================================
GET HISTORY
GET /api/predictions
============================================================
*/

router.get(
  "/",
  protect,
  getPredictionHistory
);


/*
============================================================
DELETE PREDICTION
DELETE /api/predictions/:id
============================================================
*/

router.delete(
  "/clear",
  protect,
  clearPredictionHistory
);

router.delete(
  "/:id",
  protect,
  deletePrediction
);


export default router;