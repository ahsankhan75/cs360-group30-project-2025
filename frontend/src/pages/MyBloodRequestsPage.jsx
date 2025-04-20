import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { api } from '../utils/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const MyBloodRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchMyBloodRequests = async () => {
      if (!user) return;

      try {
        setLoading(true);
        // Use the API method to get only accepted requests for this user
        const data = await api.getAcceptedBloodRequests();
        setRequests(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching accepted blood requests:', err);
        setError('Could not load your blood donation commitments');
        toast.error('Failed to load your blood donation commitments');
      } finally {
        setLoading(false);
      }
    };

    fetchMyBloodRequests();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Blood Donation Commitments</h1>
        <p className="text-gray-600 mb-4">
          Below are the blood donation requests you have committed to help with. Thank you for your generosity!
        </p>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-700">
            <p>{error}</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-700 mb-4">You haven't committed to any blood donation requests yet.</p>
            <Link 
              to="/blood-requests" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
            >
              Browse Available Requests
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div 
                key={request._id || request.requestId} 
                className="bg-white p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full mb-2">
                      {request.bloodType}
                    </span>
                    <h3 className="font-medium text-gray-800">{request.hospitalName}</h3>
                    <p className="text-sm text-gray-600 mt-1">{request.location}</p>
                    <div className="mt-2 flex items-center">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs mr-2">
                        Accepted
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(request.datePosted).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link 
                    to={`/blood-requests/${request.requestId}`}
                    className="px-3 py-1 bg-teal-600 text-white text-sm font-medium rounded hover:bg-teal-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">About Blood Donation</h2>
        <p className="text-gray-600 mb-4">
          Blood donation is a vital community service that helps save lives. When you commit to a blood request, 
          you're agreeing to contact the requesting hospital and arrange a time to donate.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-2">Donation Process</h3>
            <p className="text-sm text-gray-600">
              The actual donation usually takes 8-10 minutes, though you should plan to spend about an hour at the blood center.
            </p>
          </div>
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-2">Preparation Tips</h3>
            <p className="text-sm text-gray-600">
              Eat well, stay hydrated, and get a good night's sleep before your donation appointment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBloodRequestsPage;