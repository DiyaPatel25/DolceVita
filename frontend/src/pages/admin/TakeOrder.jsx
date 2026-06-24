import React, { useContext, useState, useMemo } from "react";
import { AppContext } from "../../context/AppContext";
import { Plus, Minus, Search, ShoppingBag, User, X } from "lucide-react";
import toast from "react-hot-toast";
import CustomizerModal from "../../components/CustomizerModal";

const TakeOrder = () => {
  const { menus, axios } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pending"); // "Pending", "Cash", "Online Payment"
  const [loading, setLoading] = useState(false);
  const [selectedItemForCustomization, setSelectedItemForCustomization] = useState(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const filteredMenus = useMemo(() => {
    return menus.filter(menu => 
      menu.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [menus, searchQuery]);

  const handleMenuClick = (menu) => {
    if (menu.customizationOptions?.hasExtraCream || (menu.customizationOptions?.toppings?.length > 0)) {
      setSelectedItemForCustomization(menu);
    } else {
      addToCart(menu._id, 1, null, menu);
    }
  };

  const addToCart = (menuId, quantity = 1, customizations = null, menuItemData = null) => {
    setCart(prev => {
      // Find exact match including customizations
      const existingIdx = prev.findIndex(item => 
        item.menuItem._id === menuId && 
        JSON.stringify(item.customizations || {}) === JSON.stringify(customizations || {})
      );

      if (existingIdx >= 0) {
        const newCart = [...prev];
        newCart[existingIdx].quantity += quantity;
        return newCart;
      }
      
      const menuObj = menuItemData || menus.find(m => m._id === menuId);
      return [...prev, { menuItem: menuObj, quantity, customizations: customizations || {} }];
    });
    toast.success("Added to order");
  };

  const removeFromCart = (index) => {
    setCart(prev => {
      const newCart = [...prev];
      if (newCart[index].quantity > 1) {
        newCart[index].quantity -= 1;
      } else {
        newCart.splice(index, 1);
      }
      return newCart;
    });
  };

  const addOneMore = (index) => {
    setCart(prev => {
      const newCart = [...prev];
      newCart[index].quantity += 1;
      return newCart;
    });
  };

  const clearCart = () => setCart([]);

  const totalAmount = cart.reduce((sum, item) => {
    const base = item.menuItem.price * item.quantity;
    const addOn = (item.customizations?.addOnPrice || 0) * item.quantity;
    return sum + base + addOn;
  }, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        guestName: customerName || "Stall Customer",
        name: "Admin POS", // Fallback for placeOrder validation if needed
        email: `pos_${Date.now()}@local.com`,
        orderType: "Pickup",
        address: "Stall Order",
        paymentMethod: paymentMethod === "Online Payment" ? "Online Payment" : "Pay at Counter",
        paymentVerified: paymentMethod === "Online Payment",
        cartItems: cart.map(c => ({
          menuItem: c.menuItem._id,
          quantity: c.quantity,
          customizations: c.customizations || {}
        }))
      };

      const { data } = await axios.post("/api/order/place", payload);
      
      if (data.success) {
        if (paymentMethod !== "Pending") {
          await axios.put(`/api/order/update-status/${data.order._id}`, { 
            paymentStatus: "Paid",
            paymentMethod: paymentMethod === "Online Payment" ? "Online Payment" : "Cash"
          });
        }
        
        toast.success("Order placed successfully!");
        setCart([]);
        setCustomerName("");
        setPaymentMethod("Pending");
        setIsMobileCartOpen(false);
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 overflow-hidden relative">
      
      {/* Left Menu Section */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search menus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
            />
          </div>
          <button 
            className="lg:hidden relative p-2.5 bg-orange-50 text-orange-600 rounded-xl"
            onClick={() => setIsMobileCartOpen(true)}
          >
            <ShoppingBag className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          <div className="flex flex-col gap-3">
            {filteredMenus.map(menu => (
              <div 
                key={menu._id}
                onClick={() => handleMenuClick(menu)}
                className="bg-white border border-gray-100 rounded-xl p-3 cursor-pointer hover:border-orange-400 hover:shadow-md transition-all flex items-center gap-4 group"
              >
                <img src={menu.image} alt={menu.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate group-hover:text-orange-600 transition-colors">{menu.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{menu.description}</p>
                  <p className="text-orange-500 font-black mt-1">₹{menu.price}</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          {filteredMenus.length === 0 && (
            <div className="text-center text-gray-400 mt-10">No items found</div>
          )}
        </div>
      </div>

      {/* Right Cart Section (Sidebar on Desktop, Modal on Mobile) */}
      <div className={`
        fixed inset-0 z-50 bg-black/50 transition-opacity lg:static lg:bg-transparent lg:z-auto
        ${isMobileCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto"}
      `} onClick={() => setIsMobileCartOpen(false)}>
        
        <div 
          className={`
            absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-white flex flex-col shadow-2xl transition-transform lg:static lg:rounded-2xl lg:border lg:border-gray-100 lg:shadow-sm lg:transform-none
            ${isMobileCartOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          `}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" /> Current Order
            </h2>
            <button className="lg:hidden p-2 text-gray-500 hover:bg-gray-200 rounded-lg" onClick={() => setIsMobileCartOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 mt-10 flex flex-col items-center">
                <ShoppingBag className="w-12 h-12 mb-2 text-gray-200" />
                <p>No items added yet</p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="flex gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">{item.menuItem.name}</p>
                    <p className="text-xs text-orange-600 font-semibold">₹{item.menuItem.price}</p>
                    {item.customizations?.addOnPrice > 0 && (
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                        + Customizations (₹{item.customizations.addOnPrice})
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0 bg-gray-50 rounded-lg p-1 border border-gray-100">
                    <button onClick={() => removeFromCart(idx)} className="w-7 h-7 rounded-md bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-red-500">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                    <button onClick={() => addOneMore(idx)} className="w-7 h-7 rounded-md bg-orange-500 text-white shadow-sm flex items-center justify-center hover:bg-orange-600">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout panel */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-4">
            
            <div className="flex items-center gap-2 bg-white px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus-within:border-orange-400 transition-colors">
              <User className="w-5 h-5 text-gray-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Guest Name (Optional)" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-transparent outline-none flex-1 text-sm font-semibold text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {["Pending", "Cash", "Online Payment"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setPaymentMethod(opt)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border-2 transition-all ${paymentMethod === opt ? 'bg-orange-100 border-orange-500 text-orange-700' : 'bg-white border-transparent text-gray-600 hover:bg-gray-100 shadow-sm'}`}
                  >
                    {opt === "Online Payment" ? "Online" : opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center py-3 border-t border-gray-200">
              <span className="font-bold text-gray-500">Total Due</span>
              <span className="font-black text-2xl text-orange-600">₹{totalAmount}</span>
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={cart.length === 0 || loading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-black text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-orange-500/20 active:scale-[0.98]"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
            
            {cart.length > 0 && (
              <button onClick={clearCart} className="w-full py-2 text-sm text-red-400 font-bold hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                Clear Cart
              </button>
            )}
          </div>
        </div>
      </div>

      <CustomizerModal 
        isOpen={!!selectedItemForCustomization}
        item={selectedItemForCustomization}
        onClose={() => setSelectedItemForCustomization(null)}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default TakeOrder;
