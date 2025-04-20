import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { api } from '../utils/api';
import { toast } from 'react-toastify';

const UserBloodRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchAcceptedBloodRequests = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Use the appropriate API method to get only accepted requests
        const data = await api.getAcceptedBloodRequests();
        setRequests(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching accepted blood requests:', err);
        setError('Could not load your accepted blood requests');
        toast.error('Failed to load your accepted blood requests');
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedBloodRequests();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">My Blood Donation Commitments</h3>
        <p className="text-gray-600">
          You haven't accepted any blood donation requests yet. 
          <Link to="/blood-requests" className="text-teal-600 hover:underline ml-1">
            Browse available requests
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">My Blood Donation Commitments</h3>
      <div className="space-y-4">
        {requests.map((request) => (
          <div 
            key={request._id} 
            className="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full mb-2">
                  {request.bloodType}
                </span>
                <h4 className="font-medium">{request.hospitalName}</h4>
                <p className="text-sm text-gray-600 mt-1">{request.location}</p>
                <div className="mt-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Accepted
                  </span>
                </div>
              </div>
              <Link 
                to={`/blood-requests/${request._id}`}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Link 
          to="/blood-requests" 
          className="text-teal-600 hover:underline text-sm"
        >
          Browse more blood donation requests
        </Link>
      </div>
    </div>
  );
};

export default UserBloodRequests;
