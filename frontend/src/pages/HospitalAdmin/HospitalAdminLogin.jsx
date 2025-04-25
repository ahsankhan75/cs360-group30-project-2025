import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHospitalAdminLogin } from '../../hooks/useHospitalAdminLogin'; // Assuming correct path
import ErrorPage from '../../components/ErrorPage'; // Assuming correct path

const HospitalAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [connectionError, setConnectionError] = useState(false); // For network/server errors
  const { login, isLoading, error } = useHospitalAdminLogin(); // Hook handles API logic, loading, and auth errors
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConnectionError(false); // Reset connection error on new submit attempt

    try {
      // The login hook attempts the API call
      const success = await login(email, password);

      // If login hook indicates success (user context updated)
      if (success) {
        navigate('/hospital-admin/dashboard'); // Redirect to dashboard
      }
      // If success is false, the 'error' state in the hook is likely set, which will be displayed below
    } catch (err) {
      // Catch errors not handled by the hook (e.g., network issues, server down)
      console.error('Connection or unexpected error during login:', err);
      // Distinguish between auth errors (handled by hook) and connection errors
      if (!error) { // Only set connection error if the hook didn't already report an auth error
          setConnectionError(true);
      }
    }
  };

  // Handler for the retry button on the ErrorPage
  const handleRetry = async () => {
    setConnectionError(false); // Clear the connection error state
    // Optionally, add a small delay or visual feedback if needed
    // await new Promise(resolve => setTimeout(resolve, 500));
    // No need to return a promise unless ErrorPage specifically requires it
  };

  // Show full-page error component if there's a connection error
  if (connectionError) {
    return <ErrorPage onRetry={handleRetry} message="Could not connect to the server. Please check your internet connection and try again." />;
  }

  // --- Main Login Form Rendering ---
  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 flex justify-center items-center p-6 relative">
        {/* Background SVG Decorations */}
        <div className="absolute left-0 top-0 h-full w-auto z-[1]">
          <svg
            viewBox="0 0 275 667"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-64 md:w-20 lg:w-[250px] opacity-50"
          >
            <path
              d="M234.053 400.435C289.469 364.525 287.855 282.893 231.063 249.201L-167.15 12.9649C-227.154 -22.632 -302.922 21.5139 -301.542 91.2684L-291.893 579.298C-290.513 649.053 -213.06 690.169 -154.51 652.228L234.053 400.435Z"
              fill="#0694A2"
              fillOpacity="0.70"
            />
          </svg>

          <div className="absolute left-[-50px] bottom-[-500px] rotate-[-125deg] h-auto w-auto z-[-1]">
            <svg
              viewBox="0 0 506 1073"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-20 md:w-80 lg:w-[350px] opacity-50"
            >
              <path
                d="M-317.959 631.137C-386.294 586.549 -386.294 486.451 -317.959 441.863L330.501 18.7549C405.664 -30.2875 505.25 23.6442 505.25 113.391L505.25 959.609C505.25 1049.36 405.664 1103.29 330.501 1054.25L-317.959 631.137Z"
                fill="#0694A2"
                fillOpacity="0.7"
              />
            </svg>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg max-w-lg w-full text-left z-[20]">
          {/* Logo and Title */}
          <img src="/kk.png" alt="EMCON Logo" className="w-32 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#2a9fa7] mb-6 text-center">
            Hospital Admin Login
          </h2>

          {/* Loading Indicator */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
              <p className="text-gray-600">Logging in...</p>
            </div>
          ) : (
            // Login Form
            <form onSubmit={handleSubmit} className="space-y-5"> {/* Increased spacing slightly */}
              <div>
                <label htmlFor="email" className="block font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-[#15aacf]/50 focus:border-[#15aacf] outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-required="true"
                  aria-label="Email Address"
                />
              </div>
              <div>
                <label htmlFor="password" className="block font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-[#15aacf]/50 focus:border-[#15aacf] outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-required="true"
                  aria-label="Password"
                />
              </div>

              {/* Links: Signup and Forgot Password */}
              <div className="flex justify-between text-sm text-gray-600">
                <Link
                  to="/hospital-admin/signup" // Corrected signup link based on likely context
                  className="hover:underline text-[#15aacf] font-medium"
                >
                  Create admin account?
                </Link>
                <Link
                  to="/hospital-admin/forgot-password" // Link to the forgot password page
                  className="hover:underline text-[#15aacf] font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-[#2a9fa7] text-white font-semibold rounded-lg hover:bg-[#238a91] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading} // Disable button while loading
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </button>

              {/* Display API errors from the hook */}
              {error && <div className="text-red-600 text-sm text-center p-2 bg-red-50 border border-red-200 rounded-md">{error}</div>}
            </form>
          )}

          {/* Back to Home Link */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-[#15aacf] hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#2a9fa7] text-white h-auto py-8 md:py-12 px-8 md:px-12 lg:px-16 relative z-[10]"> {/* Adjusted height to auto */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left gap-4">
          <div>
            <h1 className="text-2xl font-bold">EMCON</h1>
            <p className="mt-2 text-sm">Smart healthcare navigation for everyone!</p>
          </div>
          <div className="flex flex-wrap justify-center space-x-4 md:space-x-6 text-sm">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/hospitals" className="hover:underline">Find Hospitals</Link>
            <Link to="/login" className="hover:underline">User Login</Link>
            {/* Maybe add About/Contact links here later */}
          </div>
        </div>
         <div className="text-center text-xs mt-6 border-t border-teal-600 pt-4">
            © {new Date().getFullYear()} EMCON. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default HospitalAdminLogin;