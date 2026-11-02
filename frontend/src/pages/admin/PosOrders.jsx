import { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import { ShoppingBag, ChevronLeft, ChevronRight, Banknote, Smartphone, Clock, CheckCircle2, XCircle, RotateCcw, Plus, RefreshCw, Split } from "lucide-react";

const rupee = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;
const shiftDate = (date, days) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const prettyDate = (date) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const time = (iso) => new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

const PAYMENT_BADGE = {
  Cash: { label: "Paid · Cash", cls: "bg-green-100 text-green-700", icon: Banknote },
  Online: { label: "Paid · Online", cls: "bg-blue-100 text-blue-700", icon: Smartphone },
  Pending: { label: "Not paid", cls: "bg-amber-100 text-amber-700", icon: Clock },
  Split: { label: "Paid · Cash + UPI", cls: "bg-purple-100 text-purple-700", icon: Split },
};

const FILTERS = [
  { id: "all", label: "All", test: (o) => o.status !== "Cancelled" },
  { id: "serve", label: "To serve", test: (o) => o.status !== "Cancelled" && o.status !== "Delivered" },
  { id: "unpaid", label: "Not paid", test: (o) => o.status !== "Cancelled" && o.payment === "Pending" },
  { id: "paid", label: "Paid", test: (o) => o.status !== "Cancelled" && o.payment !== "Pending" },
  { id: "cancelled", label: "Cancelled", test: (o) => o.status === "Cancelled" },
];

const PosOrders = () => {
  const { admin, axios } = useContext(AppContext);
  const [date, setDate] = useState(null); // null = today (server decides, in India time)
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState("all");
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [splitFor, setSplitFor] = useState(null); // order id whose split amount is being entered
  const [splitOnline, setSplitOnline] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/order/pos", { params: date ? { date } : {} });
      if (data.success) setData(data);
      else toast.error(data.message);
    } catch {
      toast.error("Could not load orders");
    } finally {
      setLoading(false);
    }
  }, [axios, date]);

  useEffect(() => {
    if (admin) load();
  }, [admin, load]);

  const isToday = data && data.date === data.today;

  // Keep today's screen fresh while it stays open at the counter
  useEffect(() => {
    if (!isToday) return;
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [isToday, load]);

  const update = async (order, body, message) => {
    try {
      setUpdating(order._id);
      const { data } = await axios.put(`/api/order/pos/${order._id}`, body);
      if (!data.success) return toast.error(data.message);
      toast.success(message);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update order");
    } finally {
      setUpdating(null);
    }
  };

  // Two taps instead of window.confirm, which many phone and in-app browsers silently block
  const cancel = (order) => {
    if (confirmCancel !== order._id) {
      setConfirmCancel(order._id);
      setTimeout(() => setConfirmCancel((id) => (id === order._id ? null : id)), 6000);
      return;
    }
    setConfirmCancel(null);
    update(order, { status: "Cancelled" }, "Order cancelled");
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin w-8 h-8 text-orange-500" />
      </div>
    );
  }

  const { summary, orders, history } = data;
  const visible = orders.filter(FILTERS.find((f) => f.id === filter).test);
  const historyTotals = history.reduce(
    (t, d) => ({ orders: t.orders + d.orders, cash: t.cash + d.cash, online: t.online + d.online, collected: t.collected + d.collected, unpaid: t.unpaid + d.unpaid }),
    { orders: 0, cash: 0, online: 0, collected: 0, unpaid: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Day picker */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setDate(shiftDate(data.date, -1))} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50" aria-label="Previous day">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <input
            type="date"
            value={data.date}
            max={data.today}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-gray-200 font-bold text-gray-800"
          />
          <button
            onClick={() => setDate(shiftDate(data.date, 1))}
            disabled={isToday}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            aria-label="Next day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          {!isToday && (
            <button onClick={() => setDate(null)} className="px-3 py-2 rounded-lg bg-orange-50 text-orange-700 font-bold border border-orange-200">
              Today
            </button>
          )}
        </div>
        <Link to="/admin/take-order" className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black flex items-center gap-2">
          <Plus className="w-4 h-4" /> New order
        </Link>
      </div>

      {/* The day's math */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{isToday ? "Today" : prettyDate(data.date)} · money collected</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 tabular-nums">
          <span className="text-2xl font-black text-green-600">{rupee(summary.cash)}</span>
          <span className="text-sm font-bold text-gray-400">cash</span>
          <span className="text-2xl font-black text-gray-300">+</span>
          <span className="text-2xl font-black text-blue-600">{rupee(summary.online)}</span>
          <span className="text-sm font-bold text-gray-400">online</span>
          <span className="text-2xl font-black text-gray-300">=</span>
          <span className="text-4xl font-black text-gray-900">{rupee(summary.collected)}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
            <p className="text-xs font-bold text-amber-700">Still to collect</p>
            <p className="text-xl font-black text-amber-700 tabular-nums">{rupee(summary.unpaid)}</p>
            <p className="text-[11px] text-amber-600">{summary.unpaidCount} unpaid order{summary.unpaidCount !== 1 ? "s" : ""}</p>
          </div>
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
            <p className="text-xs font-bold text-gray-500">Orders</p>
            <p className="text-xl font-black text-gray-800 tabular-nums">{summary.orders}</p>
            <p className="text-[11px] text-gray-400">{summary.cancelled} cancelled</p>
          </div>
          <div className="rounded-xl bg-orange-50 border border-orange-100 p-3">
            <p className="text-xs font-bold text-orange-700">To serve</p>
            <p className="text-xl font-black text-orange-700 tabular-nums">{summary.toServe}</p>
            <p className="text-[11px] text-orange-600">waiting at counter</p>
          </div>
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
            <p className="text-xs font-bold text-gray-500">Discounts given</p>
            <p className="text-xl font-black text-gray-800 tabular-nums">{rupee(summary.discount)}</p>
            <p className="text-[11px] text-gray-400">Total billed {rupee(summary.collected + summary.unpaid)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Orders */}
        <div className="xl:col-span-2 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap border ${filter === f.id ? "bg-gray-800 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-600"}`}
              >
                {f.label} <span className="opacity-60">{orders.filter(f.test).length}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <ShoppingBag className="w-10 h-10 text-orange-300 mx-auto mb-2" />
              <p className="text-gray-500 font-semibold">No orders here</p>
            </div>
          ) : (
            visible.map((order) => {
              const badge = PAYMENT_BADGE[order.payment];
              const BadgeIcon = badge.icon;
              const cancelled = order.status === "Cancelled";
              const served = order.status === "Delivered";
              const busy = updating === order._id;
              const subtotal = order.items.reduce((s, i) => s + i.lineTotal, 0);
              return (
                <div key={order._id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${cancelled ? "border-gray-100 opacity-60" : order.payment === "Pending" ? "border-amber-200" : "border-gray-100"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
                    <div>
                      <p className="font-black text-gray-800">
                        {order.customerName} <span className="text-xs font-bold text-gray-400">#{order._id.slice(-5).toUpperCase()} · {time(order.createdAt)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {cancelled ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-500">Cancelled</span>
                      ) : (
                        <>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 ${badge.cls}`}>
                            <BadgeIcon className="w-3.5 h-3.5" /> {order.payment === "Split" ? `Paid · ${rupee(order.online)} UPI + ${rupee(order.cash)} cash` : badge.label}
                          </span>
                          {served && <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Served</span>}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-3 text-sm tabular-nums space-y-1">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between gap-3">
                        <span className="text-gray-700 min-w-0">
                          <span className="font-black">{i.quantity}×</span> {i.name}
                          {(i.extraCream || i.toppings.length > 0) && (
                            <span className="text-xs text-gray-400"> (+{[i.extraCream && "Extra cream", ...i.toppings].filter(Boolean).join(", ")})</span>
                          )}
                          <span className="text-xs text-gray-400"> @ {rupee(i.price + i.addOn)}</span>
                        </span>
                        <span className="font-bold text-gray-800 shrink-0">{rupee(i.lineTotal)}</span>
                      </div>
                    ))}
                    {order.discount > 0 && (
                      <>
                        <div className="flex justify-between text-gray-500 pt-1 border-t border-dashed border-gray-200">
                          <span>Subtotal</span><span>{rupee(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-red-500">
                          <span>Discount</span><span>−{rupee(order.discount)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between pt-1 border-t border-gray-100">
                      <span className="font-black text-gray-800">Total</span>
                      <span className="font-black text-lg text-gray-900">{rupee(order.totalAmount)}</span>
                    </div>
                  </div>

                  {!cancelled && (
                    <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-gray-50 border-t border-gray-100">
                      {order.payment === "Pending" ? (
                        <>
                          <button disabled={busy} onClick={() => update(order, { payment: "Cash" }, "Marked paid in cash")} className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-black flex items-center gap-1.5 disabled:opacity-50">
                            <Banknote className="w-4 h-4" /> Got cash
                          </button>
                          <button disabled={busy} onClick={() => update(order, { payment: "Online" }, "Marked paid online")} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-black flex items-center gap-1.5 disabled:opacity-50">
                            <Smartphone className="w-4 h-4" /> Got online
                          </button>
                          {splitFor === order._id ? (
                            <span className="flex items-center gap-1.5 tabular-nums">
                              <input
                                type="number"
                                min="1"
                                inputMode="numeric"
                                autoFocus
                                placeholder="₹ UPI"
                                value={splitOnline}
                                onChange={(e) => setSplitOnline(e.target.value)}
                                className="w-20 px-2 py-2 border border-purple-300 rounded-lg text-right font-black outline-none focus:border-purple-500"
                              />
                              <span className="text-xs font-bold text-gray-500">
                                {Number(splitOnline) > 0 && Number(splitOnline) < order.totalAmount ? `+ ${rupee(order.totalAmount - Number(splitOnline))} cash` : "UPI part"}
                              </span>
                              <button
                                disabled={busy || !(Number(splitOnline) > 0 && Number(splitOnline) < order.totalAmount)}
                                onClick={() => { setSplitFor(null); update(order, { payment: "Split", onlineAmount: Number(splitOnline) }, "Marked paid: cash + UPI"); }}
                                className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-black disabled:opacity-50"
                              >
                                Save
                              </button>
                            </span>
                          ) : (
                            <button disabled={busy} onClick={() => { setSplitFor(order._id); setSplitOnline(""); }} className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-black flex items-center gap-1.5 disabled:opacity-50">
                              <Split className="w-4 h-4" /> Cash + UPI
                            </button>
                          )}
                        </>
                      ) : (
                        <button disabled={busy} onClick={() => update(order, { payment: "Pending" }, "Marked as not paid")} className="px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-200 text-sm font-bold flex items-center gap-1.5 disabled:opacity-50">
                          <RotateCcw className="w-4 h-4" /> Mark not paid
                        </button>
                      )}
                      {served ? (
                        <button disabled={busy} onClick={() => update(order, { status: "Pending" }, "Moved back to serving")} className="px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-200 text-sm font-bold flex items-center gap-1.5 disabled:opacity-50">
                          <RotateCcw className="w-4 h-4" /> Not served
                        </button>
                      ) : (
                        <button disabled={busy} onClick={() => update(order, { status: "Delivered" }, "Marked served")} className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-900 text-white text-sm font-black flex items-center gap-1.5 disabled:opacity-50">
                          <CheckCircle2 className="w-4 h-4" /> Served
                        </button>
                      )}
                      <button
                        disabled={busy}
                        onClick={() => cancel(order)}
                        className={`ml-auto px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 disabled:opacity-50 ${confirmCancel === order._id ? "bg-red-600 text-white" : "text-red-500 hover:bg-red-50"}`}
                      >
                        <XCircle className="w-4 h-4" /> {confirmCancel === order._id ? `Tap again to cancel ${rupee(order.totalAmount)}` : "Cancel"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-6">
          {/* Best sellers for the day */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-black text-gray-800 mb-3">Items sold <span className="text-xs font-semibold text-gray-400">(before discounts)</span></h3>
            {summary.topItems.length === 0 ? (
              <p className="text-sm text-gray-400">Nothing sold yet</p>
            ) : (
              <div className="space-y-1.5 text-sm tabular-nums">
                {summary.topItems.map((i) => (
                  <div key={i.name} className="flex justify-between gap-2">
                    <span className="text-gray-700 truncate"><span className="font-black">{i.quantity}×</span> {i.name}</span>
                    <span className="font-bold text-gray-800 shrink-0">{rupee(i.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Last 14 days */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-black text-gray-800 mb-3">Last {history.length} days</h3>
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="text-[11px] uppercase text-gray-400 text-right">
                  <th className="text-left font-bold pb-2">Day</th>
                  <th className="font-bold pb-2">Cash</th>
                  <th className="font-bold pb-2">Online</th>
                  <th className="font-bold pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {history.map((d) => (
                  <tr
                    key={d.date}
                    onClick={() => setDate(d.date)}
                    className={`cursor-pointer text-right border-t border-gray-50 hover:bg-orange-50 ${d.date === data.date ? "bg-orange-50" : ""}`}
                  >
                    <td className="text-left py-1.5 font-bold text-gray-700">
                      {prettyDate(d.date)}
                      {d.unpaid > 0 && <span className="ml-1 text-[10px] text-amber-600">({rupee(d.unpaid)} due)</span>}
                    </td>
                    <td className="text-green-600">{d.cash ? rupee(d.cash) : "—"}</td>
                    <td className="text-blue-600">{d.online ? rupee(d.online) : "—"}</td>
                    <td className="font-black text-gray-900">{d.collected ? rupee(d.collected) : "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="text-right border-t-2 border-gray-200">
                  <td className="text-left pt-2 font-black text-gray-800">{historyTotals.orders} orders</td>
                  <td className="pt-2 font-bold text-green-600">{rupee(historyTotals.cash)}</td>
                  <td className="pt-2 font-bold text-blue-600">{rupee(historyTotals.online)}</td>
                  <td className="pt-2 font-black text-gray-900">{rupee(historyTotals.collected)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosOrders;
