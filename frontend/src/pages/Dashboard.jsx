import { useEffect, useMemo, useState } from "react";
import {
  FaNewspaper,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadPredictions = async () => {
      try {
        const response = await api.get("/predictions");
        setPredictions(response.data.predictions || []);
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Unable to load dashboard information."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPredictions();
  }, []);

  const statistics = useMemo(() => {
    const total = predictions.length;

    const fake = predictions.filter(
      (item) => item.prediction === "Fake"
    ).length;

    const real = predictions.filter(
      (item) => item.prediction === "Real"
    ).length;

    return {
      total,
      fake,
      real,
    };
  }, [predictions]);

  const recentPredictions = predictions.slice(0, 3);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>

            <p className="text-slate-400 mt-2">
              Welcome,{" "}
              <span className="text-cyan-400 font-semibold">
                {user?.name || "User"}
              </span>
              .
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/40 text-red-400 px-5 py-3 rounded-xl hover:bg-red-500/20 transition"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-400">
            {message}
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <FaNewspaper className="text-cyan-400 text-3xl mb-4" />
            <p className="text-slate-400">Total Predictions</p>
            <h2 className="text-3xl font-bold mt-2">
              {isLoading ? "..." : statistics.total}
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <FaTimesCircle className="text-red-400 text-3xl mb-4" />
            <p className="text-slate-400">Fake News</p>
            <h2 className="text-3xl font-bold mt-2">
              {isLoading ? "..." : statistics.fake}
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <FaCheckCircle className="text-green-400 text-3xl mb-4" />
            <p className="text-slate-400">Real News</p>
            <h2 className="text-3xl font-bold mt-2">
              {isLoading ? "..." : statistics.real}
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <FaHistory className="text-blue-400 text-3xl mb-4" />
            <p className="text-slate-400">Saved History</p>
            <h2 className="text-3xl font-bold mt-2">
              {isLoading ? "..." : statistics.total}
            </h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">
              Recent Predictions
            </h2>

            {isLoading ? (
              <p className="text-slate-400">
                Loading recent predictions...
              </p>
            ) : recentPredictions.length === 0 ? (
              <div className="bg-slate-950 rounded-xl p-6 text-center">
                <p className="text-slate-400">
                  No predictions have been created yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPredictions.map((item) => (
                  <div
                    key={item._id}
                    className="bg-slate-950 rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center"
                  >
                    <div>
                      <p className="font-semibold">
                        {item.newsTitle}
                      </p>

                      <p className="text-sm text-slate-500">
                        Confidence: {item.confidence}%
                      </p>
                    </div>

                    <span
                      className={`font-bold ${
                        item.prediction === "Fake"
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {item.prediction}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>

            <div className="space-y-4">
              <Link
                to="/detect-news"
                className="block bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-center font-bold py-3 rounded-xl transition"
              >
                Detect News
              </Link>

              <Link
                to="/history"
                className="block bg-slate-950 hover:bg-slate-800 text-center font-semibold py-3 rounded-xl transition"
              >
                View History
              </Link>

              <Link
                to="/profile"
                className="block bg-slate-950 hover:bg-slate-800 text-center font-semibold py-3 rounded-xl transition"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;