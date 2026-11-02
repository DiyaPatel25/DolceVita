import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Plus, Minus, Search, ShoppingBag, User, X, Banknote, Smartphone, Clock, CheckCircle2, Trash2, Split } from "lucide-react";
import toast from "react-hot-toast";
import CustomizerModal from "../../components/CustomizerModal";

const DRAFT_KEY = "pos-draft";
const rupee = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const lineKey = (menuId, customizations) => `${menuId}|${JSON.stringify(customizations || {})}`;
const hasOptions = (menu) => menu.customizationOptions?.hasExtraCream || menu.customizationOptions?.toppings?.length > 0;

const PAYMENTS = [
  { id: "Cash", label: "Cash", icon: Banknote, active: "bg-green-600 border-green-600 text-white" },
  { id: "Online", label: "UPI / Online", icon: Smartphone, active: "bg-blue-600 border-blue-600 text-white" },
  { id: "Split", label: "Cash + UPI", icon: Split, active: "bg-purple-600 border-purple-600 text-white" },
  { id: "Pending", label: "Pay later", icon: Clock, active: "bg-amber-500 border-amber-500 text-white" },
];

// Suggest the notes a customer is likely to hand over: exact amount, then the next round figures
const cashSuggestions = (total) => {
  if (total <= 0) return [];
  const steps = [50, 100, 200, 500, 1000, 2000];
  const values = new Set([total, ...steps.map((s) => Math.ceil(total / s) * s)]);
  return [...values].filter((v) => v >= total).sort((a, b) => a - b).slice(0, 5);
};

const loadDraft = () => {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY)) || {};
  } catch {
    return {};
  }
};

