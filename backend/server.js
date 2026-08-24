import "dotenv/config";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import predictionRoutes from "./routes/PredictionRoutes.js";

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
BACKEND HEALTH CHECK
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
FULL PROJECT WAKE-UP / HEALTH CHECK
============================================================

This endpoint is called automatically by the frontend.

Flow:

Frontend
   ↓
Backend wakes
   ↓
Backend calls AI service /health
   ↓
AI service wakes
   ↓
BERT V4 + EfficientNet V2 load

============================================================
*/

app.get(
  "/api/health/full",
  async (req, res) => {

    let aiStatus = "starting";

    let aiData = null;


    try {

      /*
      --------------------------------------------------------
      WAKE / CHECK AI SERVICE
      --------------------------------------------------------
      */

      const controller =
        new AbortController();


      const timeoutId =
        setTimeout(
          () => {
            controller.abort();
          },
          120000
        );


      const aiResponse =
        await fetch(
          `${AI_SERVICE_URL}/health`,
          {
            method: "GET",

            signal:
              controller.signal,
          }
        );


      clearTimeout(
        timeoutId
      );


      /*
      --------------------------------------------------------
      PROCESS AI RESPONSE
      --------------------------------------------------------
      */

      if (
        aiResponse.ok
      ) {

        aiData =
          await aiResponse.json();


        if (
          aiData?.status ===
          "healthy"
        ) {

          aiStatus =
            "ready";

        } else {

          aiStatus =
            "starting";
        }

      } else {

        aiStatus =
          "starting";
      }


    } catch (error) {

      /*
      --------------------------------------------------------
      FREE RENDER SERVICES MAY STILL BE WAKING
      --------------------------------------------------------

      Do not crash the backend.

      The frontend can simply retry later.
      --------------------------------------------------------
      */

      console.log(
        "AI wake-up status:",
        error.message
      );


      aiStatus =
        "starting";
    }


    /*
    --------------------------------------------------------
    RETURN FULL PROJECT STATUS
    --------------------------------------------------------
    */

    return res
      .status(200)
      .json({

        success:
          true,


        backend:
          "ready",


        ai:
          aiStatus,


        project:
          aiStatus ===
          "ready"
            ? "ready"
            : "starting",


        message:
          aiStatus ===
          "ready"
            ? "TruthLens is ready"
            : "TruthLens AI service is waking up",


        aiDetails:
          aiData,
      });

  }
);


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

app.use(
  (req, res) => {

    return res
      .status(404)
      .json({

        success:
          false,

        message:
          "Route not found",
      });

  }
);


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


if (
  !process.env.JWT_SECRET
) {

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

const startServer =
  async () => {

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
      DISPLAY AI SERVICE URL
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