import Navbar from "../components/common/Navbar";
import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import HowItWorks from "../components/home/HowItWorks";
import Technology from "../components/home/Technology";
import CTA from "../components/home/CTA";
import Footer from "../components/common/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Technology />
      <CTA />
      <Footer />
    </div>
  );
};

export default Home;