import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Complaints from "./pages/Complaints";
import Posts from "./pages/Posts";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";
import type { Role } from "./types";

function Protected({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(session.role)) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Protected roles={["MLA"]}><Dashboard /></Protected>} />
      <Route path="/complaints" element={<Protected roles={["MLA"]}><Complaints /></Protected>} />
      <Route path="/posts" element={<Protected roles={["MLA"]}><Posts /></Protected>} />
      <Route path="/analytics" element={<Protected roles={["MLA"]}><Analytics /></Protected>} />
      <Route path="/admin" element={<Protected roles={["ADMIN"]}><Admin /></Protected>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
