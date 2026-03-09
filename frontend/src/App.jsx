import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import BusinessSelectorPage from "./pages/BusinessSelectorPage";
import AdminPage from "./pages/AdminPage";
import NewBusinessPage from "./pages/NewBusinessPage";
import DashboardPage from "./pages/DashboardPage";

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
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/businesses" element={<ProtectedRoute allowedRoles={["user"]}><BusinessSelectorPage /></ProtectedRoute>} />
          <Route path="/dashboard/:businessId" element={<ProtectedRoute allowedRoles={["user"]}><DashboardPage /></ProtectedRoute>} />
          <Route path="/businesses/new" element={<ProtectedRoute allowedRoles={["user"]}><NewBusinessPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["superuser", "readonly_admin"]}><AdminPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;