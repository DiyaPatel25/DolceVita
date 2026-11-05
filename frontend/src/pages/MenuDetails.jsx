import { useContext, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { AppContext } from "../context/AppContext";
import MenuCard from "../components/MenuCard";
import CustomizerModal from "../components/CustomizerModal";

const MenuDetails = () => {
  const { id } = useParams();
  const { menus, navigate, addToCart, cart, axios, fetchCartData } = useContext(AppContext);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const menu = menus.find((item) => item._id === id);

  if (!menu) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4" style={{ backgroundColor: "var(--bg-color)" }}>
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold">{menus.length ? "This dessert isn't on the menu" : "Loading..."}</h1>
          {menus.length > 0 && (
            <Link to="/menu" className="mt-6 inline-block px-7 py-3.5 rounded-full bg-copper-500 text-chalk font-bold">Browse the menu</Link>
          )}
        </div>
      </div>
    );
  }

  const lines = (cart?.items || []).filter((i) => i.menuItem?._id === id || i.menuItem === id);
  const quantity = lines.reduce((sum, i) => sum + i.quantity, 0);
  const categoryId = menu.category?._id;
  const related = menus.filter((m) => m.category?._id === categoryId && m._id !== id).slice(0, 4);

  const add = () => (menu.isCustomizable ? setShowCustomizer(true) : addToCart(menu._id));
  const removeOne = async () => {
    const line = lines[lines.length - 1];
    if (!line) return;
    await axios.post("/api/cart/add", { menuId: id, quantity: -1, customizations: line.customizations || {} });
    fetchCartData();
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "var(--bg-color)" }}>
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 font-semibold hover:text-copper-500" style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft size={18} /> Back
        </button>

        <div className="mt-6 grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          <img src={menu.image} alt={menu.name} className="w-full aspect-square md:aspect-[4/5] object-cover rounded-3xl" />

          <div className="md:pt-6">
            {menu.category?.name && (
              <Link to={`/menu?categoryId=${categoryId}&categoryName=${encodeURIComponent(menu.category.name)}`} className="text-copper-500 font-semibold hover:underline">
                {menu.category.name}
              </Link>
            )}
            <h1 className="mt-2 font-display text-3xl md:text-5xl font-semibold leading-tight tracking-wide">{menu.name}</h1>
            <p className="mt-4 text-3xl font-black">₹{menu.price}</p>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>{menu.description}</p>
            {menu.isCustomizable && (
              <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                Extras: {(menu.customizationOptions?.toppings || []).map((t) => `${t.name} +₹${t.price}`).join(", ")}
              </p>
            )}

            <div className="mt-8 max-w-sm">
              {quantity === 0 ? (
                <button onClick={add} className="w-full py-4 rounded-2xl bg-copper-500 hover:bg-copper-400 text-chalk font-black text-lg transition-colors">
                  {menu.isCustomizable ? "Choose extras and add" : `Add to order, ₹${menu.price}`}
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-2xl bg-copper-500 text-chalk">
                    <button onClick={removeOne} className="w-14 h-14 flex items-center justify-center" aria-label="One less"><Minus size={20} /></button>
                    <span className="w-8 text-center text-xl font-black" aria-live="polite">{quantity}</span>
                    <button onClick={add} className="w-14 h-14 flex items-center justify-center" aria-label="One more"><Plus size={20} /></button>
                  </div>
                  <Link to="/cart" className="font-bold text-copper-500 hover:underline">Review order</Link>
                </div>
              )}
              <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>Pick up at the stall and pay when you collect.</p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-wide">More {menu.category.name.toLowerCase()}</h2>
            <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
              {related.map((m) => <MenuCard key={m._id} menu={m} />)}
            </div>
          </section>
        )}
      </div>

      {showCustomizer && (
        <CustomizerModal item={menu} isOpen onClose={() => setShowCustomizer(false)} onAddToCart={(mid, qty, c) => addToCart(mid, qty, c)} />
      )}
    </div>
  );
};

export default MenuDetails;
