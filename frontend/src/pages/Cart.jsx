import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { X } from "lucide-react";
import toast from "react-hot-toast";

const Cart = () => {
  const { cart, totalPrice, navigate, axios, fetchCartData } =
    useContext(AppContext);

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64" style={{ backgroundColor: 'var(--bg-color)' }}>
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-color)' }}>
          Your Cart is Empty
        </h2>
      </div>
    );
  }

  const removeFromCart = async (menuId) => {
    try {
      const { data } = await axios.delete(`/api/cart/remove/${menuId}`);
      if (data.success) {
        toast.success(data.message);
        fetchCartData();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 shadow-lg rounded-2xl p-6" style={{ backgroundColor: 'var(--card-bg)' }}>
      <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: 'var(--text-color)' }}>Your Cart</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
          <thead style={{ backgroundColor: 'var(--hover-bg)' }}>
            <tr>
              <th className="py-3 px-4 text-left" style={{ color: 'var(--text-color)' }}>Item</th>
              <th className="py-3 px-4 text-left" style={{ color: 'var(--text-color)' }}>Qty</th>
              <th className="py-3 px-4 text-left" style={{ color: 'var(--text-color)' }}>Price</th>
              <th className="py-3 px-4 text-left" style={{ color: 'var(--text-color)' }}>Total</th>
              <th className="py-3 px-4 text-left" style={{ color: 'var(--text-color)' }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {cart.items.map((item) => {
              const customizationPrice = item.customizations?.addOnPrice || 0;
              const itemTotal = (item.menuItem.price + customizationPrice) * item.quantity;
              return (
                <tr key={item._id} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div>
                        <span className="font-medium text-gray-800 block">
                          {item.menuItem.name}
                        </span>
                        {item.customizations && Object.keys(item.customizations).length > 0 && (
                          <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                            {item.customizations.extraCream && (
                              <div className="text-orange-600 font-semibold">✓ Extra Cream</div>
                            )}
                            {item.customizations.selectedToppings && item.customizations.selectedToppings.length > 0 && (
                              <div className="text-orange-600 font-semibold">
                                ✓ {item.customizations.selectedToppings.map(t => t.name).join(", ")}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    ₹{item.menuItem.price}
                    {customizationPrice > 0 && (
                      <div className="text-xs text-orange-600">+₹{customizationPrice}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700 font-semibold">
                    ₹{itemTotal}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-700 font-semibold">
                    <X onClick={() => removeFromCart(item.menuItem._id)} className="cursor-pointer hover:text-red-600" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-6">
        <h3 className="text-xl font-semibold">
          Total: <span className="text-green-600">₹{totalPrice}</span>
        </h3>
        <button
          onClick={() => navigate("/checkout")}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};
export default Cart;
