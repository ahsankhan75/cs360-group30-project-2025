
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import ProfileIcon from './profile-icon';

const Navbar = () => {
  const { user } = useAuthContext();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <header
      className={`
        bg-white p-4 md:p-6
        sticky top-0 left-0 right-0 w-full z-50
        transition-all duration-200 ease-in-out
        ${scrolled ? 'shadow-md' : 'shadow-sm'}
      `}
    >
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center mr-6">
            <img src="/kk.png" alt="EMCON Logo" className="w-16 md:w-24 h-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 ml-4">
            <Link to="/" className="text-gray-700 hover:text-teal-500 transition-colors font-medium">
              Home
            </Link>
            <Link to="/hospitals" className="text-gray-700 hover:text-teal-500 transition-colors font-medium">
              Find Hospitals
            </Link>
            {user && (
              <>
                <Link to="/blood-requests" className="text-gray-700 hover:text-teal-500 transition-colors font-medium">
                  Blood Donations
                </Link>
                {/* <Link to="/my-blood-requests" className="text-gray-700 hover:text-teal-500 transition-colors font-medium">
                  Manage Requests
                </Link> */}
                <Link to="/medical-card" className="text-gray-700 hover:text-teal-500 transition-colors font-medium">
                  Medical Card
                </Link>
                <Link to="/reviews" className="text-gray-700 hover:text-teal-500 transition-colors font-medium">
                  Reviews
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <ProfileIcon />
          ) : (
            <div className="hidden md:flex gap-3">
              <Link
                to="/login"
                className="px-4 py-1.5 text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
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
            <Link to="/" className="hover:text-teal-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/hospitals" className="hover:text-teal-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Find Hospitals
            </Link>
            {user ? (
              <>
                <Link to="/blood-requests" className="hover:text-teal-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Blood Donations
                </Link>
                <Link to="/my-blood-requests" className="hover:text-teal-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Manage Requests
                </Link>
                <Link to="/medical-card" className="hover:text-teal-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Medical Card
                </Link>
                <Link to="/reviews" className="hover:text-teal-500 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Reviews
                </Link>
              </>
            ) : (
              <div className="flex flex-col space-y-3 pt-2">
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;