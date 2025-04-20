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
    <nav className="bg-teal-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-teal-200 hover:text-white hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Logo and desktop navigation */}
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/hospital-admin/dashboard" className="flex items-center">
                <img src="/kk.png" alt="EMCON" className="h-8 w-auto mr-2" />
                <span className="text-xl font-bold">Hospital Admin</span>
              </Link>
            </div>
            <div className="hidden sm:block sm:ml-6">
              <div className="flex space-x-4">
                <Link
                  to="/hospital-admin/dashboard"
                  className={`${
                    isActive('/hospital-admin/dashboard')
                      ? 'bg-teal-800 text-white'
                      : 'text-teal-100 hover:bg-teal-600 hover:text-white'
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/hospital-admin/blood-requests"
                  className={`${
                    isActive('/hospital-admin/blood-requests')
                      ? 'bg-teal-800 text-white'
                      : 'text-teal-100 hover:bg-teal-600 hover:text-white'
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Blood Requests
                </Link>
                <Link
                  to="/hospital-admin/reviews"
                  className={`${
                    isActive('/hospital-admin/reviews')
                      ? 'bg-teal-800 text-white'
                      : 'text-teal-100 hover:bg-teal-600 hover:text-white'
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Reviews
                </Link>
                <Link
                  to="/hospital-admin/profile"
                  className={`${
                    isActive('/hospital-admin/profile')
                      ? 'bg-teal-800 text-white'
                      : 'text-teal-100 hover:bg-teal-600 hover:text-white'
                  } px-3 py-2 rounded-md text-sm font-medium`}
                >
                  Hospital Profile
                </Link>
              </div>
            </div>
          </div>

          {/* User menu */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {hospitalAdmin ? (
              <div className="flex items-center">
                <span className="hidden md:block text-sm mr-3">
                  {hospitalAdmin.hospitalName}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-800 rounded text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/hospital-admin/login"
                className="px-3 py-1 bg-teal-600 hover:bg-teal-800 rounded text-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div
        className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/hospital-admin/dashboard"
            className={`${
              isActive('/hospital-admin/dashboard')
                ? 'bg-teal-800 text-white'
                : 'text-teal-100 hover:bg-teal-600 hover:text-white'
            } block px-3 py-2 rounded-md text-base font-medium`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/hospital-admin/blood-requests"
            className={`${
              isActive('/hospital-admin/blood-requests')
                ? 'bg-teal-800 text-white'
                : 'text-teal-100 hover:bg-teal-600 hover:text-white'
            } block px-3 py-2 rounded-md text-base font-medium`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Blood Requests
          </Link>
          <Link
            to="/hospital-admin/profile"
            className={`${
              isActive('/hospital-admin/profile')
                ? 'bg-teal-800 text-white'
                : 'text-teal-100 hover:bg-teal-600 hover:text-white'
            } block px-3 py-2 rounded-md text-base font-medium`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Hospital Profile
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default HospitalAdminNavbar;