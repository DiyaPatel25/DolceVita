import { useContext } from "react";
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
} from "lucide-react";

const statCards = [
  {
    label: "Revenue today",
    value: "₹24.8k",
    note: "+12% from yesterday",
    icon: TrendingUp,
    accent: "from-amber-600 to-orange-500",
  },
  {
    label: "Menu items",
    value: "32",
    note: "Ready to serve",
    icon: Box,
    accent: "from-stone-600 to-amber-700",
  },
  {
    label: "Categories",
    value: "8",
    note: "Organized collections",
    icon: Grid3X3,
    accent: "from-amber-700 to-yellow-500",
  },
  {
    label: "Active guests",
    value: "128",
    note: "Browsing now",
    icon: Users,
    accent: "from-zinc-700 to-stone-500",
  },
];

const quickActions = [
  { label: "Add Menu", to: "/admin/add-menu", icon: Plus },
  { label: "Add Category", to: "/admin/add-category", icon: Layers3 },
  { label: "View Menus", to: "/admin/menus", icon: Sparkles },
  { label: "View Categories", to: "/admin/categories", icon: Grid3X3 },
  { label: "Check Orders", to: "/admin/orders", icon: ClipboardList },
];

const Dashboard = () => {
  const { categories, menus } = useContext(AppContext);

  const availableMenus = menus.filter((menu) => menu.isAvailable !== false).length;
  const unavailableMenus = menus.length - availableMenus;
  const featuredCategory = categories[0]?.name || "Seasonal Picks";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.28),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(120,53,15,0.28),_transparent_26%),linear-gradient(135deg,#2a1a12_0%,#120c08_48%,#090603_100%)]" />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur-sm">
                <Bell className="h-4 w-4 text-amber-300" />
              Admin overview
            </div>
            <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight">
              Dolce Vita control room
            </h1>
            <p className="mt-4 max-w-xl text-sm md:text-base text-white/70 leading-7">
              Manage menus, categories, and orders from one focused workspace. This overview highlights the live state of your restaurant and gives you direct access to the most common admin actions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[22rem]">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-white/50">Menu items</p>
              <p className="mt-2 text-3xl font-black">{menus.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-white/50">Categories</p>
              <p className="mt-2 text-3xl font-black">{categories.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-white/50">Ready items</p>
              <p className="mt-2 text-3xl font-black">{availableMenus}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="mt-4 text-sm text-white/55">{card.label}</p>
                <div className="mt-1 text-3xl font-black">{card.value}</div>
                <p className="mt-2 text-sm text-white/65">{card.note}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/50">Kitchen pulse</p>
                <h2 className="mt-2 text-2xl font-bold">Today’s activity</h2>
              </div>
              <div className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300">
                Live
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-orange-500/15 p-3 text-orange-300">
                    <Coffee className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/55">Featured category</p>
                    <p className="font-semibold">{featuredCategory}</p>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[72%] rounded-full bg-gradient-to-r from-orange-500 to-amber-400" />
                </div>
                <p className="mt-3 text-xs text-white/45">Strong demand in this category right now</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-sky-500/15 p-3 text-sky-300">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/55">Item status</p>
                    <p className="font-semibold">{unavailableMenus} unavailable</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="h-14 rounded-xl bg-emerald-400/80" />
                  <div className="h-10 rounded-xl bg-emerald-400/60 mt-4" />
                  <div className="h-16 rounded-xl bg-emerald-400/40" />
                </div>
                <p className="mt-3 text-xs text-white/45">Most items are live and available for customers</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">Restaurant snapshot</p>
                <p className="text-sm text-white/55">Updated just now</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs text-white/50">Orders pending</p>
                  <p className="mt-1 text-2xl font-black">12</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs text-white/50">Kitchen speed</p>
                  <p className="mt-1 text-2xl font-black">94%</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs text-white/50">Guest satisfaction</p>
                  <p className="mt-1 text-2xl font-black">4.9/5</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/50">Quick actions</p>
              <h2 className="mt-2 text-2xl font-bold">Work faster</h2>
            </div>

            <div className="mt-5 space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#1c120d]/70 px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-amber-400/40 hover:bg-[#241710]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-amber-500/15 p-3 text-amber-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-semibold">{action.label}</span>
                    </div>
                    <span className="text-sm text-white/40">Open</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-black/20 p-5">
              <p className="text-sm font-semibold text-white/80">Admin note</p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Use this panel to keep categories organized, add new dishes quickly, and monitor the live restaurant state without leaving the admin area.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
