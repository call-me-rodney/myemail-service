// client/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterSuccessPage from './pages/RegisterSuccessPage';
import RegisterFailedPage from './pages/RegisterFailedPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SystemAdminDashboardPage from './pages/SystemAdminDashboardPage';

// Gate for authenticated areas: unauthenticated users are sent to /login.
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Gate for auth pages: already-authenticated users are bounced to their dashboard
// so they can't re-enter the login/register flow.
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

// The dashboard a user can reach is determined solely by their role — there are
// no role-specific URLs to navigate to, so a user cannot open another role's UI.
const RoleBasedDashboard: React.FC = () => {
  const { role } = useAuth();

  if (role === 'super admin') {
    return <SystemAdminDashboardPage />;
  }

  if (role === 'admin' || role === 'company admin') {
    return <AdminDashboardPage />;
  }

  return <DashboardPage />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route path="/register/success" element={<RegisterSuccessPage />} />
        <Route path="/register/failed" element={<RegisterFailedPage />} />

        {/* All authenticated areas. Role decides which dashboard renders. */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <RoleBasedDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
