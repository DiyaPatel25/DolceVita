import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Package, ShoppingCart, UserCircle, Sun, Moon, Menu, X } from "lucide-react";
import toast from "react-hot-toast";

const Navbar = () => {
  const { navigate, user, setUser, axios, cartCount, theme, toggleTheme } = useContext(AppContext);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const logout = async () => {
    try {
      const { data } = await axios.post("/api/auth/logout");
      if (data.success) {
        setUser(null);
        toast.success(data.message);
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/menu", label: "Menu" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: 'var(--card-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="text-2xl sm:text-3xl font-black shrink-0" style={{ color: '#a77854' }}>
            Dolce Vita
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-semibold transition-colors hover:text-orange-500 ${location.pathname === to ? 'text-orange-500' : ''}`}
                style={{ color: location.pathname === to ? '#f97316' : 'var(--text-color)' }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--hover-bg)' }}
              aria-label="Toggle theme"
            >
              {theme === 'light'
                ? <Moon size={20} style={{ color: 'var(--text-color)' }} />
                : <Sun size={20} style={{ color: 'var(--text-color)' }} />}
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--hover-bg)' }}
              aria-label="Cart"
            >
              <ShoppingCart size={20} style={{ color: 'var(--text-color)' }} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile / Login — Desktop */}
            <div className="hidden md:block">
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(p => !p)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--hover-bg)' }}
                    aria-label="Profile"
                  >
                    <UserCircle size={26} style={{ color: 'var(--text-color)' }} />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-44 rounded-xl shadow-xl border overflow-hidden z-50"
                      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                      <Link
                        to="/my-orders"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-orange-50"
                        style={{ color: 'var(--text-color)' }}
                      >
                        <Package size={16} /> My Orders
                      </Link>
                      <button
                        onClick={() => { setProfileOpen(false); logout(); }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors hover:bg-red-50 text-red-500"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Login
                </button>
              )}
            </div>

            {/* Hamburger — Mobile only */}
            <button
              onClick={() => setMobileOpen(p => !p)}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--hover-bg)' }}
              aria-label="Open menu"
            >
              {mobileOpen
                ? <X size={20} style={{ color: 'var(--text-color)' }} />
                : <Menu size={20} style={{ color: 'var(--text-color)' }} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t py-4 px-1 space-y-1" style={{ borderColor: 'var(--border-color)' }}>
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="block px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  color: location.pathname === to ? '#f97316' : 'var(--text-color)',
                  backgroundColor: location.pathname === to ? '#fff7ed' : 'transparent',
                }}
              >
                {label}
              </Link>
            ))}

            <div className="border-t pt-2 mt-2" style={{ borderColor: 'var(--border-color)' }}>
              {user ? (
                <>
                  <Link
                    to="/my-orders"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
                    style={{ color: 'var(--text-color)' }}
                  >
                    <Package size={16} /> My Orders
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-500"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
