import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export const AppContext = createContext();

import axios from "axios";
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || (import.meta.env.MODE === "production" ? "https://dolce-vita-backend.onrender.com" : "http://localhost:5000");
axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
  const isAdminPath = window.location.pathname.startsWith("/admin");
  config.headers = config.headers || {};
  config.headers["x-auth-context"] = isAdminPath ? "admin" : "user";
  return config;
});

import { toast } from "react-hot-toast";
const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);

  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Theme state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    // Apply theme synchronously on initialization
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    return savedTheme;
  });

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    // Apply theme immediately
    if (newTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  // Apply theme to document
  useEffect(() => {
    // Theme is applied synchronously in toggleTheme and initialization
  }, [theme]);

  const fetchCartData = async () => {
    try {
      const { data } = await axios.get("/api/cart/get");
      if (data.success) {
        setCart(data.cart);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (cart?.items) {
      const total = cart.items.reduce((sum, item) => {
        const basePrice = item.menuItem.price * item.quantity;
        const customizationPrice = item.customizations?.addOnPrice || 0;
        return sum + basePrice + (customizationPrice * item.quantity);
      }, 0);
      setTotalPrice(total);
    }
  }, [cart]);
  const cartCount = cart?.items?.reduce(
    (acc, item) => acc + item.quantity,
    0 || 0
  );
  // 🔹 Add to Cart function
  const addToCart = async (menuId, quantity = 1, customizations = {}) => {
    if (!user) {
      toast.error("Please log in to add items to cart");
      navigate("/login");
      return;
    }

    try {
      const payload = {
        menuId,
        quantity,
      };
      
      if (Object.keys(customizations).length > 0) {
        payload.customizations = customizations;
      }

      const { data } = await axios.post("/api/cart/add", payload);
      if (data.success) {
        toast.success(data.message);
        fetchCartData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Something went wrong!");
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/category/all");

      if (data.success) {
        setCategories(data.categories);
      } else {
        console.log("Failed to fetch categories");
      }
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };
  const fetchMenus = async () => {
    try {
      const { data } = await axios.get("/api/menu/all");

      if (data.success) {
        setMenus(data.menuItems);
      } else {
        console.log("Failed to fetch menus");
      }
    } catch (error) {
      console.log("Error fetching menus:", error);
    }
  };

  const isAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/is-auth");
      if (data.success) {
        setUser(data.user);
        setAdmin(Boolean(data.admin));
      } else {
        // Token invalid or expired
        setUser(null);
        setAdmin(null);
      }
    } catch (error) {
      console.log("Auth check failed:", error.response?.status);
      // On error (401, 500, etc), user is not authenticated
      setUser(null);
      setAdmin(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      try {
        await isAuth();
      } finally {
        if (isMounted) setAuthReady(true);
      }
    };

    // Check auth status on app load before route guards decide
    initializeApp();
    fetchCategories();
    fetchMenus();
    fetchCartData();

    const handleFocus = () => {
      isAuth();
      fetchCartData();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);
  const value = {
    navigate,
    loading,
    setLoading,
    authReady,
    user,
    setUser,
    axios,
    admin,
    setAdmin,
    categories,
    fetchCategories,
    menus,
    fetchMenus,
    addToCart,
    cartCount,
    cart,
    setCart,
    totalPrice,
    fetchCartData,
    theme,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
