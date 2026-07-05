import { FaBrain, FaImage, FaChartLine, FaHistory } from "react-icons/fa";

const features = [
  {
    icon: <FaBrain />,
    title: "Text Analysis",
    description: "Uses BERT-based NLP to understand the meaning of news text.",
  },
  {
    icon: <FaImage />,
    title: "Image Analysis",
    description: "Uses CNN-based image models to analyze visual news content.",
  },
  {
    icon: <FaChartLine />,
    title: "Confidence Score",
    description: "Shows prediction results with confidence percentage.",
  },
  {
    icon: <FaHistory />,
    title: "Prediction History",
    description: "Stores previous predictions securely in MongoDB.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 px-6 bg-slate-900/40">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Powerful AI Features
        </h2>

        <p className="text-slate-400 text-center mb-12">
          TruthLens AI combines deep learning, NLP, computer vision, and web
          technology.
        </p>

        <div className="grid md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-cyan-400 transition"
            >
              <div className="text-cyan-400 text-4xl mb-4">
                {feature.icon}
              </div>

              <h3 className="text-xl font-semibold mb-2">
                {feature.title}
              </h3>

              <p className="text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;