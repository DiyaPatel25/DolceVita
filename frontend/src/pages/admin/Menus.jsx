import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Trash2, ImageOff, IndianRupee } from "lucide-react";
import toast from "react-hot-toast";

const Menus = () => {
  const { menus, fetchMenus, axios } = useContext(AppContext);

  const deleteMenu = async (id) => {
    try {
      const { data } = await axios.delete(`/api/menu/delete/${id}`);
      if (data.success) {
        toast.success(data.message);
        fetchMenus();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const [editingId, setEditingId] = useState(null);
  const [stockValue, setStockValue] = useState(0);
  const [thresholdValue, setThresholdValue] = useState(5);

  const startEdit = (item) => {
    setEditingId(item._id);
    setStockValue(item.countInStock ?? 20);
    setThresholdValue(item.lowStockThreshold ?? 5);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveStock = async (id) => {
    try {
      const payload = { countInStock: Number(stockValue), lowStockThreshold: Number(thresholdValue) };
      const { data } = await axios.put(`/api/menu/update/${id}`, payload);
      if (data.success) {
        toast.success('Stock updated');
        fetchMenus();
        setEditingId(null);
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">All Menus</h1>
          <p className="text-gray-500 text-sm mt-1">{menus.length} {menus.length === 1 ? "item" : "items"} total</p>
        </div>
      </div>

      {menus.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <IndianRupee className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-gray-700 font-semibold text-lg">No menu items yet</h3>
          <p className="text-gray-400 text-sm mt-1">Add your first dish to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {menus.map((item) => (
            <div key={item._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
              {/* Image */}
              <div className="relative h-40 overflow-hidden bg-gray-100">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                {/* Availability badge */}
                <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${item.isAvailable ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                  {item.isAvailable ? "Available" : "Unavailable"}
                </span>
                {/* Delete button */}
                <button
                  onClick={() => deleteMenu(item._id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/90 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 text-sm truncate">{item.name}</h3>
                <p className="text-gray-400 text-xs mt-0.5 truncate">{item?.category?.name || "Uncategorised"}</p>
                <div className="flex items-center gap-1 mt-2">
                  <IndianRupee className="w-3.5 h-3.5 text-orange-500" />
                  <span className="font-black text-orange-500 text-base">{item.price}</span>
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  {editingId === item._id ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="w-32">Count In Stock</label>
                        <input type="number" value={stockValue} onChange={(e)=>setStockValue(e.target.value)} className="w-24 rounded-md p-1 border" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="w-32">Low Stock Threshold</label>
                        <input type="number" value={thresholdValue} onChange={(e)=>setThresholdValue(e.target.value)} className="w-24 rounded-md p-1 border" />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={()=>saveStock(item._id)} className="px-3 py-1 rounded bg-green-600 text-white">Save</button>
                        <button onClick={cancelEdit} className="px-3 py-1 rounded bg-gray-200">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500">Stock: <span className="font-bold text-gray-700">{item.countInStock ?? 20}</span></div>
                        <div className="text-xs text-gray-500">Alert Threshold: <span className="font-bold text-gray-700">{item.lowStockThreshold ?? 5}</span></div>
                      </div>
                      <div>
                        <button onClick={()=>startEdit(item)} className="px-2 py-1 rounded bg-blue-500 text-white text-sm">Edit Stock</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Menus;
