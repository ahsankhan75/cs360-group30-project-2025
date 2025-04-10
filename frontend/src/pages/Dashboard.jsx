import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import UserDashboard from '../components/UserDashboard';

const Dashboard = () => {
  const { user } = useAuthContext();
  
  // Extract the username from the email
  const username = user ? user.email.split('@')[0] : '';

  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-teal-600">Welcome, {username}!</h1>
        <p className="text-gray-600 mt-2">Manage your donations and medical information all in one place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Quick Access Cards */}
        <Link to="/medical-card" className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Medical Card</h2>
          <p>View and manage your digital medical card</p>
        </Link>

        <Link to="/requests" className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Blood Donations</h2>
          <p>View available blood donation requests</p>
        </Link>

        <Link to="/admin/requests" className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Create Requests</h2>
          <p>Add new blood donation requests</p>
        </Link>
      </div>

      {/* User's blood requests section */}
      <div className="mb-8">
        <UserDashboard />
      </div>

      <div className="bg-blue-50 p-6 rounded-lg shadow border border-blue-100">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">Need Help?</h2>
        <p className="text-blue-700">
          Have questions about your account or how to use our services? Contact our support team at 
          <a href="mailto:support@emcon.com" className="font-semibold underline ml-1">support@emcon.com</a>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
