import axios from "axios";
import Prediction from "../models/Prediction.js";

export const createPrediction = async (req, res) => {
  try {
    const { newsTitle, newsText } = req.body;

    if (!newsTitle || !newsText) {
      return res.status(400).json({
        success: false,
        message: "News title and news text are required",
      });
    }

    const aiResponse = await axios.post("http://127.0.0.1:8000/predict", {
      newsTitle: newsTitle.trim(),
      newsText: newsText.trim(),
    });

    const aiResult = aiResponse.data;

    const prediction = await Prediction.create({
      userId: req.user._id,
      newsTitle: newsTitle.trim(),
      newsText: newsText.trim(),
      prediction: aiResult.prediction,
      confidence: aiResult.confidence,
      textConfidence: aiResult.textConfidence,
      imageConfidence: aiResult.imageConfidence,
    });

    return res.status(201).json({
      success: true,
      message: "Prediction completed successfully",
      prediction,
    });
  } catch (error) {
    console.error(
      "Prediction error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "AI service is unavailable or prediction failed",
    });
  }
};

export const getPredictionHistory = async (req, res) => {
  try {
    const predictions = await Prediction.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: predictions.length,
      predictions,
    });
  } catch (error) {
    console.error("History error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load prediction history",
    });
  }
};