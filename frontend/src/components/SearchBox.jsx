import { Search, X } from "lucide-react";

// Themed search input for the customer-facing pages
const SearchBox = ({ value, onChange, placeholder }) => (
  <div className="relative max-w-xl mx-auto">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-secondary)" }} />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full pl-12 pr-11 py-3 rounded-full border-2 border-[var(--border-color)] focus:border-copper-500 focus:outline-none transition-colors shadow-sm [&::-webkit-search-cancel-button]:hidden"
      style={{ backgroundColor: "var(--card-bg)", color: "var(--text-color)" }}
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear search"
        className="absolute right-4 top-1/2 -translate-y-1/2"
        style={{ color: "var(--text-secondary)" }}
      >
        <X className="w-5 h-5" />
      </button>
    )}
  </div>
);

export default SearchBox;
