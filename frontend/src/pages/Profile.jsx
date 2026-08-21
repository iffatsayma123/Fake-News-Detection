import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaUserShield,
  FaCalendarAlt,
  FaSignOutAlt,
} from "react-icons/fa";

const Profile = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 mb-8 transition"
        >
          <FaArrowLeft />
          Back to Dashboard
        </Link>

        <div className="mb-10">

          <h1 className="text-4xl font-bold">
            Profile
          </h1>

          <p className="text-slate-400 mt-3">
            View your TruthLens AI account information.
          </p>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

          <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-10">

            <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">

              <FaUser className="text-cyan-400 text-3xl" />

            </div>

            <div>

              <h2 className="text-3xl font-bold">
                {user?.name || "User"}
              </h2>

              <p className="text-slate-400 mt-1">
                TruthLens AI Account
              </p>

            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">

              <div className="flex items-center gap-3 mb-3">

                <FaUser className="text-cyan-400" />

                <p className="text-slate-400">
                  Name
                </p>

              </div>

              <p className="text-xl font-semibold">
                {user?.name || "Not available"}
              </p>

            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">

              <div className="flex items-center gap-3 mb-3">

                <FaEnvelope className="text-cyan-400" />

                <p className="text-slate-400">
                  Email
                </p>

              </div>

              <p className="text-xl font-semibold break-all">
                {user?.email || "Not available"}
              </p>

            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">

              <div className="flex items-center gap-3 mb-3">

                <FaUserShield className="text-cyan-400" />

                <p className="text-slate-400">
                  Role
                </p>

              </div>

              <p className="text-xl font-semibold capitalize">
                {user?.role || "user"}
              </p>

            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">

              <div className="flex items-center gap-3 mb-3">

                <FaCalendarAlt className="text-cyan-400" />

                <p className="text-slate-400">
                  Account Status
                </p>

              </div>

              <p className="text-xl font-semibold text-green-400">
                Active
              </p>

            </div>

          </div>

          <div className="mt-8 border-t border-slate-800 pt-8">

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/40 text-red-400 px-5 py-3 rounded-xl hover:bg-red-500/20 transition"
            >
              <FaSignOutAlt />
              Logout
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;