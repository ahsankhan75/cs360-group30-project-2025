import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHospitalAdminLogin } from '../../hooks/useHospitalAdminLogin';
import ErrorPage from '../../components/ErrorPage';

const HospitalAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [connectionError, setConnectionError] = useState(false);
  const { login, isLoading, error } = useHospitalAdminLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConnectionError(false);

    try {
      const success = await login(email, password);

      if (success) {
        navigate('/hospital-admin/dashboard');
      }
    } catch (err) {
      console.error('Connection error:', err);
      setConnectionError(true);
    }
  };

  const handleRetry = async () => {
    setConnectionError(false);
    // Return a promise that resolves after a delay to show loading animation
    return new Promise(resolve => setTimeout(resolve, 1500));
  };

  // Show error page if there's a connection error
  if (connectionError) {
    return <ErrorPage onRetry={handleRetry} />;
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 flex justify-center items-center p-6 relative">
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

        <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg max-w-lg w-full text-left z-[20]">
          <img src="/kk.png" alt="EMCON Logo" className="w-32 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#2a9fa7] mb-4 text-center">
            Hospital Admin Login
          </h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
              <p className="text-gray-600">Logging in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-2 border rounded-md focus:ring focus:ring-[#15aacf]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block font-medium">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full p-2 border rounded-md focus:ring focus:ring-[#15aacf]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <p className="text-sm text-gray-600">
                <span
                  className="text-[#15aacf] cursor-pointer hover:underline"
                  onClick={() => navigate("/hospital-admin/signup")}
                >
                  Create a hospital admin account?
                </span>
              </p>
              <button
                type="submit"
                className="w-full py-2 bg-[#2a9fa7] text-white font-semibold rounded-lg hover:bg-opacity-90"
              >
                Log In
              </button>
              {error && <div className="text-red-500 mt-2">{error}</div>}
            </form>
          )}

          <div className="mt-4 text-center">
            <Link to="/" className="text-[#15aacf] hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-[#2a9fa7] text-white h-32 md:h-48 py-8 md:py-12 px-8 md:px-12 lg:px-16 mt-8 relative z-[10]">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">EMCON</h1>
            <p className="mt-2">Smart healthcare navigation for everyone!</p>
          </div>
          <div className="flex space-x-6">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/hospitals" className="hover:underline">Find Hospitals</Link>
            <Link to="/login" className="hover:underline">User Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HospitalAdminLogin;