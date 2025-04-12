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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Accepted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {acceptedRequests.map((request) => (
              <tr key={request.requestId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{request.hospitalName}</td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{request.bloodType}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    request.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                    request.urgencyLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {request.urgencyLevel}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(request.acceptedAt || request.datePosted).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Accepted
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDashboard;
