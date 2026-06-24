import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";

const Hero = () => {
  const { navigate } = useContext(AppContext);

  // Typewriter effect states
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Welcome to the Dolce Vita Experience';

  // Typewriter effect
  useEffect(() => {
    setDisplayText('');
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < fullText.length) {
        setDisplayText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 80);
    return () => clearInterval(typeInterval);
  }, []);

  // Function to render text with orange "Dolce Vita"
  const renderTypedText = () => {
    const beforeDolceVita = 'Welcome to the ';
    const dolceVita = 'Dolce Vita';

    if (displayText.length <= beforeDolceVita.length) {
      return displayText;
    } else {
      const rest = displayText.slice(beforeDolceVita.length);
      const isDolceVitaPart = rest.slice(0, dolceVita.length);
      const afterDolceVita = rest.slice(dolceVita.length);
      
      return (
        <>
          {beforeDolceVita}
          <span className="text-orange-500 font-extrabold tracking-wider" style={{ textShadow: "0 2px 10px rgba(249,115,22,0.4)" }}>
            {isDolceVitaPart}
          </span>
          {afterDolceVita}
        </>
      );
    }
  };

  return (
    <section
      className="relative h-[90vh] flex items-center justify-center bg-center bg-cover bg-fixed"
      style={{
        backgroundImage: "url('/images/hero-dessert.png')",
      }}
    >
      {/* Premium Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#111827]"></div>

      {/* Floating abstract decorative element */}
      <div className="pointer-events-none absolute top-1/4 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto glass-panel-dark p-12 rounded-3xl shadow-2xl hover-lift">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          {renderTypedText()}
        </h1>
        <p className="text-lg md:text-2xl mb-8 text-gray-300 font-light leading-relaxed">
          Indulge in our exquisite cheesecakes, authentic tiramisu, and decadent brownies.<br/>
          <span className="text-orange-400 font-medium">Crafted with passion, delivered with love.</span>
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-10">
          <button
            onClick={() => navigate("/menu")}
            className="cursor-pointer bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transform hover:-translate-y-1"
          >
            Explore the Menu
          </button>
          <button
            onClick={() => navigate("/special-orders")}
            className="cursor-pointer glass-panel hover:bg-white/10 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 border border-white/20 transform hover:-translate-y-1"
          >
            Special Event Orders
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
