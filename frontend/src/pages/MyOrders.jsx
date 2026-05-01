import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { ShoppingBag, Clock, CheckCircle, ChefHat, Package } from "lucide-react";

const STATUS_CONFIG = {
  Pending:    { label: "Pending",    color: "bg-yellow-100 text-yellow-700",  icon: Clock,        dot: "bg-yellow-400" },
  Preparing:  { label: "Preparing",  color: "bg-blue-100 text-blue-700",      icon: ChefHat,      dot: "bg-blue-400"   },
  Ready:      { label: "Ready",      color: "bg-green-100 text-green-700",    icon: Package,      dot: "bg-green-400"  },
  Delivered:  { label: "Delivered",  color: "bg-gray-100 text-gray-600",      icon: CheckCircle,  dot: "bg-gray-400"   },
};

const MyOrders = () => {
  const { axios, navigate } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/order/my-orders");
      if (data.success) setOrders(data.orders);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyOrders(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-10 h-10 text-orange-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>No orders yet</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Start by browsing our menu!</p>
          <button onClick={() => navigate("/menu")} className="px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold transition">
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-black mb-1 text-center" style={{ color: 'var(--text-color)' }}>My Orders</h1>
        <p className="text-center text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>

        <div className="space-y-4">
          {orders.map((order) => {
            const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG["Pending"];
            const StatusIcon = statusCfg.icon;
            const isPaid = order.paymentStatus === "Paid" || order.paymentMethod === "Online Payment";

            return (
              <div key={order._id}
                className="rounded-2xl border shadow-sm overflow-hidden"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Order</p>
                    <p className="font-black text-sm" style={{ color: 'var(--text-color)' }}>#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusCfg.color}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} animate-pulse`} />
                    {statusCfg.label}
                  </div>
                </div>

                {/* Items */}
                <div className="px-5 py-3 divide-y" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                  </p>
                  {order.items?.map((item, i) => {
                    const m = item.menuItem;
                    if (!m || typeof m !== "object") return (
                      <p key={i} className="text-sm py-1" style={{ color: 'var(--text-secondary)' }}>Item × {item.quantity}</p>
                    );
                    return (
                      <div key={i} className="flex items-center gap-3 py-2">
                        <img src={m.image} alt={m.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>{m.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>₹{m.price} × {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>₹{m.price * item.quantity}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Footer — payment status */}
                <div className={`px-5 py-4 flex items-center justify-between border-t ${isPaid ? 'bg-green-50' : 'bg-orange-50'}`}
                  style={{ borderColor: 'var(--border-color)' }}>
                  <div>
                    <p className="text-xs font-bold uppercase" style={{ color: isPaid ? '#16a34a' : '#ea580c' }}>
                      {isPaid ? "✅ Payment Received" : "⏳ Amount to be paid"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {isPaid ? "Thank you! Enjoy your meal." : order.orderType === "Delivery" ? "Payment pending for delivery" : "Pay at the counter when you collect"}
                    </p>
                  </div>
                  <p className={`text-2xl font-black ${isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                    ₹{order.totalAmount}
                  </p>
                </div>

                {/* Date */}
                <div className="px-5 py-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Ordered on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
