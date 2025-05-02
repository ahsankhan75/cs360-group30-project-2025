import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchUserRequests = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/blood-requests/mine', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error('Error fetching user requests:', error);
        toast.error('Failed to load your blood donation requests');
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRequests();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">My Blood Donations</h2>
        <p className="text-gray-600">You haven't accepted any donation requests yet.</p>
        <Link to="/blood-requests" className="inline-block mt-4 text-teal-600 hover:underline">
          Find donation opportunities
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">My Blood Donations</h2>
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.requestId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{request.hospitalName}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${request.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                  request.urgencyLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                  {request.urgencyLevel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Blood Type:</span>
                  <span className="ml-2 font-medium">{request.bloodType}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date:</span>
                  <span className="ml-2 font-medium">
                    {new Date(request.acceptedAt || request.datePosted).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${request.hospitalApproved === 'approved' ? 'bg-green-100 text-green-800' :
                  request.hospitalApproved === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                  {request.hospitalApproved === 'approved' ? 'Accepted' :
                    request.hospitalApproved === 'rejected' ? 'Rejected' :
                      'Pending Approval'}
                </span>
                <Link
                  to={`/blood-requests/${request.requestId}`}
                  className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
