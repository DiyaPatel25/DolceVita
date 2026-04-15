import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Trash2, ImageOff, Tag } from "lucide-react";
import toast from "react-hot-toast";

const Categories = () => {
  const { categories, fetchCategories, axios } = useContext(AppContext);

  const deleteCategory = async (id) => {
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
          <p className="text-gray-500 text-sm mt-1">{categories.length} {categories.length === 1 ? "category" : "categories"} total</p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-gray-700 font-semibold text-lg">No categories yet</h3>
          <p className="text-gray-400 text-sm mt-1">Add your first category to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((item) => (
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
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/90 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 text-sm truncate">{item.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
