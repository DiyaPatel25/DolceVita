import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Search, X, ShoppingCart } from "lucide-react";
import MenuCard from "../components/MenuCard";

const Menu = () => {
  const { menus } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = menus.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: 'var(--text-color)' }}>
            Our <span className="text-yellow-500">Menu</span>
          </h1>
          <p className="max-w-xl mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
            Freshly made with the finest ingredients — pick your favourites!
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 rounded-full border-2 focus:border-yellow-500 focus:outline-none transition-colors shadow-md"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)', backgroundColor: 'var(--card-bg)' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Count */}
        <p className="text-center mb-8" style={{ color: 'var(--text-secondary)' }}>
          Showing <span className="font-bold text-yellow-600">{filtered.length}</span> {filtered.length === 1 ? "dish" : "dishes"}
          {searchQuery && ` for "${searchQuery}"`}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((menu) => (
              <MenuCard menu={menu} key={menu._id} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-yellow-400" />
            </div>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>No dishes found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Try a different search term</p>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="mt-4 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-semibold transition-colors">
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
