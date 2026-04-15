import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { ShoppingCart, X, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const FloatingCart = () => {
  const { cart, totalPrice, cartCount, navigate, axios, fetchCartData, addToCart } = useContext(AppContext);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Don't show on cart/checkout/admin pages
  if (location.pathname.includes("/cart") || location.pathname.includes("/checkout") || location.pathname.includes("/admin")) {
    return null;
  }

  if (!cart?.items?.length) return null;

  const removeItem = async (menuId) => {
    try {
      await axios.delete(`/api/cart/remove/${menuId}`);
      fetchCartData();
    } catch (e) {
      toast.error("Could not remove item");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Expanded cart panel */}
      {open && (
        <div className="w-[calc(100vw-3rem)] max-w-xs sm:max-w-sm rounded-2xl shadow-2xl border bg-white overflow-hidden"
          style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.18)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 text-white"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="font-bold text-sm">Your Cart ({cartCount} items)</span>
            </div>
            <button onClick={() => setOpen(false)} className="hover:opacity-70 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Items */}
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
            {cart.items.map((item) => {
              const menuItem = item.menuItem;
              if (!menuItem || typeof menuItem !== "object") return null;
              return (
                <div key={item._id || menuItem._id} className="flex items-center gap-3 px-4 py-3">
                  <img src={menuItem.image} alt={menuItem.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-gray-800 truncate">{menuItem.name}</p>
                    <p className="text-xs text-gray-500">₹{menuItem.price} × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={async () => {
                        if (item.quantity <= 1) { await removeItem(menuItem._id); }
                        else { await axios.post("/api/cart/add", { menuId: menuItem._id, quantity: -1 }); fetchCartData(); }
                      }}
                      className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold hover:bg-orange-200 transition"
                    >−</button>
                    <span className="text-sm font-bold text-gray-700 w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(menuItem._id)}
                      className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold hover:bg-orange-600 transition"
                    >+</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Total</span>
              <span className="font-black text-orange-500">₹{totalPrice}</span>
            </div>
            <button
              onClick={() => { setOpen(false); navigate("/checkout"); }}
              className="w-full py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
            >
              Place Order →
            </button>
          </div>
        </div>
      )}

      {/* Floating bubble */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative flex items-center gap-2 px-5 py-3.5 rounded-full text-white font-bold shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 8px 32px rgba(249,115,22,0.5)' }}
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="text-sm">{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
        <span className="font-black">· ₹{totalPrice}</span>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default FloatingCart;
