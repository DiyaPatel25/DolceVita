import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Trash2, ImageOff, IndianRupee, Camera, Search, X } from "lucide-react";
import toast from "react-hot-toast";

const Menus = () => {
  const { menus, categories, fetchMenus, axios } = useContext(AppContext);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const q = query.trim().toLowerCase();
  const visible = menus.filter(
    (m) =>
      (category === "all" || m.category?._id === category) &&
      (!q || m.name.toLowerCase().includes(q) || m.category?.name?.toLowerCase().includes(q))
  );

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);

  // Two taps: the button is always visible (phones have no hover), so one stray tap must not delete
  const deleteMenu = async (id) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete((c) => (c === id ? null : c)), 6000);
      return;
    }
    setConfirmDelete(null);
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

  const changePhoto = async (id, file) => {
    if (!file) return;
    const form = new FormData();
    form.append("image", file);
    try {
      setUploadingId(id);
      const { data } = await axios.put(`/api/menu/update/${id}`, form);
      if (data.success) {
        toast.success("Photo updated");
        fetchMenus();
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setUploadingId(null);
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
          <p className="text-gray-500 text-sm mt-1">
            {visible.length === menus.length ? `${menus.length} ${menus.length === 1 ? "item" : "items"} total` : `Showing ${visible.length} of ${menus.length} items`}
          </p>
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items or categories..."
            aria-label="Search menu items"
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-orange-500 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[{ _id: "all", name: "All" }, ...categories].map((c) => (
            <button
              key={c._id}
              onClick={() => setCategory(c._id)}
              className={`px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap border ${category === c._id ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-orange-300"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {menus.length > 0 && visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <h3 className="text-gray-700 font-semibold">No items match your search</h3>
          <button onClick={() => { setQuery(""); setCategory("all"); }} className="mt-3 text-sm font-bold text-orange-600 hover:underline">
            Clear filters
          </button>
        </div>
      ) : menus.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <IndianRupee className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-gray-700 font-semibold text-lg">No menu items yet</h3>
          <p className="text-gray-400 text-sm mt-1">Add your first dish to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map((item) => (
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
                  aria-label="Delete item"
                  className={`absolute top-2 right-2 rounded-lg text-white text-xs font-bold flex items-center gap-1 transition-all ${confirmDelete === item._id ? "px-2 py-1.5 bg-red-600" : "p-1.5 bg-red-500/90 hover:bg-red-600"}`}
                >
                  <Trash2 className="w-3.5 h-3.5" /> {confirmDelete === item._id && "Tap again to delete"}
                </button>
                {/* Change photo */}
                <label className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/60 hover:bg-black/75 text-white text-xs font-bold flex items-center gap-1 cursor-pointer">
                  <Camera className="w-3.5 h-3.5" /> {uploadingId === item._id ? "Uploading..." : "Change photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingId === item._id}
                    onChange={(e) => { changePhoto(item._id, e.target.files[0]); e.target.value = ""; }}
                  />
                </label>
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
