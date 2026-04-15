import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import MenuDetails from "./pages/MenuDetails";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import AdminLayout from "./pages/admin/AdminLayout";
import { useContext } from "react";
import { AppContext } from "./context/AppContext";
import AddCategory from "./pages/admin/AddCategory";
import AddMenu from "./pages/admin/AddMenu";
import Categories from "./pages/admin/Categories";
import Menus from "./pages/admin/Menus";
import Orders from "./pages/admin/Orders";
import Dashboard from "./pages/admin/Dashboard";
import FloatingCart from "./components/FloatingCart";

const App = () => {
  const adminPath = useLocation().pathname.includes("admin");
  const { admin } = useContext(AppContext);

  // Redirect to /login if not admin
  const AdminGuard = ({ children }) => admin ? children : <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter, sans-serif' } }} />
      {!adminPath && <Navbar />}
      {!adminPath && <FloatingCart />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu-details/:id" element={<MenuDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin routes - all protected by AdminGuard */}
        <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route index element={<Dashboard />} />
          <Route path="add-category" element={<AddCategory />} />
          <Route path="add-menu" element={<AddMenu />} />
          <Route path="categories" element={<Categories />} />
          <Route path="menus" element={<Menus />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Routes>
      {!adminPath && <Footer />}
    </div>
  );
};

export default App;
