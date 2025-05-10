import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminHeader from '../../components/Admin/AdminHeader';

const AdminBloodRequestDetailPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { admin } = useAdminAuthContext();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!admin) {
        navigate('/admin/login');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/blood-requests/${requestId}`, {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch blood request details');
        }

        const data = await response.json();
        setRequest(data);
      } catch (err) {
        console.error('Error fetching request details:', err);
        setError(err.message);
        toast.error('Failed to load blood request details');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [admin, requestId, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blood request?')) {
      return;
    }

    try {
      const response = await fetch(`/api/blood-requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${admin.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete blood request');
      }

      toast.success('Blood request deleted successfully');
      navigate('/admin/blood-requests');
    } catch (err) {
      console.error('Error deleting request:', err);
      toast.error('Failed to delete blood request');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Blood Request Details" />
          <main className="flex-1 overflow-auto p-6">
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Blood Request Details" />
          <main className="flex-1 overflow-auto p-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader title="Blood Request Details" />
          <main className="flex-1 overflow-auto p-6">
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Blood Request Not Found</h3>
              <p className="text-gray-500 mb-4">The blood request you're looking for doesn't exist or has been removed.</p>
              <Link
                to="/admin/blood-requests"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
              >
                Back to Blood Requests
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader title="Blood Request Details" />

        <main className="flex-1 overflow-auto p-6">
          <div className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Blood Request Details</h1>
              <Link
                to="/admin/blood-requests"
                className="text-teal-600 hover:text-teal-800 flex items-center text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Blood Requests
              </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Request Information
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Details about the blood request
                </p>
              </div>

              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Hospital</dt>
                    <dd className="mt-1 text-sm text-gray-900">{request.hospitalName}</dd>
                  </div>

                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Blood Type</dt>
                    <dd className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {request.bloodType}
                      </span>
                    </dd>
                  </div>

                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Urgency Level</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                        request.urgencyLevel === 'Urgent' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {request.urgencyLevel}
                      </span>
                    </dd>
                  </div>

                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Units Needed</dt>
                    <dd className="mt-1 text-sm text-gray-900">{request.unitsNeeded}</dd>
                  </div>

                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">{request.location}</dd>
                  </div>

                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.accepted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {request.accepted ? 'Accepted' : 'Pending'}
                      </span>
                    </dd>
                  </div>

                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
                    <dd className="mt-1 text-sm text-gray-900">{request.contactNumber || 'Not provided'}</dd>
                  </div>

                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{request.email}</dd>
                  </div>

                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Additional Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900">{request.notes || 'No additional notes'}</dd>
                  </div>

                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Date Posted</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(request.datePosted).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  onClick={handleDelete}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Request
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminBloodRequestDetailPage; 