import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import MenuDetails from "./pages/MenuDetails";
import SpecialOrders from "./pages/SpecialOrders";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import { lazy, Suspense, useContext } from "react";
import { AppContext } from "./context/AppContext";
import FloatingCart from "./components/FloatingCart";

// Admin pages are split out so customers never download them
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AddCategory = lazy(() => import("./pages/admin/AddCategory"));
const AddMenu = lazy(() => import("./pages/admin/AddMenu"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const Menus = lazy(() => import("./pages/admin/Menus"));
const Orders = lazy(() => import("./pages/admin/Orders"));
const PosOrders = lazy(() => import("./pages/admin/PosOrders"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const TakeOrder = lazy(() => import("./pages/admin/TakeOrder"));

const Spinner = ({ text }) => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
    <div className="text-center">
      <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-orange-500/20 border-t-orange-500" />
      {text && <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{text}</p>}
    </div>
  </div>
);

// Defined outside App: a component declared inside App gets a new identity every render,
// which remounted (and refetched) the whole admin panel on every context update.
const AdminGuard = ({ children }) => {
  const { admin, authReady } = useContext(AppContext);
  if (!authReady) return <Spinner text="Restoring your session..." />;
  return admin ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const adminPath = useLocation().pathname.includes("admin");

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter, sans-serif' } }} />
      {!adminPath && <Navbar />}
      {!adminPath && <FloatingCart />}
      <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu-details/:id" element={<MenuDetails />} />
        <Route path="/special-orders" element={<SpecialOrders />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin routes - all protected by AdminGuard */}
        <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
          <Route index element={<Dashboard />} />
          <Route path="take-order" element={<TakeOrder />} />
          <Route path="add-category" element={<AddCategory />} />
          <Route path="add-menu" element={<AddMenu />} />
          <Route path="categories" element={<Categories />} />
          <Route path="menus" element={<Menus />} />
          <Route path="orders" element={<Orders />} />
          <Route path="pos-orders" element={<PosOrders />} />
        </Route>
      </Routes>
      </Suspense>
      {!adminPath && <Footer />}
    </div>
  );
};

export default App;
