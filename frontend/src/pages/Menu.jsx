import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import MenuCard from "../components/MenuCard";
import SearchBox from "../components/SearchBox";

const NAV_OFFSET = 64 + 112; // site navbar + this page's sticky bar

const categoryIdOf = (menu) => (menu.category && typeof menu.category === "object" ? menu.category._id : menu.category);

const Menu = () => {
  const { menus, categories } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [active, setActive] = useState(null);
  const tabsRef = useRef(null);
  const q = query.trim().toLowerCase();

  // Sections in the printed-menu order, each with the items that match the search
  const sections = useMemo(
    () =>
      categories
        .map((cat) => ({
          ...cat,
          items: menus.filter(
            (m) =>
              categoryIdOf(m) === cat._id &&
              (!q || m.name.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q))
          ),
        }))
        .filter((s) => s.items.length > 0),
    [categories, menus, q]
  );
  const total = sections.reduce((n, s) => n + s.items.length, 0);

  const jumpTo = (id) => {
    const el = document.getElementById(`section-${id}`);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET + 8, behavior: "smooth" });
  };

  // Arriving from a section link on the home page: go straight to it
  const wanted = searchParams.get("categoryId");
  useEffect(() => {
    if (wanted && sections.some((s) => s._id === wanted)) jumpTo(wanted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wanted, sections.length]);

  // Highlight the tab of the section being read
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.dataset.id);
      },
      { rootMargin: `-${NAV_OFFSET}px 0px -55% 0px` }
    );
    sections.forEach((s) => {
      const el = document.getElementById(`section-${s._id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  // Keep the active tab in view in the swipeable row. Scroll only the row: scrollIntoView would
  // also touch the page and cancel a section jump that is still scrolling.
  useEffect(() => {
    const row = tabsRef.current;
    const tab = row?.querySelector(`[data-tab="${active}"]`);
    if (tab) row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.clientWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "var(--bg-color)" }}>
      <div className="sticky top-16 z-30 border-b" style={{ backgroundColor: "var(--bg-color)", borderColor: "var(--border-color)" }}>
        <div className="max-w-6xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center gap-4">
            <h1 className="hidden md:block font-display text-3xl font-semibold tracking-wide shrink-0">Menu</h1>
            <div className="flex-1 md:max-w-md md:ml-auto">
              <SearchBox value={query} onChange={setQuery} placeholder="Search cheesecakes, Oreo, Nutella..." />
            </div>
          </div>
          <div ref={tabsRef} className="mt-3 flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Menu sections">
            {sections.map((s) => (
              <button
                key={s._id}
                data-tab={s._id}
                role="tab"
                aria-selected={active === s._id}
                onClick={() => jumpTo(s._id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  active === s._id ? "bg-copper-500 border-copper-500 text-chalk" : "border-[var(--border-color)] hover:border-copper-500"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {q && (
          <p className="pt-5 text-sm" style={{ color: "var(--text-secondary)" }}>
            {total} {total === 1 ? "dish" : "dishes"} for "{query.trim()}"
          </p>
        )}

        {sections.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-lg font-semibold">Nothing matches "{query.trim()}"</p>
            <p className="mt-1" style={{ color: "var(--text-secondary)" }}>Try a flavour like chocolate, Oreo or strawberry.</p>
            <button onClick={() => setQuery("")} className="mt-5 px-6 py-3 rounded-full bg-copper-500 text-chalk font-bold">
              Show the full menu
            </button>
          </div>
        ) : (
          sections.map((s) => (
            <section key={s._id} id={`section-${s._id}`} data-id={s._id} className="pt-10" aria-labelledby={`title-${s._id}`}>
              <div className="flex items-center gap-4">
                <h2 id={`title-${s._id}`} className="font-display text-2xl md:text-3xl font-semibold tracking-wide min-w-0">{s.name}</h2>
                <span className="h-px flex-1 min-w-6 bg-copper-500/50" aria-hidden="true" />
                <span className="text-sm shrink-0" style={{ color: "var(--text-secondary)" }}>{s.items.length}</span>
              </div>
              <div className="mt-2 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
                {s.items.map((m) => <MenuCard key={m._id} menu={m} />)}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default Menu;
