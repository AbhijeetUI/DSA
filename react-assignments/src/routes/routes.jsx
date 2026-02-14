import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AutoComplete from "../components/AutoComplete";
import BoxColoringGame from "../components/BoxColoringGame";
import DOMInteraction from "../components/DOMInteraction";
import MuiltiStepForm from "../components/MuiltiStepForm";
import Posts from "../components/Posts";
import ProductsPage from "../components/ProductsPage";
import ProtectedRoute from "../components/ProtectedRoute";
import Login from "../components/Login";
import Unauthorized from "../components/Unauthorized";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AutoComplete />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Role-based route (only admin) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        {/* Redirect targets */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/login" element={<Login />} />
        <Route path="/box-coloring-game" element={<BoxColoringGame />} />
        <Route path="/dom-interaction" element={<DOMInteraction />} />
        <Route path="/multistep-form" element={<MuiltiStepForm />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/products-page" element={<ProductsPage />} />
      </Routes>
    </Router>
  );
}
