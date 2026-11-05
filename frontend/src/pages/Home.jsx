import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import Categories from "../components/Categories";
import Hero from "../components/Hero";
import Menus from "../components/Menus";
import DessertVideo from "../components/DessertVideo";
import { STORE, VIDEOS } from "../store";

const STEPS = [
  { title: "Choose your desserts", text: "Add what you like from the menu. No account needed." },
  { title: "Place a pickup order", text: "Tell us your name, phone number and when you'll come." },
  { title: "Collect and pay", text: "Pick it up fresh at the stall and pay at the counter, cash or UPI." },
];

const Home = () => {
  const { categories, navigate } = useContext(AppContext);
  const openCategory = (name) => {
    const cat = categories.find((c) => c.name === name);
    navigate(cat ? `/menu?categoryId=${cat._id}&categoryName=${encodeURIComponent(cat.name)}` : "/menu");
  };

  return (
    <div style={{ backgroundColor: "var(--bg-color)" }}>
      <Hero />
      <Categories />

      {/* Made fresh: the clips, each opening its section of the menu */}
      <section className="chalkboard text-cream py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-wide">Made fresh at the stall</h2>
          <p className="mt-2 text-cream/70 max-w-lg">Every order is put together when you place it, so it's ready for you to collect.</p>
          <div className="mt-8 -mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-4 md:overflow-visible md:mx-0 md:px-0">
            {VIDEOS.reel.map((clip) => {
              const cat = categories.find((c) => c.name === clip.category);
              return (
                <button
                  key={clip.src}
                  onClick={() => openCategory(clip.category)}
                  className="group snap-start shrink-0 w-[62vw] max-w-[260px] md:w-auto md:max-w-none text-left"
                >
                  <div className="aspect-[9/14] rounded-2xl overflow-hidden ring-1 ring-white/10 group-hover:ring-copper-400 transition">
                    <DessertVideo src={clip.src} poster={cat?.image} label={clip.category} />
                  </div>
                  <p className="mt-3 font-semibold">{clip.category}</p>
                  <p className="text-sm text-copper-300 group-hover:underline">See the {clip.category.toLowerCase()}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* How pickup works: a real sequence, so it's numbered */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-wide">How pickup works</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="shrink-0 w-11 h-11 rounded-full border border-copper-500 text-copper-500 font-display text-lg flex items-center justify-center">{i + 1}</span>
                <div>
                  <p className="font-bold text-lg">{step.title}</p>
                  <p className="mt-1" style={{ color: "var(--text-secondary)" }}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          {(STORE.pickupPoint || STORE.hours) && (
            <p className="mt-8 text-sm" style={{ color: "var(--text-secondary)" }}>
              {STORE.pickupPoint && <>Pickup point: <span style={{ color: "var(--text-color)" }}>{STORE.pickupPoint}</span>. </>}
              {STORE.hours && <>Open {STORE.hours}.</>}
            </p>
          )}
        </div>
      </section>

      <Menus />
    </div>
  );
};

export default Home;
