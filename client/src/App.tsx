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

// A private route component to protect authenticated routes
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const RoleBasedDashboard: React.FC = () => {
  const { role } = useAuth();

  if (role === 'admin') {
    return <AdminDashboardPage />;
  }

  return <DashboardPage />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/success" element={<RegisterSuccessPage />} />
        <Route path="/register/failed" element={<RegisterFailedPage />} />
        // <Route path="/admin" element={<AdminDashboardPage />} />
        <Route
          path="/*" // Catch all routes for authenticated users
          element={
            <PrivateRoute>
              <RoleBasedDashboard />
            </PrivateRoute>
          }
          // element={
          //   <DashboardPage />
          // }
        />
      </Routes>
    </Router>
  );
};

export default App;