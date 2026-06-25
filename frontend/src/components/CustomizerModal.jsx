import { useState } from "react";
import { X, Plus, Minus, Check } from "lucide-react";
import toast from "react-hot-toast";

const CustomizerModal = ({ item, onClose, onAddToCart, isOpen }) => {
  const [quantity, setQuantity] = useState(1);
  const [extraCream, setExtraCream] = useState(false);
  const [selectedToppings, setSelectedToppings] = useState([]);

  if (!isOpen || !item) return null;

  const toppings = item.customizationOptions?.toppings || [
    { name: "Nutella", price: 30 },
    { name: "Biscoff", price: 25 },
    { name: "Chocolate Shavings", price: 20 },
    { name: "Caramel Drizzle", price: 15 },
    { name: "Sprinkles", price: 10 },
  ];

  const extraCreamPrice = item.customizationOptions?.extraCreamPrice || 50;

  const toggleTopping = (topping) => {
    setSelectedToppings((prev) =>
      prev.find((t) => t.name === topping.name)
        ? prev.filter((t) => t.name !== topping.name)
        : [...prev, topping]
    );
  };

  const calculateAddOn = () => {
    let addOn = 0;
    if (extraCream) addOn += extraCreamPrice;
    addOn += selectedToppings.reduce((sum, t) => sum + t.price, 0);
    return addOn;
  };

  const totalPrice = (item.price + calculateAddOn()) * quantity;

  const handleAddToCart = () => {
    const customizations = {
      extraCream,
      selectedToppings: selectedToppings.map((t) => ({ name: t.name, price: t.price })),
      addOnPrice: calculateAddOn(),
    };
    onAddToCart(item._id, quantity, customizations);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className="rounded-3xl max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ backgroundColor: 'var(--card-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Customize Your Order</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition"
            style={{ backgroundColor: 'var(--hover-bg)' }}
          >
            <X className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Item Image and Info */}
          <div className="flex gap-4">
            <img
              src={item.image}
              alt={item.name}
              className="w-32 h-32 rounded-2xl object-cover shadow-md"
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>{item.name}</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
              <p className="text-2xl font-bold text-orange-600 mt-3">₹{item.price}</p>
            </div>
          </div>

          {/* Extra Cream Toggle */}
          {item.customizationOptions?.hasExtraCream && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold" style={{ color: 'var(--text-color)' }}>Extra Cream</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Additional whipped cream layer
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-orange-600 font-bold">+₹{extraCreamPrice}</span>
                  <button
                    onClick={() => setExtraCream(!extraCream)}
                    className={`w-6 h-6 rounded-full border-2 transition flex items-center justify-center ${
                      extraCream
                        ? "bg-orange-600 border-orange-600"
                        : "border-gray-300 hover:border-orange-600"
                    }`}
                  >
                    {extraCream && <Check className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Toppings */}
          <div>
            <h4 className="font-bold mb-3" style={{ color: 'var(--text-color)' }}>Choose Toppings</h4>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Select your favorite toppings</p>
            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
              {toppings.map((topping) => (
                <button
                  key={topping.name}
                  onClick={() => toggleTopping(topping)}
                  className={`p-3 rounded-xl border-2 transition text-left flex items-center justify-between ${
                    selectedToppings.find((t) => t.name === topping.name)
                      ? "bg-orange-100 border-orange-600"
                      : "bg-gray-50 border-gray-300 hover:border-orange-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        selectedToppings.find((t) => t.name === topping.name)
                          ? "bg-orange-600 border-orange-600"
                          : "border-gray-400"
                      }`}
                    >
                      {selectedToppings.find((t) => t.name === topping.name) && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <span className="font-semibold" style={{ color: 'var(--text-color)' }}>{topping.name}</span>
                  </div>
                  <span className="text-orange-600 font-bold">+₹{topping.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="rounded-2xl p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--hover-bg)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-color)' }}>Quantity</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-full bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-lg w-8 text-center" style={{ color: 'var(--text-color)' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-full bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-4 border border-orange-200">
            <div className="space-y-2 text-sm mb-3">
              {extraCream && (
                <div className="flex justify-between text-gray-700">
                  <span>Extra Cream (×{quantity})</span>
                  <span>+₹{extraCreamPrice * quantity}</span>
                </div>
              )}
              {selectedToppings.length > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>{selectedToppings.length} Topping(s) (×{quantity})</span>
                  <span>
                    +₹{selectedToppings.reduce((sum, t) => sum + t.price, 0) * quantity}
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-orange-300">
              <span className="font-bold" style={{ color: 'var(--text-color)' }}>Total:</span>
              <span className="text-2xl font-black text-orange-600">₹{totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex gap-3 sticky bottom-0" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border-2 font-semibold transition"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-color)', backgroundColor: 'var(--hover-bg)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold hover:shadow-lg transition"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizerModal;