const TakeOrder = () => {
  const { allMenus: menus, allCategories: categories, axios, fetchMenus } = useContext(AppContext);
  const draft = useMemo(loadDraft, []);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [lines, setLines] = useState(draft.lines || []);
  const [customerName, setCustomerName] = useState(draft.customerName || "");
  const [payment, setPayment] = useState("Cash");
  const [discountValue, setDiscountValue] = useState("");
  const [discountMode, setDiscountMode] = useState("₹");
  const [cashReceived, setCashReceived] = useState("");
  const [onlinePart, setOnlinePart] = useState("");
  const [placing, setPlacing] = useState(false);
  const [customizing, setCustomizing] = useState(null);
  const [billOpen, setBillOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  // Keep the bill if the page is left by accident
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ lines, customerName }));
    } catch {
      /* storage unavailable: draft just isn't kept */
    }
  }, [lines, customerName]);

  // A restored draft may hold old prices; refresh lines whenever the menu loads
  useEffect(() => {
    setLines((prev) => prev.map((l) => ({ ...l, menuItem: menus.find((m) => m._id === l.menuItem._id) || l.menuItem })));
  }, [menus]);

  const visibleMenus = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menus.filter(
      (m) => (category === "all" || m.category?._id === category) && (!q || m.name.toLowerCase().includes(q))
    );
  }, [menus, search, category]);

  const qtyByMenu = useMemo(() => {
    const map = {};
    for (const l of lines) map[l.menuItem._id] = (map[l.menuItem._id] || 0) + l.quantity;
    return map;
  }, [lines]);

  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  const subtotal = lines.reduce((s, l) => s + (Number(l.menuItem.price) + (l.customizations.addOnPrice || 0)) * l.quantity, 0);
  const rawDiscount = Number(discountValue) || 0;
  const discount = Math.min(subtotal, Math.max(0, Math.round(discountMode === "%" ? (subtotal * rawDiscount) / 100 : rawDiscount)));
  const total = subtotal - discount;
  // Split: part paid by UPI, the rest in cash; change is worked out on the cash part only
  const online = payment === "Split" ? Math.round(Number(onlinePart) || 0) : 0;
  const splitInvalid = payment === "Split" && (online <= 0 || online >= total);
  const cashDue = total - online;
  const received = Number(cashReceived) || 0;
  const change = received - cashDue;
  const cashShort = (payment === "Cash" || payment === "Split") && cashReceived !== "" && change < 0;

  const addLine = (menuId, quantity = 1, customizations = {}) => {
    const menuItem = menus.find((m) => m._id === menuId);
    if (!menuItem) return;
    const key = lineKey(menuId, customizations);
    setLines((prev) =>
      prev.some((l) => l.key === key)
        ? prev.map((l) => (l.key === key ? { ...l, quantity: l.quantity + quantity } : l))
        : [...prev, { key, menuItem, quantity, customizations }]
    );
    setLastOrder(null);
  };

  const changeQty = (key, delta) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, quantity: l.quantity + delta } : l)).filter((l) => l.quantity > 0));

  const resetBill = () => {
    setLines([]);
    setCustomerName("");
    setPayment("Cash");
    setOnlinePart("");
    setDiscountValue("");
    setCashReceived("");
  };

  const placeOrder = async () => {
    if (!lines.length || placing || cashShort || splitInvalid) return;
    try {
      setPlacing(true);
      const { data } = await axios.post("/api/order/pos", {
        items: lines.map((l) => ({ menuItem: l.menuItem._id, quantity: l.quantity, customizations: l.customizations })),
        customerName,
        payment,
        onlineAmount: online || undefined,
        discount,
      });
      if (!data.success) return toast.error(data.message || "Could not place order");
      setLastOrder({
        ...data.order,
        received: cashReceived !== "" && (payment === "Cash" || payment === "Split") ? received : null,
      });
      resetBill();
      setBillOpen(true);
      fetchMenus(); // stock changed
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  const bill = (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-black text-lg text-gray-800 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-orange-500" /> Current bill
          {itemCount > 0 && <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{itemCount} item{itemCount !== 1 && "s"}</span>}
        </h2>
        <div className="flex items-center gap-1">
          {lines.length > 0 && (
            <button onClick={resetBill} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Clear bill">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg" onClick={() => setBillOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {lastOrder && lines.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-3" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order #{String(lastOrder._id).slice(-5).toUpperCase()} placed</p>
          <p className="text-4xl font-black text-gray-800 mt-1">{rupee(lastOrder.totalAmount)}</p>
          <p className="text-sm font-semibold text-gray-500 mt-1">
            {lastOrder.payment === "Pending"
              ? "To be paid later"
              : lastOrder.payment === "Split"
                ? `Paid ${rupee(lastOrder.online)} UPI + ${rupee(lastOrder.cash)} cash`
                : `Paid by ${lastOrder.payment === "Online" ? "UPI / Online" : "Cash"}`}
            {lastOrder.customerName !== "Walk-in" && ` · ${lastOrder.customerName}`}
          </p>
          {lastOrder.received !== null && (
            <div className="mt-5 w-full max-w-xs rounded-2xl bg-green-50 border border-green-200 p-4">
              <p className="text-sm text-green-800">
                Received {rupee(lastOrder.received)} − {lastOrder.payment === "Split" ? "Cash part" : "Bill"} {rupee(lastOrder.cash)}
              </p>
              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mt-2">Give back</p>
              <p className="text-4xl font-black text-green-700">{rupee(lastOrder.received - lastOrder.cash)}</p>
            </div>
          )}
          <button onClick={() => { setLastOrder(null); setBillOpen(false); }} className="mt-6 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl">
            Next order
          </button>
        </div>
      ) : lines.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6">
          <ShoppingBag className="w-12 h-12 mb-2 text-gray-200" />
          <p className="font-semibold">Tap items to add them</p>
        </div>
      ) : (
        <>
          <div className="flex-1 min-h-32 overflow-y-auto px-4 py-2 divide-y divide-gray-100">
            {lines.map((l) => {
              const unit = Number(l.menuItem.price) + (l.customizations.addOnPrice || 0);
              const extras = [l.customizations.extraCream && "Extra cream", ...(l.customizations.selectedToppings || []).map((t) => t.name)].filter(Boolean);
              return (
                <div key={l.key} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">{l.menuItem.name}</p>
                    {extras.length > 0 && <p className="text-[11px] text-gray-500 truncate">+ {extras.join(", ")}</p>}
                    <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
                      {l.customizations.addOnPrice > 0 ? `(${rupee(l.menuItem.price)} + ${rupee(l.customizations.addOnPrice)})` : rupee(unit)} × {l.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100 shrink-0">
                    <button onClick={() => changeQty(l.key, -1)} className="w-8 h-8 rounded-md bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-red-500" aria-label="Remove one">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-black text-sm w-6 text-center tabular-nums">{l.quantity}</span>
                    <button onClick={() => changeQty(l.key, 1)} className="w-8 h-8 rounded-md bg-orange-500 text-white shadow-sm flex items-center justify-center hover:bg-orange-600" aria-label="Add one">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="w-16 text-right font-black text-gray-800 tabular-nums shrink-0">{rupee(unit * l.quantity)}</p>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
            <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-200 rounded-xl focus-within:border-orange-400">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Customer name (optional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-transparent outline-none flex-1 text-sm font-semibold text-gray-800 placeholder:font-normal placeholder:text-gray-400"
              />
            </div>

            {/* The math, line by line */}
            <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-1.5 text-sm tabular-nums">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({itemCount} item{itemCount !== 1 && "s"})</span>
                <span className="font-bold">{rupee(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-gray-600">
                <span>Discount</span>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {["₹", "%"].map((m) => (
                      <button key={m} onClick={() => setDiscountMode(m)} className={`px-2 py-1 text-xs font-bold ${discountMode === m ? "bg-gray-800 text-white" : "bg-white text-gray-500"}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-right font-bold outline-none focus:border-orange-400"
                  />
                  <span className="w-14 text-right font-bold text-red-500">{discount > 0 ? `−${rupee(discount)}` : "—"}</span>
                </div>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-gray-200">
                <span className="font-black text-gray-800">Total to pay</span>
                <span className="font-black text-3xl text-orange-600">{rupee(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {PAYMENTS.map(({ id, label, icon, active }) => {
                const Icon = icon;
                return (
                <button
                  key={id}
                  onClick={() => setPayment(id)}
                  className={`py-2.5 rounded-xl border-2 text-xs font-black flex flex-col items-center gap-1 transition-colors ${payment === id ? active : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
                );
              })}
            </div>

            {payment === "Split" && (
              <div className="bg-white rounded-xl border border-purple-200 p-3 space-y-2 tabular-nums">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-gray-600">Paid by UPI</span>
                  <input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    placeholder="₹ online"
                    value={onlinePart}
                    onChange={(e) => setOnlinePart(e.target.value)}
                    className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg text-right font-black outline-none focus:border-purple-500"
                  />
                </div>
                <div className={`flex justify-between items-baseline rounded-lg px-3 py-2 ${splitInvalid ? "bg-red-50 text-red-600" : "bg-purple-50 text-purple-700"}`}>
                  <span className="text-xs font-bold">
                    {splitInvalid ? `Enter ₹1 – ${rupee(total - 1)}` : `${rupee(total)} − ${rupee(online)} UPI = cash to take`}
                  </span>
                  {!splitInvalid && <span className="text-2xl font-black">{rupee(cashDue)}</span>}
                </div>
              </div>
            )}

            {(payment === "Cash" || (payment === "Split" && !splitInvalid)) && (
              <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-gray-600">Cash received</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder="Optional"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg text-right font-black outline-none focus:border-green-500"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cashSuggestions(cashDue).map((v) => (
                    <button key={v} onClick={() => setCashReceived(String(v))} className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${received === v ? "bg-green-600 border-green-600 text-white" : "bg-gray-50 border-gray-200 text-gray-700 hover:border-green-400"}`}>
                      {v === cashDue ? "Exact" : rupee(v)}
                    </button>
                  ))}
                </div>
                {cashReceived !== "" && (
                  <div className={`flex justify-between items-baseline rounded-lg px-3 py-2 tabular-nums ${cashShort ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                    <span className="text-xs font-bold">
                      {rupee(received)} − {rupee(cashDue)} = {cashShort ? "short by" : "give back"}
                    </span>
                    <span className="text-2xl font-black">{rupee(Math.abs(change))}</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={placeOrder}
              disabled={placing || cashShort || splitInvalid}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] transition"
            >
              {placing ? "Placing..." : splitInvalid ? "Enter the UPI amount" : cashShort ? "Cash is short" : `Place order · ${rupee(total)}`}
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="h-[calc(100vh-130px)] flex gap-4 relative">
      {/* Menu */}
      <div className="flex-1 min-w-0 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-gray-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[{ _id: "all", name: "All" }, ...categories].map((c) => (
              <button
                key={c._id}
                onClick={() => setCategory(c._id)}
                className={`px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap border ${category === c._id ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-orange-300"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 pb-24 lg:pb-3">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
            {visibleMenus.map((menu) => {
              const qty = qtyByMenu[menu._id];
              const outOfStock = menu.countInStock === 0;
              return (
                <button
                  key={menu._id}
                  onClick={() => (hasOptions(menu) ? setCustomizing(menu) : addLine(menu._id))}
                  className={`relative text-left rounded-xl border-2 overflow-hidden transition active:scale-[0.97] ${qty ? "border-orange-500 shadow-md" : "border-gray-100 hover:border-orange-300"}`}
                >
                  <img src={menu.image} alt="" loading="lazy" className="w-full h-24 object-cover bg-gray-100" />
                  {qty > 0 && (
                    <span className="absolute top-2 right-2 min-w-7 h-7 px-1.5 rounded-full bg-orange-500 text-white text-sm font-black flex items-center justify-center shadow">
                      {qty}
                    </span>
                  )}
                  {outOfStock && <span className="absolute top-2 left-2 text-[10px] font-black uppercase bg-gray-800/80 text-white px-1.5 py-0.5 rounded">Out of stock</span>}
                  <div className="p-2.5">
                    <p className="font-bold text-sm text-gray-800 leading-tight line-clamp-2">{menu.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-black text-orange-600">{rupee(menu.price)}</span>
                      {hasOptions(menu) && <span className="text-[10px] font-bold text-gray-400 uppercase">Options</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {visibleMenus.length === 0 && <div className="text-center text-gray-400 mt-10">No items found</div>}
        </div>
      </div>

      {/* Bill: side panel on desktop, bottom sheet on mobile */}
      <div className="hidden lg:block w-[400px] shrink-0 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">{bill}</div>
      {billOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setBillOpen(false)}>
          <div className="absolute inset-x-0 bottom-0 top-12 rounded-t-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {bill}
          </div>
        </div>
      )}
      {!billOpen && itemCount > 0 && (
        <button
          onClick={() => setBillOpen(true)}
          className="lg:hidden fixed bottom-4 inset-x-4 z-40 py-4 px-5 bg-orange-500 text-white rounded-2xl shadow-xl flex items-center justify-between font-black"
        >
          <span>{itemCount} item{itemCount !== 1 && "s"} · {rupee(total)}</span>
          <span>View bill →</span>
        </button>
      )}

      {customizing && (
        <CustomizerModal key={customizing._id} isOpen item={customizing} onClose={() => setCustomizing(null)} onAddToCart={addLine} />
      )}
    </div>
  );
};

export default TakeOrder;
