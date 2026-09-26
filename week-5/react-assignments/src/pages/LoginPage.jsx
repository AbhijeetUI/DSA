import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = (role) => {
    const user = {
      name: role === "admin" ? "Admin User" : "Regular User",
      role,
    };

    login(user);
    navigate(from, { replace: true });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Login</h1>
      <p>Select a role to continue.</p>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button type="button" onClick={() => handleLogin("user")}>
          Login as User
        </button>
        <button type="button" onClick={() => handleLogin("admin")}>
          Login as Admin
        </button>
      </div>
    </div>
  );
}
