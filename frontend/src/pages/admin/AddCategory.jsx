import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import { Tag, Image, Plus } from "lucide-react";

const AddCategory = () => {
  const { axios, navigate, loading, setLoading, fetchCategories } = useContext(AppContext);
  const [formData, setFormData] = useState({ name: "", imageUrl: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setImagePreview(formData.imageUrl);
  }, [imageFile, formData.imageUrl]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = imageFile ? (() => {
        const data = new FormData();
        data.append("name", formData.name);
        data.append("image", imageFile);
        return data;
      })() : { name: formData.name, image: formData.imageUrl };

      const { data } = await axios.post("/api/category/add", payload);
      if (data.success) {
        toast.success(data.message);
        await fetchCategories();
        navigate("/admin/categories");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800">Add New Category</h1>
        <p className="text-gray-500 text-sm mt-1">Create a new category to organise your menu</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name *</label>
            <div className="flex items-center gap-3 px-4 h-12 rounded-xl border border-gray-200 bg-gray-50 focus-within:border-orange-400 focus-within:bg-white transition-all duration-200">
              <Tag className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Pizza, Burgers, Drinks..."
                className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
            <div className="flex items-center gap-3 px-4 h-12 rounded-xl border border-gray-200 bg-gray-50 focus-within:border-orange-400 focus-within:bg-white transition-all duration-200">
              <Image className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Or upload from device</label>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus-within:border-orange-400 focus-within:bg-white transition-all duration-200">
              <Image className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="bg-transparent outline-none text-sm w-full text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-orange-700 hover:file:bg-orange-100"
              />
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" onError={(e) => e.target.style.display = 'none'} />
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
              <><Plus className="w-4 h-4" /> Add Category</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;
