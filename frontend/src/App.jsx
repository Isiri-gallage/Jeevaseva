import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Public
import Home from './pages/Home';

// Patient Pages
import Dashboard from './pages/patient/Dashboard';
import CreateRequest from './pages/patient/CreateRequest';
import MyRequests from './pages/patient/MyRequests';

// Donor Pages
import DonorDashboard from './pages/donor/DonorDashboard';
import MatchingRequests from './pages/donor/MatchingRequests';
import MyDonations from './pages/donor/MyDonations';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageRequests from './pages/admin/ManageRequests';
import BloodRequests from './pages/admin/BloodRequests';

// Shared
import Chat from './pages/shared/Chat';
import Profile from './pages/shared/Profile';

// ✅ All Route Guards defined OUTSIDE AppRoutes

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_admin) return <Navigate to="/donor-dashboard" replace />;
  return children;
};

const DonorRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_donor) return <Navigate to="/dashboard" replace />;
  return children;
};

const DashboardRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.is_admin) return <Navigate to="/admin" replace />;
  if (user.is_donor) return <Navigate to="/donor-dashboard" replace />;
  return <Dashboard />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    if (user.is_admin) return <Navigate to="/admin" replace />;
    if (user.is_donor) return <Navigate to="/donor-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={
        <PublicRoute><Login /></PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute><Register /></PublicRoute>
      } />

      {/* Smart Dashboard */}
      <Route path="/dashboard" element={<DashboardRoute />} />

      {/* Patient */}
      <Route path="/create-request" element={
        <ProtectedRoute><CreateRequest /></ProtectedRoute>
      } />
      <Route path="/my-requests" element={
        <ProtectedRoute><MyRequests /></ProtectedRoute>
      } />

      {/* Donor */}
      <Route path="/donor-dashboard" element={
        <DonorRoute><DonorDashboard /></DonorRoute>
      } />
      <Route path="/matching-requests" element={
        <DonorRoute><MatchingRequests /></DonorRoute>
      } />
      <Route path="/my-donations" element={
        <DonorRoute><MyDonations /></DonorRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <AdminRoute><AdminDashboard /></AdminRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute><ManageUsers /></AdminRoute>
      } />
      <Route path="/admin/requests" element={
        <AdminRoute><ManageRequests /></AdminRoute>
      } />
      <Route path="/blood-requests" element={
        <AdminRoute><BloodRequests /></AdminRoute>
      } />

      {/* Shared */}
      <Route path="/profile" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      } />
      <Route path="/chat/:donationId" element={
        <ProtectedRoute><Chat /></ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'DM Sans, sans-serif' }
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;