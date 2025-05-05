import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuthContext } from '../hooks/useAdminAuthContext';
import { toast } from 'react-toastify';
import AdminSidebar from '../components/Admin/AdminSidebar';
import AdminHeader from '../components/Admin/AdminHeader';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      userCount: 0,
      hospitalCount: 0,
      bloodRequestCount: 0,
      reviewCount: 0
    },
    recentActivity: {
      bloodRequests: [],
      reviews: []
    }
  });

  const { admin } = useAdminAuthContext();

  useEffect(() => {
    // Skip the initial render if admin is not available yet
    if (!admin) {
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        // Removed toast notification here to prevent unnecessary notifications
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure admin context is fully updated
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 300);

    return () => clearTimeout(timer);
  }, [admin]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading dashboard data..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  const { stats, recentActivity } = dashboardData;

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader title="Dashboard" />

        <main className="flex-1 bg-gray-100 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-5 md:mb-6 lg:mb-8">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-4 sm:mb-6 md:mb-8 lg:mb-10">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold">Total Users</h2>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-2 sm:mt-3 md:mt-4">{stats.userCount}</p>
                <Link to="/admin/users" className="text-xs sm:text-sm md:text-base text-blue-100 mt-2 sm:mt-3 md:mt-4 block hover:underline">View All Users</Link>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold">Hospitals</h2>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-2 sm:mt-3 md:mt-4">{stats.hospitalCount}</p>
                <Link to="/admin/hospitals" className="text-xs sm:text-sm md:text-base text-green-100 mt-2 sm:mt-3 md:mt-4 block hover:underline">Manage Hospitals</Link>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold">Blood Requests</h2>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-2 sm:mt-3 md:mt-4">{stats.bloodRequestCount}</p>
                <Link to="/admin/blood-requests" className="text-xs sm:text-sm md:text-base text-red-100 mt-2 sm:mt-3 md:mt-4 block hover:underline">Manage Requests</Link>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-3 sm:p-4 md:p-5 lg:p-6 shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold">Reviews</h2>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-2 sm:mt-3 md:mt-4">{stats.reviewCount}</p>
                <Link to="/admin/reviews" className="text-xs sm:text-sm md:text-base text-purple-100 mt-2 sm:mt-3 md:mt-4 block hover:underline">Manage Reviews</Link>
              </div>
            </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {/* Recent Blood Requests */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-5 lg:p-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 lg:mb-5 text-gray-800">Recent Blood Requests</h2>
              {recentActivity.bloodRequests && recentActivity.bloodRequests.length > 0 ? (
                <div className="responsive-table-container overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                        <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                        <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                        <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.bloodRequests.map((request, index) => (
                        <tr key={request._id || index} className="border-t">
                          <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm md:text-base">{request.hospitalName}</td>
                          <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm md:text-base font-medium">{request.bloodType}</td>
                          <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2">
                            <span className={`inline-block px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full ${
                              request.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                              request.urgencyLevel === 'High' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {request.urgencyLevel}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm md:text-base">{new Date(request.datePosted).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm sm:text-base md:text-lg text-gray-500">No recent blood requests found.</p>
              )}
              <Link to="/admin/blood-requests" className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base text-teal-600 hover:underline block">View All Requests</Link>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-5 lg:p-6">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-4 lg:mb-5 text-gray-800">Recent Reviews</h2>
              {recentActivity.reviews && recentActivity.reviews.length > 0 ? (
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  {recentActivity.reviews.map((review, index) => (
                    <div key={review._id || index} className="border-b pb-2 sm:pb-3 md:pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm sm:text-base md:text-lg font-medium">{review.hospitalId?.name || 'Unknown Hospital'}</h3>
                          <p className="text-xs sm:text-sm text-gray-500">By: {review.userId?.fullName || review.userId?.email || 'Anonymous'}</p>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm md:text-base mt-1 sm:mt-2">{review.comment}</p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm sm:text-base md:text-lg text-gray-500">No recent reviews found.</p>
              )}
              <Link to="/admin/reviews" className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base text-teal-600 hover:underline block">View All Reviews</Link>
            </div>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
