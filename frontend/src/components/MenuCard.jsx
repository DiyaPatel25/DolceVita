import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Plus, Minus } from "lucide-react";
import CustomizerModal from "./CustomizerModal";

// One item: a list row on phones (like a line on the printed board), a photo card from `sm` up
const MenuCard = ({ menu }) => {
  const { navigate, addToCart, cart, axios, fetchCartData } = useContext(AppContext);
  const [showCustomizer, setShowCustomizer] = useState(false);

  const lines = (cart?.items || []).filter((i) => i.menuItem?._id === menu._id || i.menuItem === menu._id);
  const quantity = lines.reduce((sum, i) => sum + i.quantity, 0);

  // Items with extras are stored as separate lines; take one off the most recent line
  const removeOne = async () => {
    const line = lines[lines.length - 1];
    if (!line) return;
    if (quantity <= 1) await axios.delete(`/api/cart/remove/${menu._id}`);
    else await axios.post("/api/cart/add", { menuId: menu._id, quantity: -1, customizations: line.customizations });
    fetchCartData();
  };

  const add = () => (menu.isCustomizable ? setShowCustomizer(true) : addToCart(menu._id));
  const openDetails = () => navigate(`/menu-details/${menu._id}`);

  const stepper = quantity === 0 ? (
    <button
      onClick={add}
      className="w-full py-2 rounded-xl bg-copper-500 hover:bg-copper-400 text-chalk text-sm font-bold shadow-md transition-colors"
      aria-label={`Add ${menu.name}`}
    >
      Add{menu.isCustomizable ? " +" : ""}
    </button>
  ) : (
    <div className="flex items-center justify-between rounded-xl bg-copper-500 text-chalk shadow-md">
      <button onClick={removeOne} className="w-9 h-9 flex items-center justify-center" aria-label={`Remove one ${menu.name}`}>
        <Minus size={16} />
      </button>
      <span className="text-sm font-bold" aria-live="polite">{quantity}</span>
      <button onClick={add} className="w-9 h-9 flex items-center justify-center" aria-label={`Add one more ${menu.name}`}>
        <Plus size={16} />
      </button>
    </div>
  );

  return (
    <>
      <article
        className="flex sm:flex-col gap-4 sm:gap-0 py-4 sm:py-0 border-b sm:border sm:rounded-2xl sm:overflow-hidden sm:shadow-sm"
        style={{ borderColor: "var(--border-color)", backgroundColor: "var(--card-bg)" }}
      >
        <div className="order-2 sm:order-1 relative shrink-0 w-32 sm:w-full pb-4 sm:pb-0">
          <button onClick={openDetails} className="block w-32 h-28 sm:w-full sm:h-auto sm:aspect-[4/3] rounded-xl sm:rounded-none overflow-hidden" aria-label={`View ${menu.name}`}>
            <img src={menu.image} alt="" loading="lazy" className="w-full h-full object-cover" />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-24 sm:hidden">{stepper}</div>
        </div>

        <div className="order-1 sm:order-2 flex-1 min-w-0 sm:p-4 sm:flex sm:flex-col">
          <button onClick={openDetails} className="text-left">
            <h3 className="font-bold leading-snug">{menu.name}</h3>
          </button>
          <p className="mt-1 font-bold text-copper-500">₹{menu.price}</p>
          <p className="mt-1.5 text-sm leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>{menu.description}</p>
          <div className="hidden sm:block mt-auto pt-4">{stepper}</div>
        </div>
      </article>

      {showCustomizer && (
        <CustomizerModal
          item={menu}
          isOpen
          onClose={() => setShowCustomizer(false)}
          onAddToCart={(menuId, qty, customizations) => addToCart(menuId, qty, customizations)}
        />
      )}
    </>
  );
};

export default MenuCard;
