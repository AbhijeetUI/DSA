import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Role-Based Route Guard Demo</h1>
      <p>
        Browse the demo routes to see how public and protected access works.
      </p>
      <nav style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/admin">Admin</Link>
      </nav>
    </div>
  );
}
