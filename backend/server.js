import "dotenv/config";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import PredictionRoutes from "./routes/PredictionRoutes.js";


const app = express();


/*
============================================================
ENVIRONMENT VARIABLES
============================================================
*/

const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI;

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ||
  "http://127.0.0.1:8001";


/*
============================================================
MIDDLEWARE
============================================================
*/

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);


/*
============================================================
ROOT ROUTE
============================================================
*/

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "TruthLens backend is running",
    status: "healthy",
  });
});


/*
============================================================
HEALTH CHECK
============================================================
*/

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "healthy",
    service: "TruthLens Backend",
  });
});


/*
============================================================
API ROUTES
============================================================
*/

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/predictions",
  predictionRoutes
);


/*
============================================================
404 HANDLER
============================================================
*/

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


/*
============================================================
CHECK REQUIRED ENVIRONMENT VARIABLES
============================================================
*/

if (!MONGO_URI) {
  console.error(
    "ERROR: MONGO_URI is missing from environment variables."
  );

  process.exit(1);
}


if (!process.env.JWT_SECRET) {
  console.error(
    "ERROR: JWT_SECRET is missing from environment variables."
  );

  process.exit(1);
}


/*
============================================================
DATABASE CONNECTION + SERVER START
============================================================
*/

const startServer = async () => {
  try {

    /*
    --------------------------------------------------------
    CONNECT TO MONGODB
    --------------------------------------------------------
    */

    await mongoose.connect(
      MONGO_URI
    );

    console.log(
      "MongoDB connected successfully"
    );


    /*
    --------------------------------------------------------
    DISPLAY AI SERVICE
    --------------------------------------------------------
    */

    console.log(
      "AI Service URL:",
      AI_SERVICE_URL
    );


    /*
    --------------------------------------------------------
    START EXPRESS SERVER
    --------------------------------------------------------
    */

    app.listen(
      PORT,
      "0.0.0.0",
      () => {

        console.log(
          `TruthLens backend running on port ${PORT}`
        );

      }
    );

  } catch (error) {

    console.error(
      "Server startup error:",
      error.message
    );

    process.exit(1);

  }
};


startServer();