
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import UserDashboard from '../components/UserDashboard';

const Dashboard = () => {
  const { user } = useAuthContext();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch user's name from medical card
  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/medical-card', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.name) {
            setUserName(data.name);
          } else if (user.fullName) {
            // Use fullName from user object if available
            setUserName(user.fullName);
          } else {
            // Fallback to email username if no name is found
            setUserName(user.email.split('@')[0]);
          }
        } else if (user.fullName) {
          // Use fullName from user object if available
          setUserName(user.fullName);
        } else {
          // Fallback to email username if request fails
          setUserName(user.email.split('@')[0]);
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
        // Try to use fullName from user object if available
        if (user.fullName) {
          setUserName(user.fullName);
        } else {
          // Fallback to email username if there's an error
          setUserName(user.email.split('@')[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, [user]);

  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-teal-600">
          {loading ? 'Welcome!' : `Welcome, ${userName}!`}
        </h1>
        <p className="text-gray-600 mt-2">View your medical information and find donation opportunities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* New Hospitals Card */}
        <Link
          to="/hospitals"
          className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Find Hospitals</h2>
          <p>Locate nearby hospitals</p>
        </Link>

        {/* Medical Card */}
        <Link
          to="/medical-card"
          className="bg-gradient-to-br from-teal-400 to-teal-600 text-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Medical Card</h2>
          <p>View and manage your digital medical card</p>
        </Link>

        {/* Blood Donations */}
        <Link
          to="/blood-requests"
          className="bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Blood Donations</h2>
          <p>Find and accept blood donation requests</p>
        </Link>
      </div>

      {/* User's accepted donations section */}
      <div className="mb-8">
        <UserDashboard />
      </div>

      <div className="bg-blue-50 p-6 rounded-lg shadow border border-blue-100">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">Need Help?</h2>
        <p className="text-blue-700">
          Have questions about blood donations or how to use our services? Contact our support team at
          <a href="mailto:support@emcon.com" className="font-semibold underline ml-1">support@emcon.com</a>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;