import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { ShoppingCart, Plus, Minus } from "lucide-react";

const MenuCard = ({ menu }) => {
  const { navigate, addToCart, cart, axios, fetchCartData } = useContext(AppContext);

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

  return (
    <div className="rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group" style={{ backgroundColor: 'var(--card-bg)' }}>
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
              onClick={() => addToCart(menu._id)}
              disabled={!menu.isAvailable}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300
                ${menu.isAvailable
                  ? "bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 hover:shadow-md active:scale-95"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add
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
                onClick={() => addToCart(menu._id)}
                className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
