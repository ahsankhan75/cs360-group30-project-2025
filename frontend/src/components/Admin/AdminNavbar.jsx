import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext';
import { toast } from 'react-toastify';

const AdminNavbar = () => {
  const { admin, dispatch } = useAdminAuthContext();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Add scroll event listener to detect when user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleLogout = () => {
    // Remove admin from localStorage
    localStorage.removeItem('adminUser');
    
    // Update context
    dispatch({ type: 'LOGOUT' });
    
    // Notify user
    toast.success('Logged out successfully');
  };

  // Helper function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header 
      className={`bg-white p-4 md:p-6 fixed top-0 left-0 right-0 w-full z-50 transition-all duration-200 ease-in-out
                 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}
    >
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/admin/dashboard" className="flex items-center mr-6">
            <img src="/kk.png" alt="EMCON Admin" className="w-16 md:w-24 h-auto" />
            <span className="ml-2 font-semibold text-teal-600 hidden md:inline-block">ADMIN</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 ml-4">
            <Link 
              to="/admin/dashboard" 
              className={`${isActive('/admin/dashboard') ? 'text-teal-600' : 'text-gray-700'} hover:text-teal-500 transition-colors font-medium`}
            >
              Dashboard
            </Link>
            <Link 
              to="/admin/users" 
              className={`${isActive('/admin/users') ? 'text-teal-600' : 'text-gray-700'} hover:text-teal-500 transition-colors font-medium`}
            >
              Users
            </Link>
            <Link 
              to="/admin/hospitals" 
              className={`${isActive('/admin/hospitals') ? 'text-teal-600' : 'text-gray-700'} hover:text-teal-500 transition-colors font-medium`}
            >
              Hospitals
            </Link>
            <Link 
              to="/admin/blood-requests" 
              className={`${isActive('/admin/blood-requests') ? 'text-teal-600' : 'text-gray-700'} hover:text-teal-500 transition-colors font-medium`}
            >
              Blood Requests
            </Link>
            <Link 
              to="/admin/reviews" 
              className={`${isActive('/admin/reviews') ? 'text-teal-600' : 'text-gray-700'} hover:text-teal-500 transition-colors font-medium`}
            >
              Reviews
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {admin ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-gray-600 text-sm">{admin.email}</span>
              <Link 
                to="/" 
                className="text-gray-600 hover:text-teal-500 transition-colors"
              >
                Go to Site
              </Link>
              <Link 
                to="/admin/login"
                onClick={handleLogout}
                className="px-4 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex gap-3">
              <Link 
                to="/admin/login"
                className="px-4 py-1.5 text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors"
              >
                Login
              </Link>
            </div>
          )}
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
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
            <Link 
              to="/admin/dashboard"
              className="hover:text-teal-500 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/admin/users" 
              className="hover:text-teal-500 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Users
            </Link>
            <Link 
              to="/admin/hospitals" 
              className="hover:text-teal-500 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Hospitals
            </Link>
            <Link 
              to="/admin/blood-requests" 
              className="hover:text-teal-500 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blood Requests
            </Link>
            <Link 
              to="/admin/reviews" 
              className="hover:text-teal-500 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Reviews
            </Link>
            
            {admin && (
              <>
                <div className="border-t border-gray-200 pt-2 mt-2"></div>
                <span className="text-gray-600 text-sm">{admin.email}</span>
                <Link 
                  to="/" 
                  className="text-gray-600 hover:text-teal-500 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Go to Site
                </Link>
                <Link 
                  to="/admin/login"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  Logout
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminNavbar;
