import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import MenuCard from "./MenuCard";

const Menus = () => {
  const { menus } = useContext(AppContext);

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-color)' }}>
            Our <span className="text-yellow-500">Menu</span>
          </h1>
          <p className="max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Explore our delicious selection of handcrafted dishes made with the
            finest ingredients
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menus.slice(0, 8).map((menu) => (
            <MenuCard key={menu._id} menu={menu} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menus;
