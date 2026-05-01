import { useContext, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { ShoppingBag, User, Mail, Lock, CheckCircle, Home, Truck, CreditCard } from "lucide-react";

const Checkout = () => {
  const { totalPrice, cart, axios, navigate, user, setUser, setCart } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orderType, setOrderType] = useState("Pickup");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pay at Counter");

  const availablePaymentMethods = useMemo(() => {
    if (orderType === "Delivery") {
      return [{ value: "Online Payment", label: "Online Payment (UPI / Card)", icon: CreditCard }];
    }

    return [
      { value: "Pay at Counter", label: "Pay at Counter", icon: Home },
      { value: "Online Payment", label: "Online Payment (UPI / Card)", icon: CreditCard },
    ];
  }, [orderType]);

  const selectedPaymentIsOnline = paymentMethod === "Online Payment";

  const placeOrder = async () => {
    if (!user) {
      if (!name || !email) {
        toast.error("Please fill your name and email to continue");
        return;
      }
      if (orderType !== "Delivery" && paymentMethod !== "Online Payment" && !password) {
        toast.error("Please fill your password to continue");
        return;
      }
    }

    if (orderType === "Delivery" && !address.trim()) {
      toast.error("Please add a delivery address");
      return;
    }

    if (orderType === "Delivery" && paymentMethod !== "Online Payment") {
      toast.error("Delivery orders must be paid online");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        orderType,
        address: orderType === "Delivery" ? address.trim() : "Pickup",
        paymentMethod: orderType === "Delivery" ? "Online Payment" : paymentMethod,
        cartItems: cart?.items?.map((item) => ({
          menuItem: item.menuItem?._id || item.menuItem,
          quantity: item.quantity,
        })) || [],
      };

      if (!user) {
        payload.name = name;
        payload.email = email;
        if (orderType !== "Delivery" && paymentMethod !== "Online Payment") {
          payload.password = password;
        }
      }

      const { data } = await axios.post("/api/order/place", payload);
      if (data.success) {
        toast.success(orderType === "Delivery" ? "Order placed and paid online!" : paymentMethod === "Online Payment" ? "Order placed and paid online!" : "Order placed! See you at the counter 🎉");
        if (data.user) setUser(data.user);
        setCart({ items: [] });
        navigate("/my-orders");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-color)' }}>Your cart is empty</h2>
          <button onClick={() => navigate("/menu")} className="mt-4 px-6 py-2 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition">Browse Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-black mb-2 text-center" style={{ color: 'var(--text-color)' }}>Confirm Your Order</h1>
        <p className="text-center text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
          {orderType === "Delivery" ? "Delivery orders require online payment." : "Pickup orders can be paid at the counter or online."}
        </p>

        {/* Order Type */}
        <div className="rounded-2xl border shadow-sm mb-6 p-5" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <p className="font-bold text-sm mb-3" style={{ color: 'var(--text-color)' }}>Order Type</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${orderType === "Pickup" ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-transparent"}`}>
              <input type="radio" name="orderType" value="Pickup" checked={orderType === "Pickup"} onChange={(e) => { setOrderType(e.target.value); setPaymentMethod("Pay at Counter"); }} />
              <Truck className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-color)' }}>Pickup</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Collect from counter</p>
              </div>
            </label>
            <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${orderType === "Delivery" ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-transparent"}`}>
              <input type="radio" name="orderType" value="Delivery" checked={orderType === "Delivery"} onChange={(e) => { setOrderType(e.target.value); setPaymentMethod("Online Payment"); }} />
              <Home className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-color)' }}>Delivery</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Door delivery, online payment only</p>
              </div>
            </label>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="rounded-2xl border shadow-sm mb-6 overflow-hidden" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>ORDER SUMMARY</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {cart.items.map((item) => {
              const m = item.menuItem;
              if (!m || typeof m !== "object") return null;
              return (
                <div key={m._id} className="flex items-center gap-3 px-5 py-3">
                  <img src={m.image} alt={m.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-color)' }}>{m.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>₹{m.price} × {item.quantity}</p>
                  </div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-color)' }}>₹{m.price * item.quantity}</p>
                </div>
              );
            })}
          </div>
          {/* Total */}
          <div className="px-5 py-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}>
            <span className="font-bold" style={{ color: 'var(--text-color)' }}>Total to Pay</span>
            <span className="text-2xl font-black text-orange-500">₹{totalPrice}</span>
          </div>
        </div>

        {/* Address */}
        {orderType === "Delivery" && (
          <div className="rounded-2xl border shadow-sm mb-6 p-5" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-color)' }}>Delivery Address *</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter house number, street, area, landmark..."
              rows={4}
              className="w-full rounded-xl border px-4 py-3 outline-none resize-none"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)', color: 'var(--text-color)' }}
            />
          </div>
        )}

        {/* Payment method */}
        <div className="rounded-2xl border shadow-sm mb-6 p-5" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <p className="font-bold text-sm mb-3" style={{ color: 'var(--text-color)' }}>Payment Method</p>
          <div className="space-y-3">
            {availablePaymentMethods.map(({ value, label, icon: Icon }) => (
              <label key={value} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === value ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-transparent"}`}>
                <input type="radio" name="paymentMethod" value={value} checked={paymentMethod === value} onChange={(e) => setPaymentMethod(e.target.value)} />
                <Icon className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-color)' }}>{label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{value === "Pay at Counter" ? "Pay when you collect the order" : "Immediate online checkout"}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Notice */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 bg-orange-50 border border-orange-100">
          <CheckCircle className="w-5 h-5 text-orange-500 shrink-0" />
          <p className="text-sm text-orange-700 font-medium">
            {orderType === "Delivery"
              ? <><strong>Delivery order</strong> is prepaid online. Counter payment is disabled.</>
              : <><strong>Pickup order</strong> can be paid at the counter or online.</>}
          </p>
        </div>

        {/* Guest fields */}
        {!user && (
          <div className="rounded-2xl border shadow-sm mb-6 p-5 space-y-3" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-color)' }}>
              {paymentMethod === "Online Payment" ? "Enter your details to continue" : "Create account to track your order"}
            </p>
            {[
              { icon: User, placeholder: "Full Name", value: name, setter: setName, type: "text" },
              { icon: Mail, placeholder: "Email Address", value: email, setter: setEmail, type: "email" },
              { icon: Lock, placeholder: paymentMethod === "Online Payment" ? "Password (optional)" : "Create a Password", value: password, setter: setPassword, type: "password" },
            ].map(({ icon: Icon, placeholder, value, setter, type }) => (
              <div key={placeholder} className="flex items-center gap-3 px-4 h-11 rounded-xl border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}>
                <Icon className="w-4 h-4 shrink-0" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type={type}
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full"
                  style={{ color: 'var(--text-color)' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Place Order Button */}
        <button
          onClick={placeOrder}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-black text-white text-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Placing Order...
            </span>
          ) : selectedPaymentIsOnline || orderType === "Delivery" ? "Pay Online & Place Order 💳" : "Place Order 🍽️"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
