import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaImage,
  FaNewspaper,
  FaRobot,
} from "react-icons/fa";
import api from "../services/api";

const DetectNews = () => {
  const [formData, setFormData] = useState({
    newsTitle: "",
    newsText: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setPredictionResult(null);
    setIsLoading(true);

    try {
      const response = await api.post("/predictions", formData);

      setPredictionResult(response.data.prediction);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to analyze the news. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-8 transition"
        >
          <FaArrowLeft />
          Back to Dashboard
        </Link>

        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <FaRobot className="text-cyan-400 text-5xl" />
          </div>

          <h1 className="text-4xl font-bold">Detect Fake News</h1>

          <p className="text-slate-400 mt-3">
            Enter news text and optionally select an image for analysis.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8"
          >
            {message && (
              <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-400">
                {message}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-2">
                News Title
              </label>

              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-4">
                <FaNewspaper className="text-slate-500" />

                <input
                  type="text"
                  name="newsTitle"
                  value={formData.newsTitle}
                  onChange={handleChange}
                  placeholder="Enter the news title"
                  className="w-full bg-transparent px-3 py-3 outline-none"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-2">
                News Text
              </label>

              <textarea
                name="newsText"
                value={formData.newsText}
                onChange={handleChange}
                placeholder="Paste the complete news article here"
                rows="10"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none resize-none focus:border-cyan-400"
                required
              />
            </div>

            <div className="mb-8">
              <label className="block text-sm text-slate-300 mb-2">
                News Image
              </label>

              <label className="flex items-center justify-center gap-3 bg-slate-950 border-2 border-dashed border-slate-700 rounded-xl p-6 cursor-pointer hover:border-cyan-400 transition">
                <FaImage className="text-cyan-400 text-2xl" />

                <span className="text-slate-400">
                  {selectedImage
                    ? selectedImage.name
                    : "Choose an image from your computer"}
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              <p className="text-xs text-slate-500 mt-2">
                Image upload is displayed in the interface now. Backend image
                processing will be connected with the AI service later.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold py-4 rounded-xl transition"
            >
              {isLoading ? "Analyzing News..." : "Analyze News"}
            </button>
          </form>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 h-fit">
            <h2 className="text-2xl font-bold mb-6">Prediction Result</h2>

            {!predictionResult ? (
              <div className="text-center py-10">
                <FaRobot className="text-slate-700 text-6xl mx-auto mb-4" />

                <p className="text-slate-500">
                  Submit news content to see the prediction.
                </p>
              </div>
            ) : (
              <div>
                <div
                  className={`rounded-2xl p-6 text-center mb-5 ${
                    predictionResult.prediction === "Fake"
                      ? "bg-red-500/10 border border-red-500/40"
                      : "bg-green-500/10 border border-green-500/40"
                  }`}
                >
                  <p className="text-slate-400 mb-2">Prediction</p>

                  <h3
                    className={`text-4xl font-bold ${
                      predictionResult.prediction === "Fake"
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {predictionResult.prediction}
                  </h3>
                </div>

                <div className="bg-slate-950 rounded-xl p-5">
                  <p className="text-slate-400 mb-2">Confidence Score</p>

                  <p className="text-3xl font-bold text-cyan-400">
                    {predictionResult.confidence}%
                  </p>
                </div>

                <p className="text-xs text-slate-500 mt-5">
                  This is currently a temporary backend result. It will later be
                  replaced by the BERT and EfficientNet deep-learning models.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectNews;