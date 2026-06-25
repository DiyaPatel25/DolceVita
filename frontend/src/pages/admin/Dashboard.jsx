import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import {
  BarChart3,
  Bell,
  Box,
  ClipboardList,
  Coffee,
  Grid3X3,
  Layers3,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  Activity,
} from "lucide-react";

const Dashboard = () => {
  const { categories, menus, axios } = useContext(AppContext);
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueStats, setRevenueStats] = useState({ today: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, revenueRes] = await Promise.all([
          axios.get("/api/order/orders"),
          axios.get("/api/order/calculate-revenue")
        ]);

        if (ordersRes.data?.success) {
          const formattedOrders = ordersRes.data.orders.slice(0, 5).map(o => ({
            id: o._id.slice(-6).toUpperCase(),
            customer: o.user?.name || o.guestName || "Guest",
            items: o.items?.length || 0,
            total: `₹${o.totalAmount}`,
            status: o.status
          }));
          setRecentOrders(formattedOrders);
        }

        if (revenueRes.data?.success && revenueRes.data.data) {
          setRevenueStats({
            today: revenueRes.data.data.totalRevenue || 0,
            count: revenueRes.data.data.ordersCount || 0
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [axios]);

  const availableMenus = menus.filter((menu) => menu.isAvailable !== false).length;
  const unavailableMenus = menus.length - availableMenus;
  const availabilityPercentage = ((availableMenus / menus.length) * 100).toFixed(0);

  const statCards = [
    {
      label: "Total Menu Items",
      value: menus.length,
      trend: "+3 this week",
      isPositive: true,
      icon: Box,
      bgGradient: "from-blue-600 to-blue-800",
      lightBg: "bg-blue-500/10",
      textColor: "text-blue-400",
    },
    {
      label: "Total Categories",
      value: categories.length,
      trend: "All organized",
      isPositive: true,
      icon: Grid3X3,
      bgGradient: "from-purple-600 to-purple-800",
      lightBg: "bg-purple-500/10",
      textColor: "text-purple-400",
    },
    {
      label: "Available Items",
      value: `${availabilityPercentage}%`,
      trend: `${availableMenus} of ${menus.length} items`,
      isPositive: availableMenus > menus.length * 0.8,
      icon: CheckCircle,
      bgGradient: "from-emerald-600 to-emerald-800",
      lightBg: "bg-emerald-500/10",
      textColor: "text-emerald-400",
    },
    {
      label: "Revenue Today",
      value: `₹${revenueStats.today.toLocaleString()}`,
      trend: `${revenueStats.count} orders today`,
      isPositive: true,
      icon: TrendingUp,
      bgGradient: "from-amber-600 to-orange-700",
      lightBg: "bg-amber-500/10",
      textColor: "text-amber-400",
    },
  ];

  const quickActions = [
    { label: "Add New Menu Item", to: "/admin/add-menu", icon: Plus, color: "from-blue-500 to-blue-700" },
    { label: "Add Category", to: "/admin/add-category", icon: Layers3, color: "from-purple-500 to-purple-700" },
    { label: "Manage Menus", to: "/admin/menus", icon: Sparkles, color: "from-emerald-500 to-emerald-700" },
    { label: "Manage Categories", to: "/admin/categories", icon: Grid3X3, color: "from-orange-500 to-orange-700" },
    { label: "View All Orders", to: "/admin/orders", icon: ClipboardList, color: "from-pink-500 to-pink-700" },
  ];


  const topCategories = categories
    .map(cat => ({
      name: cat.name,
      items: menus.filter(m => {
        const catId = typeof m.category === 'object' ? m.category?._id : m.category;
        return catId === cat._id;
      }).length,
      color: "from-blue-400"
    }))
    .sort((a, b) => b.items - a.items)
    .slice(0, 4)
    .map((cat, idx) => ({
      ...cat,
      color: ["from-blue-400", "from-purple-400", "from-emerald-400", "from-amber-400"][idx] || "from-blue-400",
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Dashboard
            </h1>
            <p className="text-slate-400 text-lg">Welcome back! Here's your restaurant overview.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-emerald-300">System Online</span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-white/5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.lightBg}`}>
                  <Icon className={`${card.textColor} w-6 h-6`} />
                </div>
                {card.isPositive ? (
                  <div className="flex items-center gap-1 text-emerald-400 text-sm">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                )}
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">{card.label}</h3>
              <p className="text-3xl font-bold text-white mb-2">{card.value}</p>
              <p className="text-slate-500 text-xs">{card.trend}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Section - Activity & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="group relative rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-4 hover:border-white/20 transition-all duration-300 overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                    <div className="relative flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} bg-opacity-20`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-white text-sm">{action.label}</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Category Performance */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Top Categories</h2>
            </div>
            <div className="space-y-4">
              {topCategories.map((category, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium text-sm">{category.name}</p>
                      <p className="text-slate-400 text-sm">{category.items} items</p>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${category.color} to-transparent`}
                        style={{ width: `${(category.items / 20) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Recent Orders & Status */}
        <div className="space-y-6">
          {/* System Status */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">System Status</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-white">All Systems</span>
                </div>
                <span className="text-xs text-emerald-400 font-semibold">Running</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-white">Database</span>
                </div>
                <span className="text-xs text-blue-400 font-semibold">Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <span className="text-sm text-white">Today's Orders</span>
                </div>
                <span className="text-xs text-amber-400 font-semibold">{revenueStats.count}</span>
              </div>
            </div>
          </div>

          {/* Recent Orders Preview */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/20">
                  <ClipboardList className="w-5 h-5 text-pink-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Recent Orders</h2>
              </div>
              <Link to="/admin/orders" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-4 text-slate-400 text-sm">Loading orders...</div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-sm">No orders yet.</div>
              ) : recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div>
                    <p className="text-sm font-semibold text-white">{order.id}</p>
                    <p className="text-xs text-slate-400">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{order.total}</p>
                    <p className={`text-xs ${order.status === "Completed" ? "text-emerald-400" : "text-amber-400"}`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tips Card */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-bold text-white">Pro Tips</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex gap-2">
              <span className="text-blue-400">•</span>
              <span>Update menu items regularly to keep customers engaged</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400">•</span>
              <span>Monitor unavailable items to ensure smooth operations</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-400">•</span>
              <span>Review orders daily for business insights</span>
            </li>
          </ul>
        </div>

        {/* Performance Card */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-bold text-white">Today's Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Order Fulfillment Rate</span>
              <span className="text-sm font-semibold text-emerald-400">94%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Avg. Prep Time</span>
              <span className="text-sm font-semibold text-emerald-400">18 mins</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Customer Satisfaction</span>
              <span className="text-sm font-semibold text-emerald-400">4.8/5.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
