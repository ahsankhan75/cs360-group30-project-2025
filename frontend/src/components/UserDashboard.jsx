import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchAcceptedRequests = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/blood-requests/accepted', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            console.error('The /api/blood-requests/accepted endpoint was not found');
            // Fallback to the mine endpoint if accepted isn't implemented yet
            const fallbackResponse = await fetch('/api/blood-requests/mine', {
              headers: {
                'Authorization': `Bearer ${user.token}`
              }
            });

            if (fallbackResponse.ok) {
              const data = await fallbackResponse.json();
              // Filter only accepted requests on the client side as fallback
              const acceptedData = data.filter(req => req.accepted);
              setAcceptedRequests(acceptedData);
              return;
            } else {
              throw new Error(`HTTP error with fallback! Status: ${fallbackResponse.status}`);
            }
          } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        } else {
          const data = await response.json();
          setAcceptedRequests(data);
        }
      } catch (error) {
        console.error('Error fetching accepted requests:', error);
        toast.error('Failed to load your accepted blood donations');
        setAcceptedRequests([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedRequests();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (acceptedRequests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">My Accepted Donations</h2>
        <p className="text-gray-600">You haven't accepted any donation requests yet.</p>
        <Link to="/blood-requests" className="inline-block mt-4 text-teal-600 hover:underline">
          Find donation opportunities
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">My Accepted Donations</h2>
      <div className="space-y-4">
        {acceptedRequests.map((request) => (
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
                  <span className="text-gray-500">Date Accepted:</span>
                  <span className="ml-2 font-medium">
                    {new Date(request.acceptedAt || request.datePosted).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Accepted
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
