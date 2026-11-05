import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Link, NavLink, useLocation } from "react-router-dom";
import { LogOut, Package, ShoppingBag, UserCircle, Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";
import { STORE } from "../store";

const Navbar = () => {
  const { navigate, user, setUser, axios, cartCount, theme, toggleTheme } = useContext(AppContext);
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  const logout = async () => {
    try {
      const { data } = await axios.post("/api/auth/logout");
      if (data.success) {
        setUser(null);
        toast.success("Signed out");
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-full text-sm font-semibold transition-colors ${isActive ? "text-copper-400" : "hover:text-copper-400"}`;

  return (
    <nav className="sticky top-0 z-50 chalkboard text-cream border-b border-white/10">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center gap-2 sm:gap-3">
        <Link to="/" className="shrink-0 leading-none" aria-label={`${STORE.name} home`}>
          <span className="block font-display text-lg sm:text-2xl font-semibold tracking-[0.1em] sm:tracking-[0.12em] whitespace-nowrap">DOLCE VITA</span>
          <span className="block text-[11px] text-copper-300 tracking-wide mt-0.5">{STORE.tagline}</span>
        </Link>

        <div className="flex items-center ml-auto sm:ml-8">
          <NavLink to="/menu" className={linkClass}>Menu</NavLink>
          <NavLink to="/special-orders" className={(s) => `${linkClass(s)} hidden sm:block`}>Special orders</NavLink>
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 sm:ml-auto">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label={theme === "light" ? "Switch to chalkboard theme" : "Switch to light theme"}
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>

          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Account"
                aria-expanded={profileOpen}
              >
                <UserCircle size={21} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl border overflow-hidden z-50"
                  style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--text-color)" }}>
                  <p className="px-4 pt-3 pb-2 text-xs truncate" style={{ color: "var(--text-secondary)" }}>{user.name}</p>
                  <Link to="/my-orders" className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-[var(--hover-bg)]">
                    <Package size={16} /> My orders
                  </Link>
                  <Link to="/special-orders" className="sm:hidden flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-[var(--hover-bg)]">
                    Special orders
                  </Link>
                  <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium hover:bg-[var(--hover-bg)]" style={{ color: "var(--error-color)" }}>
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="p-2 sm:px-3 rounded-full text-sm font-semibold whitespace-nowrap hover:text-copper-400" aria-label="Sign in">
              <UserCircle size={21} className="sm:hidden" />
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}

          <button
            onClick={() => navigate("/cart")}
            className="relative flex items-center gap-1.5 sm:gap-2 pl-3 pr-3 sm:pr-4 py-2 rounded-full whitespace-nowrap bg-copper-500 hover:bg-copper-400 text-chalk text-sm font-bold transition-colors"
            aria-label={`Your order, ${cartCount} items`}
          >
            <ShoppingBag size={17} />
            <span className="hidden sm:inline">Your order</span>
            {cartCount > 0 && (
              <span className="min-w-5 h-5 px-1 rounded-full bg-chalk text-cream text-xs flex items-center justify-center">{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
