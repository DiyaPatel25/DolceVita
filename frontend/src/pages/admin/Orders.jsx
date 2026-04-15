import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import { ShoppingBag, IndianRupee, CheckCircle, Clock, ChefHat, Package } from "lucide-react";

const STATUS_OPTIONS = ["Pending", "Preparing", "Ready", "Delivered"];

const STATUS_CONFIG = {
  Pending:   { color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-400" },
  Preparing: { color: "bg-blue-100 text-blue-700 border-blue-200",       dot: "bg-blue-400"   },
  Ready:     { color: "bg-green-100 text-green-700 border-green-200",    dot: "bg-green-400"  },
  Delivered: { color: "bg-gray-100 text-gray-600 border-gray-200",       dot: "bg-gray-400"   },
};

const Orders = () => {
  const { admin, axios } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/orders");
      if (data.success) setOrders(data.orders);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);
      const { data } = await axios.put(`/api/order/update-status/${orderId}`, { status: newStatus });
      if (data.success) {
        toast.success(`Status updated to "${newStatus}"`);
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => { if (admin) fetchOrders(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-gray-700 font-semibold text-lg">No orders yet</h3>
          <p className="text-gray-400 text-sm mt-1">Orders will appear here when customers place them</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG["Pending"];
            const isPaid = order.status === "Delivered";

            return (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="font-bold text-gray-800">{order?.user?.name || "Guest"}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Current status badge */}
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.color}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
                      {order.status}
                    </span>

                    {/* Status selector */}
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updating === order._id}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-gray-50 focus:outline-none focus:border-orange-400 cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Items */}
                <div className="px-5 py-3 space-y-2">
                  {order.items?.map((item, i) => {
                    const m = item.menuItem;
                    if (!m || typeof m !== "object") return (
                      <p key={i} className="text-sm text-gray-500">× {item.quantity} item</p>
                    );
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <img src={m.image} alt={m.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                          <p className="text-xs text-gray-500">₹{m.price} × {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-700">₹{m.price * item.quantity}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Footer — total */}
                <div className={`px-5 py-3 flex items-center justify-between border-t ${isPaid ? 'bg-green-50' : 'bg-orange-50'}`}>
                  <p className={`text-sm font-bold ${isPaid ? 'text-green-700' : 'text-orange-700'}`}>
                    {isPaid ? "✅ Paid — Delivered" : "⏳ Payment Pending at Pickup"}
                  </p>
                  <p className={`text-xl font-black ${isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                    ₹{order.totalAmount}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
