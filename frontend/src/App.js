import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { AdminAuthContextProvider } from './context/AdminAuthContext';
import { HospitalAdminAuthContextProvider } from './context/HospitalAdminAuthContext';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminRequireAuth from './components/Admin/AdminRequireAuth';
import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import AdminHospitalsPage from "./pages/Admin/AdminHospitalsPage";
import AdminSignup from "./pages/Admin/AdminSignup";
import AdminForgotPassword from "./pages/Admin/AdminForgotPassword";
import AdminResetPassword from "./pages/Admin/AdminResetPassword";
import VerifyAdminEmail from "./pages/VerifyEmailAdmin";
import AdminHospitalAdminsPage from "./pages/Admin/AdminHospitalAdminsPage";
import AdminBloodRequestDetailPage from "./pages/Admin/AdminBloodRequestDetailPage";
import AdminReviewsPage from "./pages/Admin/AdminReviewsPage";

// Hospital Admin pages & components
import HospitalAdminLogin from './pages/HospitalAdmin/HospitalAdminLogin';
import HospitalAdminSignup from './pages/HospitalAdmin/HospitalAdminSignup';
import HospitalAdminForgotPassword from './pages/HospitalAdmin/HospitalAdminForgotPassword';
import HospitalAdminResetPassword from './pages/HospitalAdmin/HospitalAdminResetPassword';
import HospitalAdminDashboard from './pages/HospitalAdmin/HospitalAdminDashboard';
import HospitalAdminBloodRequests from './pages/HospitalAdmin/HospitalAdminBloodRequests';
import HospitalAdminProfile from './pages/HospitalAdmin/HospitalAdminProfile';
import HospitalAdminReviews from './pages/HospitalAdmin/HospitalAdminReviews';
import HospitalAdminRequireAuth from './components/HospitalAdmin/HospitalAdminRequireAuth';
// import HospitalAdminNavbar from './components/HospitalAdmin/HospitalAdminNavbar';
// import HospitalAdminBloodRequestDetail from './pages/HospitalAdmin/HospitalAdminBloodRequestDetail';

import AdminBloodRequestsPage from "./pages/Admin/AdminBloodRequestsPage";



// Regular pages & components
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail"
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Navbar from "./components/Navbar";
import Hospitals from "./pages/Hospitals";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import BloodRequestsPage from "./pages/BloodRequestsPage";
import BloodRequestDetailPage from "./pages/BloodRequestDetailPage";
import MyBloodRequestsPage from "./pages/MyBloodRequestsPage";
import SignupAsAdmin from "./pages/SignupAsAdmin";
import DigitalMedicalCardForm from "./components/DigitalMedicalCardForm";
import Reviews from "./pages/Reviews";
import HospitalDetail from "./pages/HospitalDetail";
import MyReviews from "./pages/MyReviews";
// Admin components are imported through their respective pages

