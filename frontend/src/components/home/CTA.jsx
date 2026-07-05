import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl p-10 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Ready to Verify the Truth?
        </h2>

        <p className="text-white/90 text-lg mb-8">
          Upload news text or images and let our AI determine whether the
          information is genuine or fake.
        </p>

        <Link
          to="/login"
          className="inline-block bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-200 transition"
        >
          Start Detecting
        </Link>
      </div>
    </section>
  );
};

export default CTA;