import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { toast } from 'react-toastify';

const UserDashboard = () => {
  const [userRequests, setUserRequests] = useState([]);
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
          if (response.status === 404) {
            // Handle 404 specifically - might mean the endpoint is wrong or not implemented
            console.error('The /api/blood-requests/mine endpoint was not found');
            toast.error('Could not load your requests. The API endpoint may not be implemented.');
          } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
        } else {
          const data = await response.json();
          setUserRequests(data);
        }
      } catch (error) {
        console.error('Error fetching user requests:', error);
        toast.error('Failed to load your blood donation requests');
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

  if (userRequests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">My Blood Donation Requests</h2>
        <p className="text-gray-600">You haven't made any blood donation requests yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">My Blood Donation Requests</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userRequests.map((request) => (
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
                <td className="px-6 py-4 whitespace-nowrap">{request.unitsNeeded}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    request.accepted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {request.accepted ? 'Accepted' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(request.datePosted).toLocaleDateString()}
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
