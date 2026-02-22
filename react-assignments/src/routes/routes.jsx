import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import WindowResize from "../components/WindowResize";
import SmartTable from "../components/SmartTable";
import ConfigDrivenForm from "../components/ConfigDrivenForm";

// Lazy imports
const AutoComplete = lazy(() => import("../components/AutoComplete"));
const BoxColoringGame = lazy(() => import("../components/BoxColoringGame"));
const DOMInteraction = lazy(() => import("../components/DOMInteraction"));
const MultiStepForm = lazy(() => import("../components/MuiltiStepForm"));
const Posts = lazy(() => import("../components/Posts"));
const ProductsPage = lazy(() => import("../components/ProductsPage"));
const ProtectedRoute = lazy(() => import("../components/ProtectedRoute"));
const Login = lazy(() => import("../components/Login"));
const Unauthorized = lazy(() => import("../components/Unauthorized"));
const Dashboard = lazy(() => import("../components/Dashboard"));
/* const AdminPanel = lazy(() => import("../components/AdminPanel")); */

export default function AppRoutes() {
  return (
    <Router>
      {/* Suspense provides a fallback while components are loading */}
      <Suspense fallback={<div>Loading...</div>}>
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
          {/* <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          /> */}

          {/* Redirect targets */}
          <Route path="/smart-table" element={<SmartTable />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route path="/box-coloring-game" element={<BoxColoringGame />} />
          <Route path="/dom-interaction" element={<DOMInteraction />} />
          <Route path="/multistep-form" element={<MultiStepForm />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/products-page" element={<ProductsPage />} />
          <Route path="/window-resize" element={<WindowResize />} />
          <Route path="/config-driven-form" element={<ConfigDrivenForm />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
