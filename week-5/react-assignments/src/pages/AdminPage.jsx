import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function AdminPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Panel</h1>
      <p>Authorized admin access for {user?.name}</p>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/">Home</Link>
      </div>

      <button type="button" onClick={logout} style={{ marginTop: "1rem" }}>
        Logout
      </button>
    </div>
  );
}
