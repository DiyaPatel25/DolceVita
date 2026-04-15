import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import {
  LayoutDashboard,
  Plus,
  Package,
  Grid3X3,
  ShoppingCart,
  X,
  Menu,
  ChefHat,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

const AdminLayout = () => {
  const { setAdmin, setUser, axios } = useContext(AppContext);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: "/admin", name: "Dashboard", icon: LayoutDashboard, exact: true },
    { path: "/admin/add-category", name: "Add Category", icon: Plus },
    { path: "/admin/add-menu", name: "Add Menu", icon: Package },
    { path: "/admin/categories", name: "All Categories", icon: Grid3X3 },
    { path: "/admin/menus", name: "All Menus", icon: Sparkles },
    { path: "/admin/orders", name: "Orders", icon: ShoppingCart },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname === path;
  };

  const logout = async () => {
    try {
      const { data } = await axios.post("/api/auth/logout");
      if (data.success) {
        toast.success("Logged out successfully");
        setAdmin(null);
        setUser(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const currentPage = menuItems.find((item) => isActive(item.path, item.exact))?.name || "Admin Panel";

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-black text-lg leading-none">Dolce Vita</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Admin Panel</p>
          </div>
          {/* Mobile close */}
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-white/60 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${active
                    ? "text-white shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                style={active ? { background: 'linear-gradient(135deg, #f97316cc, #ea580ccc)' } : {}}
              >
                <Icon size={18} className={`shrink-0 transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`} />
                <span>{item.name}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
              A
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Admin</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Owner</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-500/20 text-red-400 hover:text-red-300"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0" style={{ backgroundColor: '#f8fafc' }}>
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 shadow-sm shrink-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Menu size={20} />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{currentPage}</h2>
                <p className="text-xs text-gray-400">Manage your restaurant</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-orange-700">Live</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
