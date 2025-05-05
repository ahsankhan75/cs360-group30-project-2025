import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminHeader from '../../components/Admin/AdminHeader';

const AdminAddUserPage = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'user'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!admin) {
      toast.error('You must be logged in as admin');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess(true);
      toast.success('User created successfully!');

      // Reset form
      setFormData({
        email: '',
        password: '',
        fullName: '',
        role: 'user'
      });

      // Navigate back to users list after a short delay
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000);

    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Create User" />

        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          <div className="w-full">
            <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Create New User</h1>
              <Link
                to="/admin/users"
                className="text-teal-600 hover:text-teal-800 flex items-center text-xs sm:text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Users
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-2 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-5">
                <p className="text-xs sm:text-sm md:text-base text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 p-2 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-5">
                <p className="text-xs sm:text-sm md:text-base text-green-700">User created successfully! Redirecting...</p>
              </div>
            )}

            <div className="bg-white shadow rounded-lg p-3 sm:p-4 md:p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2">
                  <div className="col-span-1 sm:col-span-2">
                    <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="user@example.com"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="user">User</option>
                      <option value="donor">Donor</option>
                      <option value="hospital-admin">Hospital Admin</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 sm:mt-5 md:mt-6 flex justify-end space-x-2 sm:space-x-3">
                  <Link
                    to="/admin/users"
                    className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-800 text-xs sm:text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-teal-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-0.5 mr-1.5 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      'Create User'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAddUserPage;
