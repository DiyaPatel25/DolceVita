import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";

const Hero = () => {
  const { navigate } = useContext(AppContext);

  // Typewriter effect states
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Welcome you all to Dolce Vita';

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
    }, 100);
    return () => clearInterval(typeInterval);
  }, []);

  // Function to render text with orange "Dolce Vita"
  const renderTypedText = () => {
    const beforeDolceVita = 'Welcome you all to ';
    const dolceVita = 'Dolce Vita';

    if (displayText.length <= beforeDolceVita.length) {
      return displayText;
    } else {
      return (
        <>
          {beforeDolceVita}
          <span className="text-orange-500">
            {displayText.slice(beforeDolceVita.length)}
          </span>
        </>
      );
    }
  };
  return (
    <section
      className="relative h-[90vh] flex items-center justify-center bg-center bg-cover"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-3">
          {renderTypedText()}
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          {" "}
          Experience the taste of perfection — where every bite tells a story.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate("/menu")}
            className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-black font-semibold px-6 py-3 rounded-full transition-all duration-300"
          >
            All Menus
          </button>
        </div>
      </div>
    </section>
  );
};
export default Hero;
