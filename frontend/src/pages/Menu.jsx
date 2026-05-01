import { useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Search, X, ShoppingCart } from "lucide-react";
import MenuCard from "../components/MenuCard";

const Menu = () => {
  const { menus } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategoryId = searchParams.get("categoryId");
  const selectedCategoryName = searchParams.get("categoryName") || "";

  const getMenuCategoryId = (menu) => {
    if (menu.category && typeof menu.category === "object") {
      return menu.category._id;
    }
    return menu.category;
  };

  const getMenuCategoryName = (menu) => {
    if (menu.category && typeof menu.category === "object") {
      return menu.category.name || "";
    }
    return "";
  };

  const clearCategory = () => {
    setSearchParams({});
  };

  const visibleMenus = menus.filter((menu) => {
    const matchesCategory =
      !selectedCategoryId ||
      getMenuCategoryId(menu) === selectedCategoryId ||
      getMenuCategoryName(menu).toLowerCase() === selectedCategoryName.toLowerCase();

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      menu.name.toLowerCase().includes(query) ||
      menu.description?.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const activeCategoryLabel = selectedCategoryName || "this category";

  return (
    <div className="relative min-h-screen py-12 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage:
            "url('https://img.freepik.com/premium-photo/fresh-cup-coffee-is-surrounded-by-coffee-beans-green-leaves-creating-serene-morning-atmosphere-light-blue-background-generative-ai_262708-69590.jpg?semt=ais_hybrid&w=740&q=80')",
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/12 to-black/18"></div>

      <div className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 z-0">
        <p
          className="text-white/40 text-[11vw] md:text-[7vw] font-black tracking-[0.2em] leading-none select-none whitespace-nowrap"
          style={{ textShadow: "0 8px 30px rgba(255,255,255,0.28)" }}
        >
          DOLCE VITA
        </p>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">
            Our <span className="text-yellow-400">Menu</span>
          </h1>
          <p className="max-w-xl mx-auto mb-8 text-white/85">
            {selectedCategoryName
              ? `Freshly made with the finest ingredients - showing dishes from ${selectedCategoryName}.`
              : "Freshly made with the finest ingredients - pick your favourites!"}
          </p>

          {selectedCategoryName && (
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/35 px-4 py-2 shadow-sm bg-white/10 backdrop-blur-sm">
              <span className="text-sm font-semibold text-white">
                Category: {selectedCategoryName}
              </span>
              <button
                type="button"
                onClick={clearCategory}
                className="text-sm font-semibold text-yellow-300 hover:text-yellow-200"
              >
                View all
              </button>
            </div>
          )}

          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 rounded-full border-2 focus:border-yellow-400 focus:outline-none transition-colors shadow-md placeholder:text-white/65"
                style={{
                  borderColor: "rgba(255,255,255,0.35)",
                  color: "#ffffff",
                  backgroundColor: "rgba(255,255,255,0.10)",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/75 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center mb-8 text-white/85">
          Showing <span className="font-bold text-yellow-300">{visibleMenus.length}</span> {visibleMenus.length === 1 ? "dish" : "dishes"}
          {selectedCategoryName ? ` in ${activeCategoryLabel}` : ""}
          {searchQuery && ` for "${searchQuery}"`}
        </p>

        {visibleMenus.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleMenus.map((menu) => (
              <MenuCard menu={menu} key={menu._id} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-yellow-400" />
            </div>
            <p className="text-lg font-semibold text-white">No dishes found</p>
            <p className="text-sm mt-1 text-white/80">
              {selectedCategoryName && searchQuery
                ? "Try a different search term or clear the category filter."
                : selectedCategoryName
                  ? "There are no dishes in this category yet."
                  : "Try a different search term"}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-semibold transition-colors"
                >
                  Clear Search
                </button>
              )}
              {selectedCategoryName && (
                <button
                  onClick={clearCategory}
                  className="px-6 py-2 rounded-full border-2 border-white/70 text-white font-semibold transition-colors hover:bg-white hover:text-black"
                >
                  View All Menus
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
