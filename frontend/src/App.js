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
import AdminSignup from "./pages/Admin/AdminSignup";
import AdminHospitalAdminsPage from "./pages/Admin/AdminHospitalAdminsPage";

// Hospital Admin pages & components
import HospitalAdminLogin from './pages/HospitalAdmin/HospitalAdminLogin';
import HospitalAdminSignup from './pages/HospitalAdmin/HospitalAdminSignup';
import HospitalAdminDashboard from './pages/HospitalAdmin/HospitalAdminDashboard';
import HospitalAdminBloodRequests from './pages/HospitalAdmin/HospitalAdminBloodRequests';
import HospitalAdminProfile from './pages/HospitalAdmin/HospitalAdminProfile';
import HospitalAdminRequireAuth from './components/HospitalAdmin/HospitalAdminRequireAuth';
import HospitalAdminNavbar from './components/HospitalAdmin/HospitalAdminNavbar';

// Regular pages & components
import Login from "./pages/Login";
import Signup from "./pages/Signup";
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
import AdminNavbar from "./components/Admin/AdminNavbar";

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
                <Route path="/signupasadmin" element={null} />
                
                {/* Hospital Admin pages have their own navbar */}
                <Route path="/hospital-admin/login" element={null} />
                <Route path="/hospital-admin/signup" element={null} />
                <Route path="/hospital-admin/*" element={<HospitalAdminNavbar />} />
                
                {/* Other admin pages show the AdminNavbar through AdminLayout */}
                <Route path="/admin/*" element={<AdminNavbar />} />
                
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
                  <Route path="/signupasadmin" element={<SignupAsAdmin />} />

                  {/* Protected Admin Routes */}
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<AdminRequireAuth><AdminDashboard /></AdminRequireAuth>} />
                  <Route path="/admin/users" element={<AdminRequireAuth><AdminUsersPage /></AdminRequireAuth>} />
                  <Route path="/admin/hospitals" element={<AdminRequireAuth><AdminDashboard /></AdminRequireAuth>} />
                  <Route path="/admin/hospital-admins" element={<AdminRequireAuth><AdminHospitalAdminsPage /></AdminRequireAuth>} />
                  <Route path="/admin/blood-requests" element={<AdminRequireAuth><AdminDashboard /></AdminRequireAuth>} />
                  <Route path="/admin/reviews" element={<AdminRequireAuth><AdminDashboard /></AdminRequireAuth>} />
                  
                  {/* Hospital Admin Authentication Routes - Public */}
                  <Route path="/hospital-admin/login" element={<HospitalAdminLogin />} />
                  <Route path="/hospital-admin/signup" element={<HospitalAdminSignup />} />
                  
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
                </Routes>
              </div>
              <ToastContainer position="bottom-right" />
            </BrowserRouter>
          </HospitalAdminAuthContextProvider>
        </AdminAuthContextProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
