import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import About from "../components/About";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import RatingDisplay from "../components/RatingDisplay";



const Landing = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <About />
      <Contact />
      <RatingDisplay />
      <Footer />
    </>
  );
};

export default Landing;
