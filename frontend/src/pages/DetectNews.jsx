import { useState } from "react";
import { Link } from "react-router-dom";

import {
  FaArrowLeft,
  FaImage,
  FaNewspaper,
  FaRobot,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
} from "react-icons/fa";

import api from "../services/api";


const DetectNews = () => {

  const [formData, setFormData] = useState({
    newsTitle: "",
    newsText: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);

  const [predictionResult, setPredictionResult] =
    useState(null);

  const [aiDetails, setAiDetails] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);


  /*
  ============================================================
  HANDLE TEXT INPUT
  ============================================================
  */

  const handleChange = (event) => {

    setFormData({
      ...formData,
      [event.target.name]:
        event.target.value,
    });

  };


  /*
  ============================================================
  HANDLE IMAGE
  ============================================================
  */

  const handleImageChange = (event) => {

    const file =
      event.target.files[0];


    if (!file) {

      setSelectedImage(null);

      return;

    }


    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      setMessage(
        "Please select a JPG, PNG, or WEBP image."
      );

      setSelectedImage(null);

      return;

    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {

      setMessage(
        "Image size must be less than 5 MB."
      );

      setSelectedImage(null);

      return;

    }


    setMessage("");

    setSelectedImage(file);

  };


  /*
  ============================================================
  SUBMIT NEWS FOR AI ANALYSIS
  ============================================================
  */

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    setMessage("");

    setPredictionResult(null);

    setAiDetails(null);


    if (!selectedImage) {

      setMessage(
        "Please select a news image before analysis."
      );

      return;

    }


    setIsLoading(true);


    try {

      const requestData =
        new FormData();


      requestData.append(
        "newsTitle",
        formData.newsTitle
      );


      requestData.append(
        "newsText",
        formData.newsText
      );


      requestData.append(
        "image",
        selectedImage
      );


      const response =
        await api.post(
          "/predictions",
          requestData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );


      setPredictionResult(
        response.data.prediction
      );


      setAiDetails(
        response.data.aiDetails ||
        null
      );


    } catch (error) {

      console.error(
        "Prediction error:",
        error
      );


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


        {/* BACK BUTTON */}

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-8 transition"
        >

          <FaArrowLeft />

          Back to Dashboard

        </Link>


        {/* PAGE HEADER */}

        <div className="text-center mb-10">

          <div className="flex justify-center mb-4">

            <FaRobot className="text-cyan-400 text-5xl" />

          </div>


          <h1 className="text-4xl font-bold">

            Detect Fake News

          </h1>


          <p className="text-slate-400 mt-3 max-w-2xl mx-auto">

            Analyze news using BERT-based text features,
            EfficientNet V2 image predictions, and multimodal
            feature fusion.

          </p>

        </div>


        <div className="grid lg:grid-cols-3 gap-8">


          {/* ==================================================
              INPUT FORM
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8"
          >


            {/* ERROR MESSAGE */}

            {message && (

              <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-400">

                {message}

              </div>

            )}


            {/* NEWS TITLE */}

            <div className="mb-6">

              <label className="block text-sm text-slate-300 mb-2">

                News Title

              </label>


              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-4">

                <FaNewspaper className="text-slate-500" />


                <input
                  type="text"
                  name="newsTitle"
                  value={
                    formData.newsTitle
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter the news title"
                  className="w-full bg-transparent px-3 py-3 outline-none"
                  required
                />

              </div>

            </div>


            {/* NEWS TEXT */}

            <div className="mb-6">

              <label className="block text-sm text-slate-300 mb-2">

                News Text

              </label>


              <textarea
                name="newsText"
                value={
                  formData.newsText
                }
                onChange={
                  handleChange
                }
                placeholder="Paste the news article or description here"
                rows="10"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none resize-none focus:border-cyan-400"
                required
              />

            </div>


            {/* NEWS IMAGE */}

            <div className="mb-8">

              <label className="block text-sm text-slate-300 mb-2">

                News Image

              </label>


              <label className="flex items-center justify-center gap-3 bg-slate-950 border-2 border-dashed border-slate-700 rounded-xl p-6 cursor-pointer hover:border-cyan-400 transition">

                <FaImage className="text-cyan-400 text-2xl" />


                <span className="text-slate-400 text-center">

                  {selectedImage
                    ? selectedImage.name
                    : "Choose a JPG, PNG, or WEBP image"}

                </span>


                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />

              </label>


              <p className="text-xs text-slate-500 mt-2">

                Maximum file size: 5 MB.
                The selected image is analyzed using
                EfficientNet V2.

              </p>

            </div>


            {/* ANALYZE BUTTON */}

            <button
              type="submit"
              disabled={
                isLoading
              }
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold py-4 rounded-xl transition"
            >

              {isLoading
                ? "Analyzing with AI..."
                : "Analyze News"}

            </button>


            {/* AI DISCLAIMER */}

            <div className="mt-6 flex gap-3 bg-slate-950 border border-slate-800 rounded-xl p-4">

              <FaInfoCircle className="text-cyan-400 mt-1 shrink-0" />


              <p className="text-xs leading-5 text-slate-500">

                TruthLens AI provides a model-generated
                classification based on patterns learned
                from text and image data. The result should
                not be treated as independent factual
                verification. Important claims should also
                be checked using reliable sources.

              </p>

            </div>

          </form>


          {/* ==================================================
              RESULT SECTION
          ================================================== */}

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 h-fit">


            <h2 className="text-2xl font-bold mb-6">

              AI Prediction

            </h2>


            {!predictionResult ? (

              <div className="text-center py-10">

                <FaRobot className="text-slate-700 text-6xl mx-auto mb-4" />


                <p className="text-slate-500">

                  Submit news text and an image to
                  receive the model prediction.

                </p>

              </div>

            ) : (

              <div>


                {/* PREDICTION CARD */}

                <div
                  className={`rounded-2xl p-6 text-center mb-5 ${
                    predictionResult.prediction ===
                    "Fake"
                      ? "bg-red-500/10 border border-red-500/40"
                      : "bg-green-500/10 border border-green-500/40"
                  }`}
                >


                  <div className="flex justify-center mb-3">

                    {predictionResult.prediction ===
                    "Fake" ? (

                      <FaTimesCircle className="text-red-400 text-4xl" />

                    ) : (

                      <FaCheckCircle className="text-green-400 text-4xl" />

                    )}

                  </div>


                  <p className="text-slate-400 mb-2">

                    Model Classification

                  </p>


                  <h3
                    className={`text-4xl font-bold ${
                      predictionResult.prediction ===
                      "Fake"
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >

                    {predictionResult.prediction}

                  </h3>


                  <p className="text-sm text-slate-500 mt-2">

                    News

                  </p>

                </div>


                {/* MODEL CONFIDENCE */}

                <div className="bg-slate-950 rounded-xl p-5 mb-4">

                  <p className="text-slate-400 mb-2">

                    Model Confidence

                  </p>


                  <p className="text-3xl font-bold text-cyan-400">

                    {Number(
                      predictionResult.confidence
                    ).toFixed(2)}
                    %

                  </p>

                </div>


                {/* PROBABILITIES */}

                {aiDetails && (

                  <div className="space-y-3">


                    {aiDetails.realProbability !==
                      undefined && (

                      <div className="bg-slate-950 rounded-xl p-4">

                        <p className="text-sm text-slate-400">

                          Real Class Score

                        </p>


                        <p className="text-lg font-bold text-green-400">

                          {Number(
                            aiDetails.realProbability
                          ).toFixed(2)}
                          %

                        </p>

                      </div>

                    )}


                    {aiDetails.fakeProbability !==
                      undefined && (

                      <div className="bg-slate-950 rounded-xl p-4">

                        <p className="text-sm text-slate-400">

                          Fake Class Score

                        </p>


                        <p className="text-lg font-bold text-red-400">

                          {Number(
                            aiDetails.fakeProbability
                          ).toFixed(2)}
                          %

                        </p>

                      </div>

                    )}

                  </div>

                )}


                {/* MODEL INFORMATION */}

                <div className="mt-5 border-t border-slate-800 pt-5">

                  <p className="text-xs text-slate-500 mb-3">

                    AI Architecture

                  </p>


                  <p className="text-sm text-slate-400">

                    Text Model: BERT V4 QUInt8

                  </p>


                  <p className="text-sm text-slate-400">

                    Image Model: EfficientNet V2

                  </p>


                  <p className="text-sm text-slate-400">

                    Fusion: 50/50 Probability Late Fusion

                  </p>

                </div>


                {/* RESULT DISCLAIMER */}

                <div className="mt-5 flex gap-3 border-t border-slate-800 pt-5">

                  <FaInfoCircle className="text-cyan-400 mt-1 shrink-0" />


                  <p className="text-xs leading-5 text-slate-500">

                    This is an AI-generated classification,
                    not a guaranteed determination of factual
                    truth.

                  </p>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>

  );

};


export default DetectNews;

