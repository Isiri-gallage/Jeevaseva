import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Public
import Home from './pages/Home';

// Patient Pages
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

// Kidney Pages
import KidneyBoard from './pages/kidney/KidneyBoard';
import PostKidneyRequest from './pages/kidney/PostKidneyRequest';
import RegisterKidneyDonor from './pages/kidney/RegisterKidneyDonor';
import MyKidneyRequests from './pages/kidney/MyKidneyRequests';

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
  return <Navigate to="/kidney" replace />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    if (user.is_admin) return <Navigate to="/admin" replace />;
    return <Navigate to="/kidney" replace />;
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
      <Route path="/chat/kidney/:matchId" element={
        <ProtectedRoute><Chat isKidney={true} /></ProtectedRoute>
      } />

      {/* Kidney */}
<Route path="/kidney" element={
  <ProtectedRoute><KidneyBoard /></ProtectedRoute>
} />
<Route path="/kidney/post-request" element={
  <ProtectedRoute><PostKidneyRequest /></ProtectedRoute>
} />
<Route path="/kidney/register-donor" element={
  <ProtectedRoute><RegisterKidneyDonor /></ProtectedRoute>
} />
<Route path="/kidney/my-requests" element={
  <ProtectedRoute><MyKidneyRequests /></ProtectedRoute>
} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

function App() {
  return (
    // ThemeProvider sits outermost so the appearance is resolved before
    // AuthProvider renders its loading screen — otherwise a dark-mode user
    // gets a white flash on every page load.
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              // Toasts render outside the app tree, so they read the tokens
              // straight off :root to stay in sync with the active theme.
              style: {
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
              },
            }}
          />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;