function App() {
  const { user } = useAuthContext();

  return (
    <div className="App">
      <ErrorBoundary>
        <AdminAuthContextProvider>
          <HospitalAdminAuthContextProvider>
            <BrowserRouter>
              {/* Routes conditionally render the navbar */}
              <Routes>
                {/* Admin login/signup page has its own layout */}
                <Route path="/admin/login" element={null} />
                <Route path="/admin/signup" element={null} />

                <Route path="/verify-email/:token" element={null} />
                <Route path="/forgot-password" element={null} />
                <Route path="/reset-password/:token" element={null} />

                {/* Hospital Admin pages have their own navbar */}
                <Route path="/hospital-admin/login" element={null} />
                <Route path="/hospital-admin/signup" element={null} />
                <Route path="/hospital-admin/*" element={null} />

                {/* Admin pages use AdminNavbar through AdminLayout */}
                <Route path="/admin/*" element={null} />

                {/* Regular routes show navbar */}
                <Route path="*" element={<Navbar />} />
              </Routes>

              <div className="pages">
                <Routes>
                  {/* User Routes */}
                  <Route path="/" element={!user ? <Home /> : <Dashboard />} />
                  <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                  <Route path="/hospitals" element={<Hospitals />} />
                  <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
                  <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
                  <Route path="/verify-email/:token" element={<VerifyEmail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/hospital/:id" element={<HospitalDetail />} />
                  <Route path="/medical-card" element={user ? <DigitalMedicalCardForm /> : <Navigate to="/login" />} />
                  <Route path="/my-reviews" element={user ? <MyReviews /> : <Navigate to="/login" />} />

                  {/* Blood request routes - Users can only view and accept */}
                  <Route path="/blood-requests" element={<BloodRequestsPage />} />
                  <Route path="/blood-requests/:requestId" element={user ? <BloodRequestDetailPage /> : <Navigate to="/login" />} />
                  <Route path="/my-blood-requests" element={user ? <MyBloodRequestsPage /> : <Navigate to="/login" />} />

                  {/* Legacy routes that redirect to the new consistent naming */}
                  <Route path="/requests" element={<Navigate to="/blood-requests" replace />} />
                  <Route path="/requests/:requestId" element={<Navigate to="/blood-requests/:requestId" replace />} />

                  {/* Admin Authentication Routes - Public */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/signup" element={<AdminSignup />} />
                  <Route path="/signupasadmin" element={<Navigate to="/hospital-admin/signup" replace />} />
                  <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
                  <Route path="/admin/reset-password/:token" element={<AdminResetPassword />} />
                  <Route path="/admin/verify-email/:token" element={<VerifyAdminEmail />} />

                  {/* Protected Admin Routes */}
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<AdminRequireAuth><AdminDashboard /></AdminRequireAuth>} />
                  <Route path="/admin/users" element={<AdminRequireAuth><AdminUsersPage /></AdminRequireAuth>} />

                  <Route path="/admin/hospitals" element={<AdminRequireAuth><AdminHospitalsPage /></AdminRequireAuth>} />
                  <Route path="/admin/hospital-admins" element={<AdminRequireAuth><AdminHospitalAdminsPage /></AdminRequireAuth>} />
                  <Route path="/admin/blood-requests" element={<AdminRequireAuth><AdminBloodRequestsPage /></AdminRequireAuth>} />
                  <Route path="/admin/blood-requests/:requestId" element={<AdminRequireAuth><AdminBloodRequestDetailPage /></AdminRequireAuth>} />
                  <Route path="/admin/reviews" element={<AdminRequireAuth><AdminReviewsPage /></AdminRequireAuth>} />

                  {/* Hospital Admin Authentication Routes - Public */}
                  <Route path="/hospital-admin/login" element={<HospitalAdminLogin />} />
                  <Route path="/hospital-admin/signup" element={<HospitalAdminSignup />} />
                  <Route path="/hospital-admin/forgot-password" element={<HospitalAdminForgotPassword />} />
                  <Route path="/hospital-admin/reset-password/:token" element={<HospitalAdminResetPassword />} />

                  {/* Protected Hospital Admin Routes */}
                  <Route path="/hospital-admin" element={<Navigate to="/hospital-admin/dashboard" replace />} />
                  <Route path="/hospital-admin/dashboard" element={
                    <HospitalAdminRequireAuth><HospitalAdminDashboard /></HospitalAdminRequireAuth>
                  } />
                  <Route path="/hospital-admin/blood-requests" element={
                    <HospitalAdminRequireAuth><HospitalAdminBloodRequests /></HospitalAdminRequireAuth>
                  } />
                  <Route path="/hospital-admin/profile" element={
                    <HospitalAdminRequireAuth><HospitalAdminProfile /></HospitalAdminRequireAuth>
                  } />
                  <Route path="/hospital-admin/reviews" element={
                    <HospitalAdminRequireAuth><HospitalAdminReviews /></HospitalAdminRequireAuth>
                  } />
                </Routes>
              </div>
              <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover={false}
                limit={3}
                delay={500}
              />
            </BrowserRouter>
          </HospitalAdminAuthContextProvider>
        </AdminAuthContextProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
