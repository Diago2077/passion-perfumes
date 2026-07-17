import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index.tsx";
import Catalog from "./pages/Catalog.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/admin/Login.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminProducts from "./pages/admin/Products.tsx";
import AdminCategories from "./pages/admin/Categories.tsx";
import AdminBrands from "./pages/admin/Brands.tsx";
import AdminContacts from "./pages/admin/Contacts.tsx";
import AdminLayout from "./components/admin/AdminLayout.tsx";

export default function App() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<Index />} />
      <Route path="/productos" element={<Catalog />} />

      {/* Admin auth */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin protected routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/categories" element={<AdminCategories />} />
        <Route path="products/brands" element={<AdminBrands />} />
        <Route path="contacts" element={<AdminContacts />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
