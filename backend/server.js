import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDatabase from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";

dotenv.config();

const app = express();

connectDatabase();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TruthLens AI Backend is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/predictions", predictionRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});