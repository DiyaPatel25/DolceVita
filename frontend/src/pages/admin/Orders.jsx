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
  
  const [revenueStats, setRevenueStats] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/orders");
      if (data.success) {
        // Exclude POS orders
        const regularOrders = data.orders.filter(o => o.address !== "Stall Order" && o.orderType !== "Stall");
        setOrders(regularOrders);
      }
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

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);
      let payload = {};
      if (newStatus === "Pending") {
        payload = { paymentStatus: "Pending" };
      } else if (newStatus === "Paid (Cash)") {
        payload = { paymentStatus: "Paid", paymentMethod: "Cash" };
      } else if (newStatus === "Paid (Online Payment)") {
        payload = { paymentStatus: "Paid", paymentMethod: "Online Payment" };
      }

      const { data } = await axios.put(`/api/order/update-status/${orderId}`, payload);
      if (data.success) {
        toast.success(`Payment status updated`);
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update payment status");
    } finally {
      setUpdating(null);
    }
  };

  const calculateRevenue = async () => {
    try {
      setCalculating(true);
      const { data } = await axios.get("/api/order/calculate-revenue");
      if (data.success) {
        setRevenueStats(data.data);
        toast.success("Revenue calculated & saved!");
      } else {
        toast.error("Failed to calculate revenue");
      }
    } catch (error) {
      toast.error("Error calculating revenue");
    } finally {
      setCalculating(false);
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
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
        </div>
        <button 
          onClick={calculateRevenue}
          disabled={calculating}
          className="px-4 py-2 bg-green-50 text-green-700 font-bold rounded-lg border border-green-200 hover:bg-green-100 transition-colors shadow-sm"
        >
          {calculating ? "Calculating..." : "Calculate Today's Revenue"}
        </button>
      </div>

      {revenueStats && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Total Revenue (Today)</p>
            <p className="text-3xl font-black text-gray-800 mt-2">₹{revenueStats.totalRevenue}</p>
            <p className="text-xs text-gray-400 mt-1">{revenueStats.ordersCount} paid orders</p>
          </div>
          <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 shadow-sm">
            <p className="text-xs text-orange-600/70 uppercase font-bold tracking-wide">Cash Revenue</p>
            <p className="text-3xl font-black text-orange-600 mt-2">₹{revenueStats.cashRevenue}</p>
          </div>
          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-sm">
            <p className="text-xs text-blue-600/70 uppercase font-bold tracking-wide">Online Revenue</p>
            <p className="text-3xl font-black text-blue-600 mt-2">₹{revenueStats.onlineRevenue}</p>
          </div>
        </div>
      )}

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
            const isPaid = order.paymentStatus === "Paid" || order.paymentMethod === "Online Payment";

            return (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="font-bold text-gray-800">{order?.guestName || order?.user?.name || "Guest"}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
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

                    {/* Payment Status selector */}
                    <select
                      value={order.paymentStatus === "Paid" ? (order.paymentMethod === "Online Payment" ? "Paid (Online Payment)" : "Paid (Cash)") : "Pending"}
                      onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                      disabled={updating === order._id}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-gray-50 focus:outline-none focus:border-orange-400 cursor-pointer"
                    >
                      <option value="Pending">Pay Pending</option>
                      <option value="Paid (Cash)">Paid (Cash)</option>
                      <option value="Paid (Online Payment)">Paid (Online)</option>
                    </select>
                  </div>
                </div>

                {/* Items */}
                <div className="px-5 py-3 space-y-3">
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
                          {item.customizations?.addOnPrice > 0 && (
                            <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
                              + Customizations (₹{item.customizations.addOnPrice})
                            </p>
                          )}
                        </div>
                        <p className="text-sm font-bold text-gray-700">
                          ₹{(m.price * item.quantity) + ((item.customizations?.addOnPrice || 0) * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Footer — total */}
                <div className={`px-5 py-3 flex items-center justify-between border-t ${isPaid ? 'bg-green-50' : 'bg-orange-50'}`}>
                  <p className={`text-sm font-bold ${isPaid ? 'text-green-700' : 'text-orange-700'}`}>
                    {isPaid ? `✅ Paid (${order.paymentMethod === "Online Payment" ? "Online" : "Cash"})` : order.orderType === "Delivery" ? "⏳ Payment Pending for Delivery" : "⏳ Payment Pending at Pickup"}
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
