import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
  FaTrash,
  FaTrashAlt,
} from "react-icons/fa";

import api from "../services/api";


const History = () => {

  const [
    predictions,
    setPredictions
  ] = useState([]);

  const [
    isLoading,
    setIsLoading
  ] = useState(true);

  const [
    message,
    setMessage
  ] = useState("");

  const [
    deletingId,
    setDeletingId
  ] = useState(null);

  const [
    isClearing,
    setIsClearing
  ] = useState(false);


  /*
  ============================================================
  LOAD PREDICTION HISTORY
  ============================================================
  */

  const loadHistory = async () => {

    try {

      const response =
        await api.get(
          "/predictions"
        );

      setPredictions(
        response.data.predictions
      );

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Unable to load prediction history."
      );

    } finally {

      setIsLoading(false);

    }

  };


  useEffect(() => {

    loadHistory();

  }, []);


  /*
  ============================================================
  DELETE SINGLE PREDICTION
  ============================================================
  */

  const handleDelete = async (
    predictionId
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this prediction?"
      );

    if (!confirmed) {
      return;
    }


    setDeletingId(
      predictionId
    );

    setMessage("");


    try {

      await api.delete(
        `/predictions/${predictionId}`
      );


      setPredictions(
        (currentPredictions) =>
          currentPredictions.filter(
            (item) =>
              item._id !== predictionId
          )
      );

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Unable to delete prediction."
      );

    } finally {

      setDeletingId(null);

    }

  };


  /*
  ============================================================
  CLEAR ALL HISTORY
  ============================================================
  */

  const handleClearHistory = async () => {

    if (predictions.length === 0) {
      return;
    }


    const confirmed =
      window.confirm(
        "Are you sure you want to delete ALL prediction history? This action cannot be undone."
      );

    if (!confirmed) {
      return;
    }


    setIsClearing(true);

    setMessage("");


    try {

      await api.delete(
        "/predictions/clear"
      );


      setPredictions([]);


    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Unable to clear prediction history."
      );

    } finally {

      setIsClearing(false);

    }

  };


  return (

    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">

      <div className="max-w-6xl mx-auto">


        {/* TOP NAVIGATION */}

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between mb-8">

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition"
          >

            <FaArrowLeft />

            Back to Dashboard

          </Link>


          {predictions.length > 0 && (

            <button
              onClick={handleClearHistory}
              disabled={isClearing}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >

              <FaTrashAlt />

              {isClearing
                ? "Clearing..."
                : "Clear All History"}

            </button>

          )}

        </div>


        {/* PAGE TITLE */}

        <div className="mb-10">

          <div className="flex items-center gap-3 mb-3">

            <FaHistory className="text-cyan-400 text-4xl" />

            <h1 className="text-4xl font-bold">
              Prediction History
            </h1>

          </div>


          <p className="text-slate-400">
            Review and manage all AI news predictions saved in your account.
          </p>

        </div>


        {/* ERROR MESSAGE */}

        {message && (

          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-400">

            {message}

          </div>

        )}


        {/* LOADING */}

        {isLoading ? (

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

            <p className="text-slate-400">
              Loading prediction history...
            </p>

          </div>

        ) : predictions.length === 0 ? (

          /* EMPTY HISTORY */

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

            <FaHistory className="text-slate-700 text-6xl mx-auto mb-4" />


            <h2 className="text-2xl font-bold mb-2">

              No prediction history yet

            </h2>


            <p className="text-slate-400 mb-6">

              Analyze your first news article to create a history record.

            </p>


            <Link
              to="/detect-news"
              className="inline-block bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition"
            >

              Detect News

            </Link>

          </div>

        ) : (

          /* HISTORY ITEMS */

          <div className="space-y-5">

            {predictions.map(
              (item) => (

                <div
                  key={item._id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                >

                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">


                    {/* NEWS INFORMATION */}

                    <div className="flex-1">

                      <h2 className="text-xl font-bold mb-2">

                        {item.newsTitle}

                      </h2>


                      <p className="text-slate-400 line-clamp-2 mb-3">

                        {item.newsText}

                      </p>


                      <p className="text-sm text-slate-500">

                        {new Date(
                          item.createdAt
                        ).toLocaleString()}

                      </p>

                    </div>


                    {/* RESULT INFORMATION */}

                    <div className="flex flex-wrap items-center gap-4">


                      {/* CONFIDENCE */}

                      <div>

                        <p className="text-sm text-slate-500 mb-1">

                          Model Confidence

                        </p>


                        <p className="text-2xl font-bold text-cyan-400">

                          {Number(
                            item.confidence
                          ).toFixed(2)}
                          %

                        </p>

                      </div>


                      {/* PREDICTION */}

                      <div
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold ${
                          item.prediction ===
                          "Fake"
                            ? "bg-red-500/10 text-red-400 border border-red-500/40"
                            : "bg-green-500/10 text-green-400 border border-green-500/40"
                        }`}
                      >

                        {item.prediction ===
                        "Fake" ? (

                          <FaTimesCircle />

                        ) : (

                          <FaCheckCircle />

                        )}


                        {item.prediction}

                      </div>


                      {/* DELETE BUTTON */}

                      <button
                        onClick={() =>
                          handleDelete(
                            item._id
                          )
                        }
                        disabled={
                          deletingId ===
                          item._id ||
                          isClearing
                        }
                        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >

                        <FaTrash />

                        {deletingId ===
                        item._id
                          ? "Deleting..."
                          : "Delete"}

                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>

  );

};

export default History;