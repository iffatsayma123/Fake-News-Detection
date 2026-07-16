import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    newsTitle: {
      type: String,
      required: true,
    },

    newsText: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    prediction: {
      type: String,
      enum: ["Real", "Fake"],
      default: "Real",
    },

    confidence: {
      type: Number,
      default: 0,
    },

    textConfidence: {
      type: Number,
      default: 0,
    },

    imageConfidence: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Prediction", predictionSchema);