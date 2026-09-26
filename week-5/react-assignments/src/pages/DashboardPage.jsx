import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}</p>
      <p>Current role: {user?.role}</p>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <Link to="/">Home</Link>
        <Link to="/admin">Admin</Link>
      </div>

      <button type="button" onClick={logout} style={{ marginTop: "1rem" }}>
        Logout
      </button>
    </div>
  );
}
