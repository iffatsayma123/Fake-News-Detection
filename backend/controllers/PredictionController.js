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

    const randomConfidence = Number(
      (80 + Math.random() * 19).toFixed(2)
    );

    const temporaryPrediction =
      Math.random() > 0.5 ? "Real" : "Fake";

    const prediction = await Prediction.create({
      userId: req.user._id,
      newsTitle,
      newsText,
      prediction: temporaryPrediction,
      confidence: randomConfidence,
      textConfidence: randomConfidence,
      imageConfidence: 0,
    });

    return res.status(201).json({
      success: true,
      message: "Prediction completed successfully",
      prediction,
    });
  } catch (error) {
    console.error("Prediction error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during prediction",
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