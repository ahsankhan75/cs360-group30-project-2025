import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { toast } from 'react-toastify';

const UserBloodRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
            Authorization: `Bearer ${user.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch your requests');
        }

        const data = await response.json();
        setRequests(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user requests:', err);
        setError('Failed to load your donation requests');
        toast.error('Failed to load your donation requests');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRequests();
  }, [user]);

  const handleDelete = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    
    try {
      const response = await fetch(`/api/blood-requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete request');
      }

      // Remove the deleted request from state
      setRequests(requests.filter(req => req.requestId !== requestId));
      toast.success('Request deleted successfully');
    } catch (err) {
      console.error('Error deleting request:', err);
      toast.error('Error deleting request');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 p-4 rounded-md">
        <p>You haven't submitted any blood donation requests yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.requestId} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">{request.hospitalName}</td>
              <td className="px-6 py-4 whitespace-nowrap font-medium">{request.bloodType}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  request.urgencyLevel === 'High' ? 'bg-red-100 text-red-800' : 
                  request.urgencyLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {request.urgencyLevel}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{request.location}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  request.accepted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {request.accepted ? 'Accepted' : 'Pending'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleDelete(request.requestId)} 
                  className="text-red-600 hover:text-red-900"
                  title="Delete request"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserBloodRequests;
