import { useContext } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { ArrowLeft, CheckCircle, Minus, Plus, ShoppingCart, Trash2, XCircle } from "lucide-react";
const MenuDetails = () => {
  const { id } = useParams();
  const { menus, navigate, addToCart, cart, axios, fetchCartData } = useContext(AppContext);
  const menu = menus.find((item) => item._id === id);

  const cartItem = cart?.items?.find(
    (item) => item.menuItem?._id === id || item.menuItem === id
  );
  const quantity = cartItem?.quantity || 0;

  const removeOne = async () => {
    if (quantity <= 1) {
      await axios.delete(`/api/cart/remove/${id}`);
    } else {
      await axios.post("/api/cart/add", { menuId: id, quantity: -1 });
    }
    fetchCartData();
  };

  const removeFromCart = async () => {
    await axios.delete(`/api/cart/remove/${id}`);
    fetchCartData();
  };

  if (!menu) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>
            Menu not found
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            The item you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/menu")}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-semibold transition-colors"
          >
            Back to menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => navigate("/menu")}
          className="flex items-center gap-2 hover:text-yellow-500 transition-colors group"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back to menu</span>
        </button>
      </div>

      {/* Main Content */}

      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Image Section */}
          <div className="relative">
            <div className="sticky top-8">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={menu.image}
                  alt={menu.name}
                  className="w-full h-[400px] object-cover"
                />
                {/* Availability Badge */}
                <div className="absolute top-6 right-6">
                  {menu.isAvailable ? (
                    <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2 font-semibold shadow-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span>Available</span>
                    </div>
                  ) : (
                    <div className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2 font-semibold shadow-lg">
                      <XCircle className="w-5 h-5" />
                      <span>Unavailable</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {menu.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-yellow-500">
                  ₹{menu.price}
                </span>
                <span className="text-gray-500 text-lg">per item</span>
              </div>
            </div>
            {/* Description */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Description
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {menu.description}
              </p>
            </div>
            {/* Cart Controls */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-6 shadow-xl">
              {quantity === 0 ? (
                <button
                  disabled={!menu.isAvailable}
                  onClick={() => addToCart(menu._id)}
                  className={`cursor-pointer w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${menu.isAvailable
                    ? "bg-white text-yellow-600 hover:bg-gray-50 hover:scale-105 active:scale-95 shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  <ShoppingCart className="w-6 h-6" />
                  {menu.isAvailable ? "Add to Cart" : "Unavailable"}
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-center text-white font-semibold">
                    In cart: {quantity} {quantity === 1 ? "item" : "items"}
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={removeOne}
                      className="w-12 h-12 rounded-full bg-white/90 text-yellow-600 hover:bg-white flex items-center justify-center transition-all"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-white text-2xl font-bold w-10 text-center">
                      {quantity}
                    </span>
                    <button
                      disabled={!menu.isAvailable}
                      onClick={() => addToCart(menu._id)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${menu.isAvailable
                        ? "bg-white text-yellow-600 hover:bg-gray-50"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={removeFromCart}
                    className="w-full py-3 rounded-xl font-semibold bg-white/90 text-red-600 hover:bg-white transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Remove from Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MenuDetails;
