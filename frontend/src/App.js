import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorBoundary from "./components/ErrorBoundary";

// pages & components
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import Hospitals from "./pages/Hospitals";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard"; 
import BloodRequestsPage from "./pages/BloodRequestsPage";
import BloodRequestDetailPage from "./pages/BloodRequestDetailPage";
import AddMultipleRequestsPage from "./pages/AddMultipleRequestsPage";
import AdminLogin from "./pages/AdminLogin";
import SignupAsAdmin from "./pages/SignupAsAdmin";
import DigitalMedicalCardForm from "./components/DigitalMedicalCardForm";
import Reviews from "./pages/Reviews";
import HospitalDetail from "./pages/HospitalDetail";
import MyReviews from "./pages/MyReviews";

function App() {
  const { user } = useAuthContext();
  console.log("Current User:", user);

  return (
    <div className="App">
      <ErrorBoundary>
        <BrowserRouter>
          <Navbar />
          <div className="pages pt-24 md:pt-28">
            {/* Added top padding to push content below fixed navbar */}
            <Routes>
              {/* Show Home page to unauthenticated users and Dashboard to authenticated users */}
              <Route path="/" element={!user ? <Home /> : <Dashboard />} />
              <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/hospitals" element={<Hospitals />} />

              <Route
                path="/login"
                element={!user ? <Login /> : <Navigate to="/dashboard" />}
              />
              <Route
                path="/signup"
                element={!user ? <Signup /> : <Navigate to="/dashboard" />}
              />
              <Route
                path="/requests"
                element={
                  user ? <BloodRequestsPage /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/requests/:requestId"
                element={
                  user ? <BloodRequestDetailPage /> : <Navigate to="/login" />
                }
              />

              {/* Protected Routes */}
              <Route
                path="/admin/requests"
                element={
                  user ? (
                    <AddMultipleRequestsPage />
                  ) : (
                    <Navigate to="/adminlogin" />
                  )
                }
              />
              <Route
                path="/medical-card"
                element={
                  user ? (
                    <DigitalMedicalCardForm />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/reviews"
                element={<Reviews />}
              />
              <Route
                path="/hospital/:id"
                element={<HospitalDetail />}
              />
              <Route
                path="/adminlogin"
                element={
                  !user ? <AdminLogin /> : <Navigate to="/admin/requests" />
                }
              />
              <Route
                path="/signupasadmin"
                element={
                  !user ? <SignupAsAdmin /> : <Navigate to="/admin/requests" />
                }
              />
              <Route
                path="/my-reviews"
                element={user ? <MyReviews /> : <Navigate to="/login" />}
              />
            </Routes>
          </div>
        </BrowserRouter>
      </ErrorBoundary>
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;
