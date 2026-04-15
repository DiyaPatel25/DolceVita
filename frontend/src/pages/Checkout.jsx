import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { ShoppingBag, User, Mail, Lock, CheckCircle } from "lucide-react";

const Checkout = () => {
  const { totalPrice, cart, axios, navigate, user, setUser } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const placeOrder = async () => {
    if (!user && (!name || !email || !password)) {
      toast.error("Please fill your name, email and password to continue");
      return;
    }
    try {
      setLoading(true);
      const payload = {};
      if (!user) { payload.name = name; payload.email = email; payload.password = password; }
      const { data } = await axios.post("/api/order/place", payload);
      if (data.success) {
        toast.success("Order placed! See you at the counter 🎉");
        if (data.user) setUser(data.user);
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
        <p className="text-center text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Pick up your order at the counter after placing</p>

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

        {/* Pickup notice */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 bg-orange-50 border border-orange-100">
          <CheckCircle className="w-5 h-5 text-orange-500 shrink-0" />
          <p className="text-sm text-orange-700 font-medium">This is a <strong>pickup order</strong>. Pay at the counter when you collect your food.</p>
        </div>

        {/* Guest fields */}
        {!user && (
          <div className="rounded-2xl border shadow-sm mb-6 p-5 space-y-3" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
            <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-color)' }}>Create account to track your order</p>
            {[
              { icon: User, placeholder: "Full Name", value: name, setter: setName, type: "text" },
              { icon: Mail, placeholder: "Email Address", value: email, setter: setEmail, type: "email" },
              { icon: Lock, placeholder: "Create a Password", value: password, setter: setPassword, type: "password" },
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
          ) : "Place Order 🍽️"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
