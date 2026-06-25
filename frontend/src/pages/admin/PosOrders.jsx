import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import { ShoppingBag } from "lucide-react";

const POS_STATUS_OPTIONS = ["Pending", "Delivered"];

const POS_STATUS_CONFIG = {
  Pending:   { color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-400" },
  Delivered: { color: "bg-gray-100 text-gray-600 border-gray-200",       dot: "bg-gray-400"   },
};

const PosOrders = () => {
  const { admin, axios } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [pastRevenues, setPastRevenues] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchPosOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/orders");
      if (data.success) {
        // Filter ONLY POS orders
        const posOrders = data.orders.filter(o => o.address === "Stall Order" || o.orderType === "Stall");
        setOrders(posOrders);
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
        fetchPosOrders();
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
      if (newStatus === "Pay Pending") {
        payload = { paymentStatus: "Pending", paymentMethod: "Pay at Counter" };
      } else if (newStatus === "Pay by Cash") {
        payload = { paymentStatus: "Paid", paymentMethod: "Cash" };
      } else if (newStatus === "Pay by Online") {
        payload = { paymentStatus: "Paid", paymentMethod: "Online Payment" };
      }

      const { data } = await axios.put(`/api/order/update-status/${orderId}`, payload);
      if (data.success) {
        toast.success(`Payment updated`);
        fetchPosOrders();
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

  const fetchHistory = async () => {
    if (showHistory) {
      setShowHistory(false);
      return;
    }
    try {
      setLoadingHistory(true);
      const { data } = await axios.get("/api/order/revenues");
      if (data.success) {
        setPastRevenues(data.data);
        setShowHistory(true);
      }
    } catch (error) {
      toast.error("Failed to load analytics");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => { if (admin) fetchPosOrders(); }, [admin]);

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
          <h1 className="text-2xl font-black text-gray-800">POS Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} total POS order{orders.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={fetchHistory}
            disabled={loadingHistory}
            className="px-4 py-2 bg-purple-50 text-purple-700 font-bold rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            {loadingHistory ? "Loading..." : (showHistory ? "Hide Analytics" : "📊 Past Days Analytics")}
          </button>
          <button 
            onClick={calculateRevenue}
            disabled={calculating}
            className="px-4 py-2 bg-green-50 text-green-700 font-bold rounded-lg border border-green-200 hover:bg-green-100 transition-colors shadow-sm cursor-pointer"
          >
            {calculating ? "Calculating..." : "Calculate Today's Revenue"}
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="mb-8 bg-white p-6 rounded-2xl border border-purple-100 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
              📊 Daily Revenue History
            </h3>
            <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-full">
              {pastRevenues.length} Days Recorded
            </span>
          </div>
          {pastRevenues.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No historical revenue data found yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase font-bold">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Orders</th>
                    <th className="py-3 px-4 text-orange-600">Cash</th>
                    <th className="py-3 px-4 text-blue-600">Online</th>
                    <th className="py-3 px-4 text-green-600">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-semibold text-gray-700">
                  {pastRevenues.map((rev) => (
                    <tr key={rev._id || rev.date} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-bold text-gray-900">{rev.date}</td>
                      <td className="py-3 px-4">{rev.ordersCount}</td>
                      <td className="py-3 px-4 text-orange-600">₹{rev.cashRevenue}</td>
                      <td className="py-3 px-4 text-blue-600">₹{rev.onlineRevenue}</td>
                      <td className="py-3 px-4 font-black text-green-600 text-base">₹{rev.totalRevenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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
          <h3 className="text-gray-700 font-semibold text-lg">No POS orders yet</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const cfg = POS_STATUS_CONFIG[order.status] || POS_STATUS_CONFIG["Pending"];
            const isPaid = order.paymentStatus === "Paid";
            
            let currentPaymentVal = "Pay Pending";
            if (isPaid && order.paymentMethod === "Cash") currentPaymentVal = "Pay by Cash";
            if (isPaid && order.paymentMethod === "Online Payment") currentPaymentVal = "Pay by Online";

            return (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">POS #{order._id.slice(-8).toUpperCase()}</p>
                    {/* Fallback to display name correctly */}
                    <p className="font-bold text-gray-800 text-lg">
                      {order.guestName || "Stall Customer"}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.color}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${order.status === 'Pending' ? 'animate-pulse' : ''}`} />
                      {order.status}
                    </span>

                    <select
                      value={order.status === "Delivered" ? "Delivered" : "Pending"}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updating === order._id}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-gray-50 focus:outline-none focus:border-orange-400 cursor-pointer"
                    >
                      {POS_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <select
                      value={currentPaymentVal}
                      onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                      disabled={updating === order._id}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-gray-50 focus:outline-none focus:border-orange-400 cursor-pointer font-semibold"
                    >
                      <option value="Pay Pending">Pay Pending</option>
                      <option value="Pay by Cash">Pay by Cash</option>
                      <option value="Pay by Online">Pay by Online</option>
                    </select>
                  </div>
                </div>

                <div className="px-5 py-3 space-y-3">
                  {order.items?.map((item, i) => {
                    const m = item.menuItem;
                    if (!m) return null;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <img src={m.image} alt={m.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                          <p className="text-xs text-gray-500">₹{m.price} × {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-700">
                          ₹{(m.price * item.quantity) + ((item.customizations?.addOnPrice || 0) * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PosOrders;
