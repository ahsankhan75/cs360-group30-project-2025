import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHospitalAdminSignup } from '../../hooks/useHospitalAdminSignup';
import { toast } from 'react-toastify';

const HospitalAdminSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [hospitalError, setHospitalError] = useState('');
  const [done, setDone] = useState(false)
  
  const { signup, isLoading, error } = useHospitalAdminSignup();
  const navigate = useNavigate();

  // Fetch hospitals for dropdown
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('/api/hospitals/names');
        if (!response.ok) {
          throw new Error('Failed to fetch hospitals');
        }
        
        const data = await response.json();
        setHospitals(data);
        setHospitalError('');
      } catch (err) {
        console.error('Error fetching hospitals:', err);
        setHospitalError('Unable to load hospitals. Please try again later.');
        toast.error('Failed to load hospitals');
      } finally {
        setLoadingHospitals(false);
      }
    };

    fetchHospitals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (!selectedHospital) {
      toast.error('Please select a hospital');
      return;
    }
    
    const success = await signup(email, password, fullName, selectedHospital);
    
    // if (success) {
    //   // After successful signup, redirect to login with a message
    //   navigate('/hospital-admin/login');
    // }
    if (success?.message) {
      toast.success(success.message)
      setDone(true)
    }
  };

  if (done) {
    return (
      <div className="…card layout…">
        <h2 className="text-xl font-bold mb-4">Almost there!</h2>
        <p>Check your email (<strong>{email}</strong>) for a verification link.</p>
        <button
          onClick={() => navigate("/hospital-admin/login")}
          className="mt-6 py-2 px-4 bg-[#2a9fa7] text-white rounded"
        >
          Back to login
        </button>
      </div>
    )
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
        </div>

        <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg max-w-lg w-full text-left z-[20]">
          <img src="/kk.png" alt="EMCON Logo" className="w-32 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#2a9fa7] mb-4 text-center">
            Hospital Admin Signup
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full p-2 border rounded-md focus:ring focus:ring-[#15aacf]"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            
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
            
            <div>
              <label className="block font-medium">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                className="w-full p-2 border rounded-md focus:ring focus:ring-[#15aacf]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block font-medium">Select Hospital</label>
              {loadingHospitals ? (
                <div className="flex items-center text-gray-500">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-teal-500 mr-2"></div>
                  Loading hospitals...
                </div>
              ) : (
                <select
                  className="w-full p-2 border rounded-md focus:ring focus:ring-[#15aacf]"
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  required
                >
                  <option value="">Select a hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital._id} value={hospital._id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              )}
              {hospitalError && <div className="text-red-500 mt-1 text-sm">{hospitalError}</div>}
            </div>
            
            <p className="text-sm text-gray-600">
              <span
                className="text-[#15aacf] cursor-pointer hover:underline"
                onClick={() => navigate("/hospital-admin/login")}
              >
                Already have an account? Login here
              </span>
            </p>
            
            <button
              type="submit"
              className="w-full py-2 bg-[#2a9fa7] text-white font-semibold rounded-lg hover:bg-opacity-90 disabled:opacity-50"
              disabled={isLoading || loadingHospitals}
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
            
            {error && <div className="text-red-500 mt-2">{error}</div>}
            
            <div className="bg-blue-50 p-3 rounded-md text-blue-700 text-sm mt-4">
              <p>Note: Hospital Admin accounts require approval by EMCON administrators before they can be used. You will be notified once your account is approved.</p>
            </div>
          </form>
          
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

export default HospitalAdminSignup;