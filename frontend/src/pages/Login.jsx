import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { LockIcon, MailIcon, ChefHat, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { AppContext } from "../context/AppContext";

const Login = () => {
  const { navigate, loading, setLoading, axios, setUser, setAdmin } = useContext(AppContext);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const onChangeHandler = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post("/api/auth/login", formData);
      if (data.success) {
        setUser(data.user);
        if (data.admin) {
          setAdmin(true);
          toast.success("Welcome back, Admin!");
          navigate("/admin");
        } else {
          toast.success(data.message);
          navigate("/");
        }
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'var(--bg-color)' }}>

      <div className="relative w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
            style={{ background: '#c08a5b' }}>
            <ChefHat className="w-8 h-8 text-chalk" />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-[0.12em]" style={{ color: 'var(--text-color)' }}>
            Dolce Vita
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit}
          className="rounded-3xl p-8 shadow-2xl border backdrop-blur-sm"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                Email Address
              </label>
              <div className="flex items-center gap-3 px-4 h-12 rounded-xl border transition-all duration-200"
                style={{ backgroundColor: 'var(--hover-bg)', borderColor: 'var(--border-color)' }}>
                <MailIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={onChangeHandler}
                  required
                  className="bg-transparent outline-none text-sm w-full"
                  style={{ color: 'var(--text-color)' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                Password
              </label>
              <div className="flex items-center gap-3 px-4 h-12 rounded-xl border transition-all duration-200"
                style={{ backgroundColor: 'var(--hover-bg)', borderColor: 'var(--border-color)' }}>
                <LockIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={onChangeHandler}
                  required
                  className="bg-transparent outline-none text-sm w-full"
                  style={{ color: 'var(--text-color)' }}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="shrink-0">
                  {showPassword
                    ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    : <Eye className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full h-12 rounded-xl font-bold text-chalk transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: '#c08a5b' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : "Sign In"}
          </button>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold hover:underline" style={{ color: '#c08a5b' }}>
              Sign up
            </Link>
          </p>
        </form>
        <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
          Just ordering? You don't need an account.{" "}
          <Link to="/menu" className="font-semibold hover:underline" style={{ color: '#c08a5b' }}>Browse the menu</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
