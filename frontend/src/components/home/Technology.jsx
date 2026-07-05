import {
  FaReact,
  FaNodeJs,
  FaPython,
} from "react-icons/fa";

import {
  SiMongodb,
  SiTensorflow,
  SiFastapi,
} from "react-icons/si";

const technologies = [
  {
    name: "React",
    icon: <FaReact className="text-cyan-400 text-5xl" />,
  },
  {
    name: "Node.js",
    icon: <FaNodeJs className="text-green-500 text-5xl" />,
  },
  {
    name: "Python",
    icon: <FaPython className="text-yellow-400 text-5xl" />,
  },
  {
    name: "MongoDB",
    icon: <SiMongodb className="text-green-400 text-5xl" />,
  },
  {
    name: "TensorFlow",
    icon: <SiTensorflow className="text-orange-500 text-5xl" />,
  },
  {
    name: "FastAPI",
    icon: <SiFastapi className="text-cyan-300 text-5xl" />,
  },
];

const Technology = () => {
  return (
    <section
  id="technology"
  className="py-20 px-6 bg-slate-900/40"
>
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Technology Stack
        </h2>

        <p className="text-slate-400 mb-12">
          Built using modern web development and deep learning technologies.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {technologies.map((tech, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-400 transition duration-300"
            >
              <div className="flex justify-center mb-4">
                {tech.icon}
              </div>

              <p className="font-semibold">{tech.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Technology;