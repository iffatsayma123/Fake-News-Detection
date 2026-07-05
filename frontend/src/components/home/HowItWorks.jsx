import { FaUpload, FaRobot, FaBrain, FaCheckCircle } from "react-icons/fa";

const steps = [
  {
    icon: <FaUpload />,
    title: "Upload News",
    text: "User submits news text, image, screenshot, or both.",
  },
  {
    icon: <FaRobot />,
    title: "Preprocessing",
    text: "System cleans text, resizes images, and prepares input.",
  },
  {
    icon: <FaBrain />,
    title: "AI Analysis",
    text: "BERT analyzes text and EfficientNet analyzes images.",
  },
  {
    icon: <FaCheckCircle />,
    title: "Prediction",
    text: "System shows Fake/Real result with confidence score.",
  },
];

const HowItWorks = () => {
  return (
    <section id="about" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          How It Works
        </h2>

        <p className="text-slate-400 text-center mb-12">
          A simple workflow powered by multimodal deep learning.
        </p>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center"
            >
              <div className="text-cyan-400 text-4xl mb-4 flex justify-center">
                {step.icon}
              </div>

              <div className="w-10 h-10 mx-auto mb-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold">
                {index + 1}
              </div>

              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>

              <p className="text-slate-400">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;