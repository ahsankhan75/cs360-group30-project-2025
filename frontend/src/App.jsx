import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import UserLayout from './components/UserLayout';
import Footer from './components/Footer';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import HospitalManagement from './pages/Admin/HospitalManagement';
import BloodRequests from './pages/BloodRequests';
import Hospitals from './pages/Hospitals';
import DigitalMedicalCard from './pages/DigitalMedicalCard';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen flex flex-col bg-gray-50">
                    <Navbar />
                    <div className="flex-grow flex flex-col">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/hospitals" element={<Hospitals />} />

                            {/* Protected User Routes */}
                            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                            <Route path="/blood-requests" element={<PrivateRoute><BloodRequests /></PrivateRoute>} />
                            <Route path="/medical-card" element={<PrivateRoute><DigitalMedicalCard /></PrivateRoute>} />

                            {/* Admin Routes */}
                            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                            <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
                            <Route path="/admin/hospitals" element={<AdminRoute><HospitalManagement /></AdminRoute>} />
                        </Routes>
                    </div>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App; 