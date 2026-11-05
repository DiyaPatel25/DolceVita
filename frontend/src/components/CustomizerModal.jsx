import { useState } from "react";
import { X, Plus, Minus, Check } from "lucide-react";

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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Choose extras for ${item.name}`}
        className="rounded-t-3xl sm:rounded-3xl max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ backgroundColor: 'var(--card-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Choose extras</h2>
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
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--border-color)]">
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="text-base sm:text-xl font-bold truncate" style={{ color: 'var(--text-color)' }}>{item.name}</h3>
              <p className="text-xs sm:text-sm mt-1 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
              <p className="text-lg sm:text-2xl font-black text-copper-500 mt-2 sm:mt-3">₹{item.price}</p>
            </div>
            <img
              src={item.image}
              alt={item.name}
              className="w-24 h-20 sm:w-32 sm:h-32 rounded-xl sm:rounded-2xl object-cover shadow-md shrink-0"
            />
          </div>

          {/* Extra Cream Toggle */}
          {item.customizationOptions?.hasExtraCream && (
            <div className="rounded-2xl p-4 border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold" style={{ color: 'var(--text-color)' }}>Extra Cream</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Additional whipped cream layer
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-copper-500 font-bold whitespace-nowrap">+₹{extraCreamPrice}</span>
                  <button
                    onClick={() => setExtraCream(!extraCream)}
                    className={`w-6 h-6 rounded-full border-2 transition flex items-center justify-center ${
                      extraCream
                        ? "bg-copper-500 border-copper-500"
                        : "border-[var(--text-secondary)] hover:border-copper-500"
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
            <h4 className="font-bold mb-3" style={{ color: 'var(--text-color)' }}>Extras</h4>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Optional. Pick as many as you like.</p>
            <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
              {toppings.map((topping) => (
                <button
                  key={topping.name}
                  onClick={() => toggleTopping(topping)}
                  className={`p-3 rounded-xl border-2 transition text-left flex items-center justify-between ${
                    selectedToppings.find((t) => t.name === topping.name)
                      ? "bg-copper-500/15 border-copper-500"
                      : "border-[var(--border-color)] hover:border-copper-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        selectedToppings.find((t) => t.name === topping.name)
                          ? "bg-copper-500 border-copper-500"
                          : "border-[var(--text-secondary)]"
                      }`}
                    >
                      {selectedToppings.find((t) => t.name === topping.name) && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <span className="font-semibold" style={{ color: 'var(--text-color)' }}>{topping.name}</span>
                  </div>
                  <span className="text-copper-500 font-bold whitespace-nowrap">+₹{topping.price}</span>
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
                className="w-9 h-9 rounded-full bg-copper-500 text-chalk hover:bg-copper-400 flex items-center justify-center transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-lg w-8 text-center" style={{ color: 'var(--text-color)' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-full bg-copper-500 text-chalk hover:bg-copper-400 flex items-center justify-center transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-2xl p-4 border border-[var(--border-color)]">
            <div className="space-y-2 text-sm mb-3">
              {extraCream && (
                <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
                  <span>Extra Cream (×{quantity})</span>
                  <span>+₹{extraCreamPrice * quantity}</span>
                </div>
              )}
              {selectedToppings.length > 0 && (
                <div className="flex justify-between" style={{ color: "var(--text-secondary)" }}>
                  <span>{selectedToppings.length} Topping(s) (×{quantity})</span>
                  <span>
                    +₹{selectedToppings.reduce((sum, t) => sum + t.price, 0) * quantity}
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-[var(--border-color)]">
              <span className="font-bold" style={{ color: 'var(--text-color)' }}>Total</span>
              <span className="text-2xl font-black text-copper-500">₹{totalPrice}</span>
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
            className="flex-1 px-4 py-3 rounded-xl bg-copper-500 hover:bg-copper-400 text-chalk font-bold transition"
          >
            Add to order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizerModal;
