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

  return (
    <section className="py-16" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>
          {" "}
          Explore Our <span className="text-yellow-500">Categories</span>
        </h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}> Discover delicious dishes from our carefully curated categories</p>
        <div className="mb-10">
          <SearchBox value={query} onChange={setQuery} placeholder="Search categories or dishes..." />
        </div>
        {visible.length === 0 && (
          <p className="py-6" style={{ color: 'var(--text-secondary)' }}>No categories match "{query}"</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {visible.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className="cursor-pointer group text-center"
            >
              <div className="relative">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow-lg border-4 border-white group-hover:border-yellow-400 transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold group-hover:text-yellow-500 transition-colors duration-300" style={{ color: 'var(--text-color)' }}>
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  {cat.hits > 0 ? `${cat.hits} matching ${cat.hits === 1 ? "item" : "items"}` : "View items"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Categories;
