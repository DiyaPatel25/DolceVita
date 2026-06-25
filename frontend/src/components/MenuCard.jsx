import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import CustomizerModal from "./CustomizerModal";

const MenuCard = ({ menu }) => {
  const { navigate, addToCart, cart, axios, fetchCartData } = useContext(AppContext);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Find quantity of this item in cart
  const cartItem = cart?.items?.find(
    (i) => i.menuItem?._id === menu._id || i.menuItem === menu._id
  );
  const quantity = cartItem?.quantity || 0;

  const removeOne = async () => {
    if (quantity <= 1) {
      // remove entirely
      await axios.delete(`/api/cart/remove/${menu._id}`);
    } else {
      await axios.post("/api/cart/add", { menuId: menu._id, quantity: -1 });
    }
    fetchCartData();
  };

  const handleAddClick = () => {
    if (menu.isCustomizable) {
      setShowCustomizer(true);
    } else {
      addToCart(menu._id);
    }
  };

  const handleCustomizerAdd = (menuId, qty, customizations) => {
    addToCart(menuId, qty, customizations);
  };

  return (
    <>
      {/* ─── Mobile Zomato Layout (< 640px) ─── */}
      <div className="flex sm:hidden items-center justify-between p-3 gap-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="flex-1 min-w-0 pr-1">
          <h3 className="text-sm font-bold truncate mb-1" style={{ color: 'var(--text-color)' }}>{menu.name}</h3>
          <p className="text-sm font-black text-orange-500 mb-1.5">₹{menu.price}</p>
          <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{menu.description}</p>
        </div>

        <div className="relative w-28 shrink-0 pb-3.5">
          <div onClick={() => navigate(`/menu-details/${menu._id}`)} className="w-28 h-24 rounded-xl overflow-hidden cursor-pointer relative shadow-sm bg-gray-50 dark:bg-gray-800">
            <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" />
            {!menu.isAvailable && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-1 text-center">
                <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded">Sold Out</span>
              </div>
            )}
          </div>

          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10 w-24">
            {quantity === 0 ? (
              <button
                onClick={handleAddClick}
                disabled={!menu.isAvailable}
                className={`w-full py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-md border border-orange-200 dark:border-orange-800 transition-all flex items-center justify-center gap-1
                  ${menu.isAvailable ? "bg-white dark:bg-gray-900 text-orange-600 dark:text-orange-400 hover:bg-orange-50 active:scale-95" : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border-transparent"}`}
              >
                {menu.isCustomizable ? "ADD +" : "ADD"}
              </button>
            ) : (
              <div className="flex items-center justify-between bg-orange-500 text-white rounded-lg shadow-md py-1 px-1.5">
                <button onClick={removeOne} className="w-6 h-6 flex items-center justify-center font-bold text-sm active:scale-90"><Minus className="w-3.5 h-3.5" /></button>
                <span className="text-xs font-bold">{quantity}</span>
                <button onClick={handleAddClick} className="w-6 h-6 flex items-center justify-center font-bold text-sm active:scale-90"><Plus className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Desktop Rich Grid Card (>= 640px) ─── */}
      <div className="hidden sm:block rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group" style={{ backgroundColor: 'var(--card-bg)' }}>
        {/* Image */}
        <div onClick={() => navigate(`/menu-details/${menu._id}`)} className="relative h-52 overflow-hidden cursor-pointer">
          <img
            src={menu.image}
            alt={menu.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Availability badge */}
          {!menu.isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Unavailable</span>
            </div>
          )}
          {quantity > 0 && (
            <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center shadow-lg">
              {quantity}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-base font-bold mb-1 line-clamp-1" style={{ color: 'var(--text-color)' }}>{menu.name}</h3>
          <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{menu.description}</p>

          <div className="flex items-center justify-between">
            <p className="text-xl font-black" style={{ color: 'var(--text-color)' }}>₹{menu.price}</p>

            {quantity === 0 ? (
              <button
                onClick={handleAddClick}
                disabled={!menu.isAvailable}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300
                  ${menu.isAvailable
                    ? "bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 hover:shadow-md active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {menu.isCustomizable ? "Customize" : "Add"}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={removeOne}
                  className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-sm w-5 text-center" style={{ color: 'var(--text-color)' }}>{quantity}</span>
                <button
                  onClick={handleAddClick}
                  className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <CustomizerModal
        item={menu}
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        onAddToCart={handleCustomizerAdd}
      />
    </>
  );
};

export default MenuCard;
