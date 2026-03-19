import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { UserRole } from './types';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import Dashboard from './pages/dashboard/Dashboard';
import POSPage from './pages/pos/POSPage';

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: UserRole[] }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN_GENERAL]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Commerçant routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN_COMMERCANT]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Employé routes */}
          <Route
            path="/pos/*"
            element={
              <ProtectedRoute allowedRoles={[UserRole.EMPLOYE, UserRole.ADMIN_COMMERCANT]}>
                <POSPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
