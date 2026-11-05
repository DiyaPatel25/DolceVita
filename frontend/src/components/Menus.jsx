import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import MenuCard from "./MenuCard";
import SearchBox from "./SearchBox";
import { Link } from "react-router-dom";

const Menus = () => {
  const { menus } = useContext(AppContext);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  // Without a search the home page shows a preview of 8; with one, every match
  const visible = q
    ? menus.filter((m) => m.name.toLowerCase().includes(q) || m.category?.name?.toLowerCase().includes(q))
    : menus.slice(0, 8);

  return (
    <section className="py-16 border-t" style={{ borderColor: "var(--border-color)" }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="md:flex md:items-end md:justify-between md:gap-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-wide">Customer favourites</h2>
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>A few picks to start with. The full menu has every flavour.</p>
          </div>
          <div className="mt-5 md:mt-0 md:w-80 shrink-0">
            <SearchBox value={query} onChange={setQuery} placeholder="Search dishes..." />
          </div>
        </div>
        {q && (
          <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
            {visible.length} {visible.length === 1 ? "dish" : "dishes"} found
          </p>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {visible.map((menu) => (
            <MenuCard key={menu._id} menu={menu} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/menu" className="inline-block px-7 py-3.5 rounded-full border border-copper-500 text-copper-500 font-bold hover:bg-copper-500 hover:text-chalk transition-colors">
            See the full menu
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Menus;
