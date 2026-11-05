import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { AppContext } from "../context/AppContext";

const HIDDEN_ON = ["/cart", "/checkout", "/order-placed", "/admin", "/login", "/signup"];

// Always-visible way back to the order: full-width bar on phones, a pill on larger screens
const FloatingCart = () => {
  const { totalPrice, cartCount, navigate } = useContext(AppContext);
  const { pathname } = useLocation();

  if (!cartCount || HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:p-0 pointer-events-none">
      <button
        onClick={() => navigate("/cart")}
        className="pointer-events-auto w-full sm:w-auto flex items-center gap-3 px-5 py-4 sm:py-3.5 rounded-2xl sm:rounded-full bg-copper-500 hover:bg-copper-400 text-chalk font-bold shadow-2xl transition-colors"
      >
        <ShoppingBag size={20} />
        <span>{cartCount} {cartCount === 1 ? "item" : "items"}</span>
        <span className="font-black">₹{totalPrice}</span>
        <span className="ml-auto sm:ml-3 underline-offset-4">Review order</span>
      </button>
    </div>
  );
};

export default FloatingCart;
