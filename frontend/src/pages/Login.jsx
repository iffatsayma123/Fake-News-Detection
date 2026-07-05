import { Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaShieldAlt } from "react-icons/fa";

const Login = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FaShieldAlt className="text-cyan-400 text-5xl" />
          </div>

          <h1 className="text-3xl font-bold">Welcome Back</h1>

          <p className="text-slate-400 mt-2">
            Login to continue to TruthLens AI
          </p>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Email Address
            </label>

            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-4">
              <FaEnvelope className="text-slate-500" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent px-3 py-3 outline-none text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Password
            </label>

            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-4">
              <FaLock className="text-slate-500" />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full bg-transparent px-3 py-3 outline-none text-white placeholder-slate-500"
              />
            </div>
          </div>

          <button
            type="button"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-cyan-400 hover:underline">
            Register
          </Link>
        </p>

        <Link
          to="/"
          className="block text-center text-slate-500 hover:text-cyan-400 mt-4 text-sm"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Login;