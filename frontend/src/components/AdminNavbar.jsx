import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuthContext } from '../hooks/useAdminAuthContext';
import { useAdminLogout } from '../hooks/useAdminLogout';

const AdminNavbar = () => {
  const { admin } = useAdminAuthContext();
  const { logout } = useAdminLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Array of navigation links for easy management
  const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/hospitals", label: "Hospitals" },
    { to: "/admin/blood-requests", label: "Blood Requests" },
    { to: "/admin/reviews", label: "Reviews" }
  ];

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-[#1e293b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/admin/dashboard" className="flex items-center space-x-2">
              <img src="/kk.png" alt="EMCON Logo" className="h-10 w-10" />
              <span className="font-bold text-xl">EMCON Admin</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {admin && (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="px-3 py-2 text-white hover:text-teal-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="border-l border-gray-700 h-6 mx-2"></div>

                <span className="text-gray-400 text-sm">{admin.email}</span>

                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800">
            {admin && navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-3 py-2 text-base font-medium text-white hover:bg-gray-700 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-gray-700 my-2 pt-2">
              <div className="px-3 py-2 text-sm text-gray-400">
                {admin && admin.email}
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:bg-gray-700 hover:text-red-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;
