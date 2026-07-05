import { Link } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-white text-2xl font-bold"
        >
          <FaShieldAlt className="text-cyan-400" />
          TruthLens AI
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-8 text-slate-300">
          <a href="#features" className="hover:text-cyan-400 transition">
            Features
          </a>

          <a href="#about" className="hover:text-cyan-400 transition">
            How It Works
          </a>

          <a href="#technology" className="hover:text-cyan-400 transition">
            Technology
          </a>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-4">

          <Link
            to="/dashboard"
            className="text-slate-300 hover:text-cyan-400 transition"
          >
            Dashboard
          </Link>

          <Link
            to="/login"
            className="text-slate-300 hover:text-white transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition"
          >
            Register
          </Link>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;