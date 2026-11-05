import { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, Store } from "lucide-react";
import toast from "react-hot-toast";
import { AppContext } from "../context/AppContext";
import { STORE } from "../store";

const DETAILS_KEY = "pickup-details";
const ASAP = "As soon as possible";

const loadDetails = () => {
  try {
    return JSON.parse(localStorage.getItem(DETAILS_KEY)) || {};
  } catch {
    return {};
  }
};

// The next few half-hour slots, starting at least 30 minutes from now
const pickupSlots = () => {
  const slots = [];
  const t = new Date(Date.now() + 30 * 60 * 1000);
  t.setMinutes(t.getMinutes() < 30 ? 30 : 60, 0, 0);
  for (let i = 0; i < 8; i++) {
    slots.push(t.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }));
    t.setMinutes(t.getMinutes() + 30);
  }
  return slots;
};

const extrasOf = (c = {}) => [c.extraCream && "Extra cream", ...(c.selectedToppings || []).map((t) => t.name)].filter(Boolean);

// Cart and checkout in one page: review the items, add pickup details, place the order
const Cart = () => {
  const { cart, totalPrice, cartCount, navigate, axios, fetchCartData, setCart, user } = useContext(AppContext);
  const saved = useMemo(loadDetails, []);
  const [name, setName] = useState(saved.name || user?.name || "");
  const [phone, setPhone] = useState(saved.phone || "");
  const [pickupTime, setPickupTime] = useState(ASAP);
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState({});
  const slots = useMemo(pickupSlots, []);

  const items = (cart?.items || []).filter((i) => i.menuItem && typeof i.menuItem === "object");

  const changeQty = async (line, delta) => {
    try {
      await axios.post("/api/cart/add", { menuId: line.menuItem._id, quantity: delta, customizations: line.customizations || {} });
      fetchCartData();
    } catch {
      toast.error("Couldn't update your order. Check your connection and try again.");
    }
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Enter the name we should call out at pickup.";
    if (!/^[6-9]\d{9}$/.test(digits)) nextErrors.phone = "Enter a 10-digit mobile number.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setPlacing(true);
      const { data } = await axios.post("/api/order/place", {
        name: name.trim(),
        guestName: name.trim(),
        phone: digits,
        pickupTime,
        note,
        orderType: "Pickup",
        address: "Pickup",
        paymentMethod: "Pay at Counter",
        cartItems: items.map((i) => ({ menuItem: i.menuItem._id, quantity: i.quantity, customizations: i.customizations || {} })),
      });
      if (!data.success) return toast.error(data.message || "Couldn't place your order. Try again.");
      try {
        localStorage.setItem(DETAILS_KEY, JSON.stringify({ name: name.trim(), phone: digits }));
      } catch {
        /* storage unavailable: details just aren't remembered */
      }
      setCart({ items: [] });
      navigate("/order-placed", { replace: true, state: { order: data.order } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Couldn't place your order. Check your connection and try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4" style={{ backgroundColor: "var(--bg-color)" }}>
        <div className="text-center max-w-sm">
          <ShoppingBag className="w-14 h-14 mx-auto text-copper-500" />
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-wide">Your order is empty</h1>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>Add a few desserts from the menu, then come back here to place your pickup order.</p>
          <Link to="/menu" className="mt-6 inline-block px-7 py-3.5 rounded-full bg-copper-500 hover:bg-copper-400 text-chalk font-bold">
            Browse the menu
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border bg-transparent outline-none focus:border-copper-500 transition-colors";
  const inputStyle = { borderColor: "var(--border-color)", backgroundColor: "var(--card-bg)" };

  return (
    <div className="min-h-screen pb-28 lg:pb-16" style={{ backgroundColor: "var(--bg-color)" }}>
      <form onSubmit={placeOrder} noValidate className="max-w-5xl mx-auto px-4 pt-8 lg:grid lg:grid-cols-[1fr_380px] lg:gap-10 lg:items-start">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-wide">Your order</h1>
          <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
            {cartCount} {cartCount === 1 ? "item" : "items"}.{" "}
            <Link to="/menu" className="text-copper-500 font-semibold hover:underline">Add more</Link>
          </p>

          <ul className="mt-6 divide-y border-y" style={{ borderColor: "var(--border-color)" }}>
            {items.map((line) => {
              const unit = Number(line.menuItem.price) + (line.customizations?.addOnPrice || 0);
              const extras = extrasOf(line.customizations);
              return (
                <li key={line._id || line.menuItem._id + JSON.stringify(line.customizations)} className="py-4 flex gap-4" style={{ borderColor: "var(--border-color)" }}>
                  <img src={line.menuItem.image} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold leading-snug">{line.menuItem.name}</p>
                    {extras.length > 0 && <p className="text-sm" style={{ color: "var(--text-secondary)" }}>with {extras.join(", ")}</p>}
                    <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>₹{unit} each</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="inline-flex items-center rounded-full border" style={{ borderColor: "var(--border-color)" }}>
                        <button type="button" onClick={() => changeQty(line, -1)} className="w-9 h-9 flex items-center justify-center" aria-label={`One less ${line.menuItem.name}`}>
                          <Minus size={15} />
                        </button>
                        <span className="w-6 text-center font-bold" aria-live="polite">{line.quantity}</span>
                        <button type="button" onClick={() => changeQty(line, 1)} className="w-9 h-9 flex items-center justify-center" aria-label={`One more ${line.menuItem.name}`}>
                          <Plus size={15} />
                        </button>
                      </div>
                      <button type="button" onClick={() => changeQty(line, -line.quantity)} className="p-2 rounded-full hover:bg-[var(--hover-bg)]" aria-label={`Remove ${line.menuItem.name}`} style={{ color: "var(--text-secondary)" }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="font-bold shrink-0">₹{unit * line.quantity}</p>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="mt-10 lg:mt-0 lg:sticky lg:top-24 rounded-2xl border p-5 space-y-5" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--card-bg)" }}>
          <div className="flex items-start gap-3">
            <Store className="text-copper-500 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold">Pickup from the stall</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {STORE.pickupPoint || "We'll have it ready at the Dolce Vita counter."} Pay when you collect, cash or UPI.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-1.5">Your name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputClass} style={inputStyle} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
            {errors.name && <p id="name-error" className="mt-1 text-sm" style={{ color: "var(--error-color)" }}>{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold mb-1.5">Mobile number</label>
            <input id="phone" type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel-national" placeholder="10-digit number" className={inputClass} style={inputStyle} aria-invalid={!!errors.phone} aria-describedby="phone-help" />
            <p id="phone-help" className="mt-1 text-sm" style={{ color: errors.phone ? "var(--error-color)" : "var(--text-secondary)" }}>
              {errors.phone || "We'll call only if there's a problem with your order."}
            </p>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold mb-1.5">When will you pick it up?</legend>
            <select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className={inputClass} style={inputStyle} aria-label="Pickup time">
              <option value={ASAP}>{ASAP} (about 15 min)</option>
              {slots.map((s) => <option key={s} value={`Today ${s}`}>Today, {s}</option>)}
            </select>
          </fieldset>

          <div>
            <label htmlFor="note" className="block text-sm font-semibold mb-1.5">Note for the stall <span className="font-normal" style={{ color: "var(--text-secondary)" }}>(optional)</span></label>
            <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={200} placeholder="Less sugar, birthday candle, anything else" className={`${inputClass} resize-none`} style={inputStyle} />
          </div>

          <div className="flex items-baseline justify-between border-t pt-4" style={{ borderColor: "var(--border-color)" }}>
            <span className="font-semibold">To pay at pickup</span>
            <span className="text-2xl font-black">₹{totalPrice}</span>
          </div>

          {/* On phones the button sits in a bar at the bottom of the screen */}
          <div className="fixed inset-x-0 bottom-0 z-40 p-3 border-t lg:static lg:p-0 lg:border-0" style={{ backgroundColor: "var(--bg-color)", borderColor: "var(--border-color)" }}>
            <button type="submit" disabled={placing} className="w-full py-4 rounded-2xl bg-copper-500 hover:bg-copper-400 text-chalk font-black text-lg disabled:opacity-60 transition-colors">
              {placing ? "Placing your order..." : `Place pickup order, ₹${totalPrice}`}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default Cart;
