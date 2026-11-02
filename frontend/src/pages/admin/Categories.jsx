import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { Trash2, ImageOff, Tag, Search, X } from "lucide-react";
import toast from "react-hot-toast";

const Categories = () => {
  const { allCategories: categories, allMenus: menus, fetchCategories, axios } = useContext(AppContext);
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const q = query.trim().toLowerCase();
  const itemCount = (id) => menus.filter((m) => (m.category?._id ?? m.category) === id).length;
  const visible = categories.filter((c) => !q || c.name.toLowerCase().includes(q));

  // Two taps: the button is always visible (phones have no hover), so one stray tap must not delete
  const deleteCategory = async (id) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete((c) => (c === id ? null : c)), 6000);
      return;
    }
    setConfirmDelete(null);
    try {
      const { data } = await axios.delete(`/api/category/delete/${id}`);
      if (data.success) {
        toast.success(data.message);
        fetchCategories();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">All Categories</h1>
          <p className="text-gray-500 text-sm mt-1">
            {visible.length === categories.length
              ? `${categories.length} ${categories.length === 1 ? "category" : "categories"} total`
              : `Showing ${visible.length} of ${categories.length} categories`}
          </p>
        </div>
      </div>

      <div className="mb-6 flex">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories..."
            aria-label="Search categories"
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-orange-500 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {categories.length > 0 && visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <h3 className="text-gray-700 font-semibold">No categories match "{query}"</h3>
          <button onClick={() => setQuery("")} className="mt-3 text-sm font-bold text-orange-600 hover:underline">
            Clear search
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-gray-700 font-semibold text-lg">No categories yet</h3>
          <p className="text-gray-400 text-sm mt-1">Add your first category to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map((item) => (
            <div key={item._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
              {/* Image */}
              <div className="relative h-36 overflow-hidden bg-gray-100">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                {/* Delete button */}
                <button
                  onClick={() => deleteCategory(item._id)}
                  aria-label="Delete category"
                  className={`absolute top-2 right-2 rounded-lg text-white text-xs font-bold flex items-center gap-1 transition-all ${confirmDelete === item._id ? "px-2 py-1.5 bg-red-600" : "p-1.5 bg-red-500/90 hover:bg-red-600"}`}
                >
                  <Trash2 className="w-3.5 h-3.5" /> {confirmDelete === item._id && "Tap again to delete"}
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 text-sm truncate">{item.name}</h3>
                <p className="text-gray-400 text-xs mt-0.5">{itemCount(item._id)} {itemCount(item._id) === 1 ? "item" : "items"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
