import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import SearchBox from "./SearchBox";

const Categories = () => {
  const { navigate, categories, menus } = useContext(AppContext);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  // A category matches by its own name, or by any dish inside it ("oreo" finds every section with an Oreo item)
  const dishMatches = (cat) =>
    menus.filter((m) => (m.category?._id ?? m.category) === cat._id && m.name.toLowerCase().includes(q)).length;
  const visible = categories
    .map((cat) => ({ ...cat, hits: q ? dishMatches(cat) : 0 }))
    .filter((cat) => !q || cat.name.toLowerCase().includes(q) || cat.hits > 0);

  const handleCategoryClick = (category) => {
    const params = new URLSearchParams({ categoryId: category._id, categoryName: category.name });
    // Searching by dish carries the search onto the menu page
    if (q && !category.name.toLowerCase().includes(q)) params.set("q", query.trim());
    navigate(`/menu?${params}`);
  };

  const itemCount = (cat) => menus.filter((m) => (m.category?._id ?? m.category) === cat._id).length;

  return (
    <section className="py-16" style={{ backgroundColor: "var(--bg-color)" }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="md:flex md:items-end md:justify-between md:gap-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-wide">What are you craving?</h2>
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>Pick a section, or search for a flavour like Oreo or Biscoff.</p>
          </div>
          <div className="mt-5 md:mt-0 md:w-80 shrink-0">
            <SearchBox value={query} onChange={setQuery} placeholder="Search categories or dishes..." />
          </div>
        </div>

        {visible.length === 0 && (
          <p className="py-10 text-center" style={{ color: "var(--text-secondary)" }}>No sections or dishes match "{query}". Try another flavour.</p>
        )}
        <div className="mt-8 -mx-4 px-4 flex gap-5 overflow-x-auto no-scrollbar snap-x md:grid md:grid-cols-6 md:overflow-visible md:mx-0 md:px-0">
          {visible.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className="group snap-start shrink-0 w-28 md:w-auto text-center"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden ring-2 ring-[var(--border-color)] group-hover:ring-copper-500 transition">
                <img src={cat.image} alt="" className="w-full h-full object-cover" />
              </div>
              <p className="mt-3 font-semibold leading-tight">{cat.name}</p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                {cat.hits > 0 ? `${cat.hits} matching` : `${itemCount(cat)} items`}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Categories;
