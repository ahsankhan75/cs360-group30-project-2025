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
      className="bg-white py-1 px-2 xs:py-2 xs:px-3 md:py-3 md:px-4 lg:p-6 sticky top-0 left-0 right-0 w-full z-50 shadow-md"
    >
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/hospital-admin/dashboard" className="flex items-center mr-1 xs:mr-2 md:mr-4">
          <img src="/kk.png" alt="EMCON Logo" className="w-8 xs:w-10 sm:w-12 md:w-16 lg:w-20 h-auto" />
          <span className="text-sm xs:text-base md:text-lg lg:text-xl font-bold text-teal-700 ml-1 md:ml-2 hidden xs:inline">
            <span className="md:hidden lg:inline">Hospital</span> Admin
          </span>
        </Link>

        {/* Desktop/Tablet Navigation */}
        <nav className="hidden md:flex space-x-1 lg:space-x-6 ml-1 xs:ml-2">
          <Link to="/hospital-admin/dashboard" 
            className={`text-xs sm:text-sm lg:text-base text-gray-700 hover:text-teal-500 transition-colors font-medium py-1 px-1.5 xs:px-2 ${isActive('/hospital-admin/dashboard') ? 'underline underline-offset-4' : ''}`}
          >
            Dashboard
          </Link>
          <Link to="/hospital-admin/blood-requests" 
            className={`text-xs sm:text-sm lg:text-base text-gray-700 hover:text-teal-500 transition-colors font-medium py-1 px-1.5 xs:px-2 ${isActive('/hospital-admin/blood-requests') ? 'underline underline-offset-4' : ''}`}
          >
            Blood Requests
          </Link>
          <Link to="/hospital-admin/reviews" 
            className={`text-xs sm:text-sm lg:text-base text-gray-700 hover:text-teal-500 transition-colors font-medium py-1 px-1.5 xs:px-2 ${isActive('/hospital-admin/reviews') ? 'underline underline-offset-4' : ''}`}
          >
            Reviews
          </Link>
          <Link to="/hospital-admin/profile" 
            className={`text-xs sm:text-sm lg:text-base text-gray-700 hover:text-teal-500 transition-colors font-medium py-1 px-1.5 xs:px-2 ${isActive('/hospital-admin/profile') ? 'underline underline-offset-4' : ''}`}
          >
            Profile
          </Link>
        </nav>

        {/* Profile/Logout or Login */}
        <div className="flex items-center gap-1 xs:gap-2 md:gap-3">
          {hospitalAdmin ? (
            <>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-6 h-6 xs:w-7 xs:h-7 md:w-8 md:h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs xs:text-sm md:text-base">
                  {hospitalAdmin.hospitalName ? hospitalAdmin.hospitalName[0] : 'A'}
                </div>
                <span className="hidden md:block text-xs lg:text-sm text-gray-700 font-medium max-w-[80px] md:max-w-[120px] lg:max-w-none truncate">
                  {hospitalAdmin.hospitalName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-1.5 py-0.5 xs:px-2 xs:py-1 md:px-3 md:py-1.5 text-xs md:text-sm text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/hospital-admin/login"
              className="px-1.5 py-0.5 xs:px-2 xs:py-1 md:px-3 md:py-1.5 text-xs md:text-sm text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors"
            >
              Login
            </Link>
          )}

          {/* Mobile menu button */}
          <button className="md:hidden focus:outline-none" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 xs:h-5 xs:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 xs:h-5 xs:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md py-2 xs:py-3 px-3 xs:px-4 z-50">
          <div className="flex flex-col space-y-2 xs:space-y-3">
            <Link to="/hospital-admin/dashboard" className="text-xs xs:text-sm hover:text-teal-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Dashboard
            </Link>
            <Link to="/hospital-admin/blood-requests" className="text-xs xs:text-sm hover:text-teal-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Blood Requests
            </Link>
            <Link to="/hospital-admin/reviews" className="text-xs xs:text-sm hover:text-teal-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Reviews
            </Link>
            <Link to="/hospital-admin/profile" className="text-xs xs:text-sm hover:text-teal-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Hospital Profile
            </Link>
            {hospitalAdmin ? (
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="text-left text-xs xs:text-sm px-2 xs:px-3 py-0.5 xs:py-1 text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors mt-1"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/hospital-admin/login"
                className="text-xs xs:text-sm px-2 xs:px-3 py-0.5 xs:py-1 text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors mt-1"
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