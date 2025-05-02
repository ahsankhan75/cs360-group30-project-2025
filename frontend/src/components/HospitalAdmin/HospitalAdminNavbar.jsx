import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useHospitalAdminAuthContext } from '../../hooks/useHospitalAdminAuthContext';
import { useHospitalAdminLogout } from '../../hooks/useHospitalAdminLogout';

const HospitalAdminNavbar = () => {
  const { hospitalAdmin } = useHospitalAdminAuthContext();
  const { logout } = useHospitalAdminLogout();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/hospital-admin/login');
  };

  // Check if a menu item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header
      className={`bg-white p-4 md:p-6 sticky top-0 left-0 right-0 w-full z-50 shadow-md`}
    >
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/hospital-admin/dashboard" className="flex items-center mr-6">
          <img src="/kk.png" alt="EMCON Logo" className="w-16 md:w-24 h-auto" />
          <span className="text-xl font-bold text-teal-700 ml-2 hidden md:inline">Hospital Admin</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 ml-4">
          <Link to="/hospital-admin/dashboard" className={`text-gray-700 hover:text-teal-500 transition-colors font-medium ${isActive('/hospital-admin/dashboard') ? 'underline underline-offset-4' : ''}`}>Dashboard</Link>
          <Link to="/hospital-admin/blood-requests" className={`text-gray-700 hover:text-teal-500 transition-colors font-medium ${isActive('/hospital-admin/blood-requests') ? 'underline underline-offset-4' : ''}`}>Blood Requests</Link>
          <Link to="/hospital-admin/reviews" className={`text-gray-700 hover:text-teal-500 transition-colors font-medium ${isActive('/hospital-admin/reviews') ? 'underline underline-offset-4' : ''}`}>Reviews</Link>
          <Link to="/hospital-admin/profile" className={`text-gray-700 hover:text-teal-500 transition-colors font-medium ${isActive('/hospital-admin/profile') ? 'underline underline-offset-4' : ''}`}>Hospital Profile</Link>
        </nav>

        {/* Profile/Logout or Login */}
        <div className="flex items-center gap-4">
          {hospitalAdmin ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg">
                  {hospitalAdmin.hospitalName ? hospitalAdmin.hospitalName[0] : 'A'}
                </div>
                <span className="hidden md:block text-sm text-gray-700 font-medium">{hospitalAdmin.hospitalName}</span>
              </div>
            <button
                onClick={handleLogout}
                className="px-4 py-1.5 text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/hospital-admin/login"
              className="px-4 py-1.5 text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors"
            >
              Login
            </Link>
          )}

          {/* Mobile menu button */}
          <button className="md:hidden focus:outline-none" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
            </button>
        </div>
          </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md py-4 px-6 z-50">
          <div className="flex flex-col space-y-4">
            <Link to="/hospital-admin/dashboard" className="hover:text-teal-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
            <Link to="/hospital-admin/blood-requests" className="hover:text-teal-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Blood Requests
              </Link>
            <Link to="/hospital-admin/reviews" className="hover:text-teal-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Reviews
              </Link>
            <Link to="/hospital-admin/profile" className="hover:text-teal-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Hospital Profile
              </Link>
            {hospitalAdmin ? (
                <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="text-left px-4 py-1.5 text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors mt-2"
                >
                  Logout
                </button>
            ) : (
              <Link
                to="/hospital-admin/login"
                className="px-4 py-1.5 text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default HospitalAdminNavbar;