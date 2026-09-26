import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "../auth/AuthProvider";
import ProtectedRoute from "./ProtectedRoute";

function TestConsumer() {
  const { user } = useAuth();
  return <div>{user ? `Hello ${user.role}` : "No user"}</div>;
}

describe("ProtectedRoute", () => {
  it("redirects unauthenticated users to login", async () => {
    render(
      <AuthProvider initialUser={null}>
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route path="/login" element={<div>Login page</div>} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <div>Admin page</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Login page")).toBeTruthy();
    });
  });

  it("redirects authenticated non-admin users away from admin route", async () => {
    render(
      <AuthProvider initialUser={{ name: "Alice", role: "user" }}>
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route path="/login" element={<div>Login page</div>} />
            <Route
              path="/unauthorized"
              element={<div>Unauthorized page</div>}
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <div>Admin page</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Unauthorized page")).toBeTruthy();
    });
  });

  it("renders children for allowed roles", async () => {
    render(
      <AuthProvider initialUser={{ name: "Admin", role: "admin" }}>
        <MemoryRouter initialEntries={["/admin"]}>
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TestConsumer />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Hello admin")).toBeTruthy();
    });
  });
});
