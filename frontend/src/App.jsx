import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return children;
  return <Navigate to={user.role === "user" ? "/businesses" : "/admin"} replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Regular user routes (Phase 5) */}
          {/* <Route path="/businesses" element={<ProtectedRoute allowedRoles={["user"]}><BusinessSelectorPage /></ProtectedRoute>} /> */}

          {/* Superuser / readonly_admin routes (Phase 5) */}
          {/* <Route path="/admin" element={<ProtectedRoute allowedRoles={["superuser", "readonly_admin"]}><AdminPage /></ProtectedRoute>} /> */}

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
