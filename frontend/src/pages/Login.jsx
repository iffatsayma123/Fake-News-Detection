import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaShieldAlt } from "react-icons/fa";
import api from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <FaShieldAlt className="text-cyan-400 text-5xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Welcome</h1>
          <p className="text-slate-400 mt-2">
            Login to continue to TruthLens AI
          </p>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-center text-red-400">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Email Address
            </label>

            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-4">
              <FaEnvelope className="text-slate-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full bg-transparent px-3 py-3 outline-none"
                required
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full bg-transparent px-3 py-3 outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 text-slate-950 font-bold py-3 rounded-xl transition"
          >
            {isLoading ? "Logging In..." : "Login"}
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