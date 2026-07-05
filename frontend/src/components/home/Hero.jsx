import { Link } from "react-router-dom";
import { FaBrain, FaShieldAlt, FaImage } from "react-icons/fa";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-cyan-400 font-semibold mb-4">
            AI-Powered Fake News Detection
          </p>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            See Beyond the Headlines with{" "}
            <span className="text-cyan-400">TruthLens AI</span>
          </h1>

          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            Analyze news text, images, and screenshots using multimodal deep
            learning models such as BERT and EfficientNet.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/login"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 py-3 rounded-lg text-center transition"
            >
              Detect News
            </Link>

            <a
              href="#features"
              className="border border-slate-700 hover:border-cyan-400 text-white px-6 py-3 rounded-lg text-center transition"
            >
              Learn More
            </a>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <span className="text-slate-400">AI Analysis</span>
              <span className="text-green-400 text-sm">Active</span>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900 rounded-xl p-4 flex items-center gap-4">
                <FaBrain className="text-cyan-400 text-2xl" />
                <div>
                  <p className="text-slate-400 text-sm">Text Model</p>
                  <p className="text-white font-semibold">BERT NLP Engine</p>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 flex items-center gap-4">
                <FaImage className="text-blue-400 text-2xl" />
                <div>
                  <p className="text-slate-400 text-sm">Image Model</p>
                  <p className="text-white font-semibold">EfficientNet CNN</p>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 flex items-center gap-4">
                <FaShieldAlt className="text-red-400 text-2xl" />
                <div>
                  <p className="text-slate-400 text-sm">Prediction</p>
                  <p className="text-red-400 text-2xl font-bold">
                    Fake News - 96.4%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;