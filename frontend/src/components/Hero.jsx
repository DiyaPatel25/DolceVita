import { useContext, useRef } from "react";
import { Phone } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { STORE, VIDEOS } from "../store";
import DessertVideo from "./DessertVideo";

const Hero = () => {
  const { navigate } = useContext(AppContext);
  // Phones get the lighter file; decided once so the video doesn't restart on resize
  const isWide = useRef(window.matchMedia("(min-width: 768px)").matches);

  return (
    <section className="relative chalkboard text-cream overflow-hidden">
      <div className="max-w-6xl mx-auto md:px-4 md:py-14 md:grid md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:items-center min-h-[calc(100svh-4rem)] md:min-h-0">
        {/* Video: full-bleed behind the text on phones, framed panel on desktop */}
        <div className="absolute inset-0 md:relative md:inset-auto md:order-2 md:aspect-[4/5] md:rounded-[2rem] md:overflow-hidden md:ring-1 md:ring-copper-500/60 md:shadow-2xl">
          <DessertVideo
            src={isWide.current ? VIDEOS.heroLarge : VIDEOS.heroSmall}
            poster="https://images.unsplash.com/photo-1709195902163-7eee13e78970?w=900&q=70&auto=format&fit=crop"
            label="Chocolate ganache being poured over a layered cake"
            eager
          />
          <div className="absolute inset-0 bg-gradient-to-t from-chalk via-chalk/60 to-chalk/10 md:hidden" />
        </div>

        <div className="relative z-10 flex flex-col justify-end min-h-[calc(100svh-4rem)] md:min-h-0 px-5 pb-10 pt-32 md:p-0 md:order-1">
          <h1 className="font-display font-semibold leading-[0.95] tracking-[0.08em] text-[clamp(3rem,11vw,6.5rem)]">
            DOLCE<br />VITA
          </h1>
          <div className="mt-4 flex items-center gap-4 max-w-md">
            <span className="h-px flex-1 bg-copper-500/70" aria-hidden="true" />
            <span className="text-copper-300 text-lg">{STORE.tagline}</span>
            <span className="h-px flex-1 bg-copper-500/70" aria-hidden="true" />
          </div>

          <p className="mt-6 text-lg md:text-xl text-cream/85 max-w-md leading-relaxed">
            Cheesecakes, brownies, waffles and cake bowls, made fresh at our stall.
            Order here, pick up when it's ready, and pay at the counter.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/menu")}
              className="px-7 py-3.5 rounded-full bg-copper-500 hover:bg-copper-400 text-chalk font-bold text-base transition-colors"
            >
              Browse the menu
            </button>
            <a
              href={`tel:+91${STORE.phones[0]}`}
              className="px-6 py-3.5 rounded-full border border-cream/40 hover:border-cream text-cream font-semibold flex items-center gap-2 transition-colors"
            >
              <Phone size={17} /> Call to order
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
