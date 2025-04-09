
///2
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";

// pages & components
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import Hospitals from "./pages/Hospitals";
import Home from "./pages/Home";
import BloodRequestsPage from "./pages/BloodRequestsPage";
import BloodRequestDetailPage from "./pages/BloodRequestDetailPage";
import AddMultipleRequestsPage from "./pages/AddMultipleRequestsPage";
import AdminLogin from "./pages/AdminLogin";
import SignupAsAdmin from "./pages/SignupAsAdmin";
import DigitalMedicalCardForm from "./components/DigitalMedicalCardForm";

function App() {
  const { user } = useAuthContext();
  console.log("Current User:", user);

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="pages">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hospitals" element={<Hospitals />} />
            
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/hospitals" />}
            />
            <Route
              path="/signup"
              element={!user ? <Signup /> : <Navigate to="/hospitals" />}
            />
            <Route path="/requests" element={<BloodRequestsPage />} />
            <Route
              path="/requests/:requestId"
              element={<BloodRequestDetailPage />}
            />

            {/* Protected Routes */}
            <Route
              path="/admin/requests"
              element={user ? <AddMultipleRequestsPage /> : <Navigate to="/adminlogin" />}
            />
            <Route
              path="/medical-card"
              element={user ? <DigitalMedicalCardForm /> : <Navigate to="/medical-card" />}
            />

            <Route
              path="/adminlogin"
              element={!user ? <AdminLogin /> : <Navigate to="/admin/requests" />}
            />
            <Route
              path="/signupasadmin"
              element={!user ? <SignupAsAdmin /> : <Navigate to="/admin/requests" />}
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
