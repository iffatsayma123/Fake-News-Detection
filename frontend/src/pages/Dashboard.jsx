import {
  FaNewspaper,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-slate-400 mt-2">
            Welcome to TruthLens AI.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <FaNewspaper className="text-cyan-400 text-3xl mb-4" />
            <p className="text-slate-400">Total Predictions</p>
            <h2 className="text-3xl font-bold mt-2">24</h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <FaTimesCircle className="text-red-400 text-3xl mb-4" />
            <p className="text-slate-400">Fake News</p>
            <h2 className="text-3xl font-bold mt-2">14</h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <FaCheckCircle className="text-green-400 text-3xl mb-4" />
            <p className="text-slate-400">Real News</p>
            <h2 className="text-3xl font-bold mt-2">10</h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <FaHistory className="text-blue-400 text-3xl mb-4" />
            <p className="text-slate-400">Saved History</p>
            <h2 className="text-3xl font-bold mt-2">24</h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Recent Predictions</h2>

            <div className="space-y-4">
              <div className="bg-slate-950 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">Breaking political news...</p>
                  <p className="text-sm text-slate-500">Text + Image Analysis</p>
                </div>
                <span className="text-red-400 font-bold">Fake</span>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">Economic update report...</p>
                  <p className="text-sm text-slate-500">Text Analysis</p>
                </div>
                <span className="text-green-400 font-bold">Real</span>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">Viral social media claim...</p>
                  <p className="text-sm text-slate-500">Image Analysis</p>
                </div>
                <span className="text-red-400 font-bold">Fake</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>

            <div className="space-y-4">
              <Link
                to="/detect-news"
                className="block bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-center font-bold py-3 rounded-xl"
              >
                Detect News
              </Link>

              <Link
                to="/history"
                className="block bg-slate-950 hover:bg-slate-800 text-center font-semibold py-3 rounded-xl"
              >
                View History
              </Link>

              <Link
                to="/profile"
                className="block bg-slate-950 hover:bg-slate-800 text-center font-semibold py-3 rounded-xl"
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