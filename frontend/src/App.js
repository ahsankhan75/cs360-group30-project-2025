import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { AdminAuthContextProvider } from './context/AdminAuthContext';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminRequireAuth from './components/Admin/AdminRequireAuth';
import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import AdminSignup from "./pages/Admin/AdminSignup";

// pages & components
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
          <BrowserRouter>
            {/* Routes conditionally render the navbar */}
            <Routes>
              {/* Admin login/signup page has its own layout */}
              <Route path="/admin/login" element={null} />
              <Route path="/admin/signup" element={null} />
              <Route path="/signupasadmin" element={null} />
              
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
                <Route path="/admin/blood-requests" element={<AdminRequireAuth><AdminDashboard /></AdminRequireAuth>} />
                <Route path="/admin/reviews" element={<AdminRequireAuth><AdminDashboard /></AdminRequireAuth>} />
              </Routes>
            </div>
            <ToastContainer position="bottom-right" />
          </BrowserRouter>
        </AdminAuthContextProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
