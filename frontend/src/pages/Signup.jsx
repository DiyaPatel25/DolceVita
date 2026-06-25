import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { LockIcon, MailIcon, User2Icon } from "lucide-react";
import { toast } from "react-hot-toast";
import { AppContext } from "../context/AppContext";
const Signup = () => {
  const { navigate, axios, loading, setLoading } = useContext(AppContext);
  // state for input value
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // handle change input value
  const onChangeHandler = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post("/api/auth/register", formData);
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)' }}>
      <form
        onSubmit={handleSubmit}
        className="w-full sm:w-[350px] text-center rounded-3xl px-8 shadow-2xl backdrop-blur-sm"
        style={{
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--card-bg)'
        }}
      >
        <h1 className="text-3xl mt-10 font-medium" style={{ color: 'var(--text-color)' }}>
          Register
        </h1>
        <p className="text-sm mt-2 pb-6" style={{ color: 'var(--text-secondary)' }}>
          Please sign up to continue
        </p>

        <div className="flex items-center w-full mt-4 h-12 rounded-full overflow-hidden pl-6 gap-2" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
          {/* User Icon */}
          <User2Icon style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Name"
            className="bg-transparent outline-none text-sm w-full h-full"
            style={{ color: 'var(--text-color)' }}
            name="name"
            value={formData.name}
            onChange={onChangeHandler}
            required
          />
        </div>

        <div className="flex items-center w-full mt-4 h-12 rounded-full overflow-hidden pl-6 gap-2" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
          {/* Mail Icon */}
          <MailIcon style={{ color: 'var(--text-secondary)' }} />
          <input
            type="email"
            placeholder="Email id"
            className="bg-transparent outline-none text-sm w-full h-full"
            style={{ color: 'var(--text-color)' }}
            name="email"
            value={formData.email}
            onChange={onChangeHandler}
            required
          />
        </div>

        <div className="flex items-center mt-4 w-full h-12 rounded-full overflow-hidden pl-6 gap-2" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
          {/* Lock Icon */}
          <LockIcon style={{ color: 'var(--text-secondary)' }} />
          <input
            type="password"
            placeholder="Password"
            className="bg-transparent outline-none text-sm w-full h-full"
            style={{ color: 'var(--text-color)' }}
            name="password"
            value={formData.password}
            onChange={onChangeHandler}
            required
          />
        </div>

        <button
          type="submit"
          className="mt-2 w-full h-11 rounded-full text-white bg-orange-500 hover:opacity-90 transition-opacity cursor-pointer"
        >
          {loading ? "Loading..." : "Register"}
        </button>

        <p className="text-sm mt-3 mb-11" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?
          <Link to={"/login"} className="ml-1" style={{ color: 'var(--primary-color, #f97316)' }}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
