import { AppContext } from "../../context/AppContext";
import { useState, useContext } from "react";
import toast from "react-hot-toast";
import { Utensils, DollarSign, AlignLeft, Tag, Image, Plus } from "lucide-react";

const AddMenu = () => {
  const { axios, navigate, loading, setLoading, categories, fetchMenus } = useContext(AppContext);
  const [formData, setFormData] = useState({ name: "", price: "", description: "", category: "", image: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post("/api/menu/add", formData);
      if (data.success) {
        toast.success(data.message);
        await fetchMenus();
        navigate("/admin/menus");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "name", label: "Dish Name", icon: Utensils, type: "text", placeholder: "e.g. Margherita Pizza" },
    { name: "price", label: "Price (₹)", icon: DollarSign, type: "number", placeholder: "e.g. 299" },
    { name: "description", label: "Description", icon: AlignLeft, type: "text", placeholder: "Describe this item..." },
    { name: "image", label: "Image URL", icon: Image, type: "url", placeholder: "https://..." },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800">Add New Dish</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to add a new item to your menu</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map(({ name, label, icon: Icon, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{label} *</label>
              <div className="flex items-center gap-3 px-4 h-12 rounded-xl border border-gray-200 bg-gray-50 focus-within:border-orange-400 focus-within:bg-white transition-all duration-200">
                <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  placeholder={placeholder}
                  className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
          ))}

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
            <div className="flex items-center gap-3 px-4 h-12 rounded-xl border border-gray-200 bg-gray-50 focus-within:border-orange-400 focus-within:bg-white transition-all duration-200">
              <Tag className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="bg-transparent outline-none text-sm w-full text-gray-700 cursor-pointer"
              >
                <option value="">Select a category</option>
                {categories.map((item) => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Preview */}
          {formData.image && (
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <img src={formData.image} alt="Preview" className="w-full h-48 object-cover" onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
          >
            {loading ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Adding...</>
            ) : (
              <><Plus className="w-4 h-4" /> Add to Menu</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMenu;
