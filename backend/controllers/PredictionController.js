import axios from "axios";
import FormData from "form-data";
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "News image is required",
      });
    }

    const formData = new FormData();

    formData.append(
      "newsTitle",
      newsTitle.trim()
    );

    formData.append(
      "newsText",
      newsText.trim()
    );

    formData.append(
      "image",
      req.file.buffer,
      {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      }
    );

    const aiResponse = await axios.post(
      "http://127.0.0.1:8001/predict",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },

        maxBodyLength: Infinity,
        maxContentLength: Infinity,

        timeout: 120000,
      }
    );

    const aiResult = aiResponse.data;

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        message:
          aiResult.message ||
          "AI prediction failed",
      });
    }

    const prediction = await Prediction.create({
      userId: req.user._id,

      newsTitle: newsTitle.trim(),

      newsText: newsText.trim(),

      image: req.file.originalname,

      prediction: aiResult.prediction,

      confidence: aiResult.confidence,

      textConfidence: 0,

      imageConfidence: 0,
    });

    return res.status(201).json({
      success: true,

      message:
        "Multimodal prediction completed successfully",

      prediction,

      aiDetails: {
        predictedClass:
          aiResult.predictedClass,

        realProbability:
          aiResult.realProbability,

        fakeProbability:
          aiResult.fakeProbability,

        models:
          aiResult.models,
      },
    });
  } catch (error) {
    console.error(
      "Prediction error:",
      error.response?.data ||
        error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "AI service is unavailable or prediction failed",
    });
  }
};


export const getPredictionHistory = async (
  req,
  res
) => {
  try {
    const predictions =
      await Prediction.find({
        userId: req.user._id,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: predictions.length,
      predictions,
    });
  } catch (error) {
    console.error(
      "History error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load prediction history",
    });
  }
};


/*
============================================================
DELETE SINGLE PREDICTION
============================================================
*/

export const deletePrediction = async (
  req,
  res
) => {
  try {
    const prediction =
      await Prediction.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message:
          "Prediction not found or you do not have permission to delete it",
      });
    }

    await prediction.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "Prediction deleted successfully",
    });

  } catch (error) {
    console.error(
      "Delete prediction error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete prediction",
    });
  }
};
export const clearPredictionHistory = async (req, res) => {
  try {
    const result = await Prediction.deleteMany({
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Prediction history cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to clear prediction history",
    });
  }
};