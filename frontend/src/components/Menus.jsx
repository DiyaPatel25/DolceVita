import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import MenuCard from "./MenuCard";
import SearchBox from "./SearchBox";

const Menus = () => {
  const { menus } = useContext(AppContext);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  // Without a search the home page shows a preview of 8; with one, every match
  const visible = q
    ? menus.filter((m) => m.name.toLowerCase().includes(q) || m.category?.name?.toLowerCase().includes(q))
    : menus.slice(0, 8);

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-color)' }}>
            Our <span className="text-yellow-500">Menu</span>
          </h1>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Explore our delicious selection of handcrafted dishes made with the
            finest ingredients
          </p>
        </div>

        <div className="mb-10">
          <SearchBox value={query} onChange={setQuery} placeholder="Search dishes..." />
          {q && (
            <p className="text-center mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {visible.length} {visible.length === 1 ? "dish" : "dishes"} found
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visible.map((menu) => (
            <MenuCard key={menu._id} menu={menu} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menus;
