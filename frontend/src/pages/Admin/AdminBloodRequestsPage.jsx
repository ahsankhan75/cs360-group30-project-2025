import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext';
import { toast } from 'react-toastify';

const AdminBloodRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const { admin } = useAdminAuthContext();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!admin) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch blood requests
        const requestsResponse = await fetch('/api/blood-requests', {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        
        if (!requestsResponse.ok) {
          throw new Error('Failed to fetch blood requests');
        }
        
        const requestsData = await requestsResponse.json();
        
        // Fetch hospitals for dropdown
        const hospitalsResponse = await fetch('/api/hospitals/names', {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        
        if (!hospitalsResponse.ok) {
          throw new Error('Failed to fetch hospitals');
        }
        
        const hospitalsData = await hospitalsResponse.json();
        
        setRequests(requestsData);
        setHospitals(hospitalsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [admin]);

  const handleDeleteRequest = async (requestId) => {
    if (!admin) return;
    
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
        throw new Error('Failed to delete request');
      }

      // Remove from state
      setRequests(requests.filter(req => req.requestId !== requestId));
      toast.success('Blood request deleted successfully');
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete blood request');
    }
  };

  const filteredRequests = requests.filter(req => {
    const searchLower = searchTerm.toLowerCase();
    return (
      req.hospitalName.toLowerCase().includes(searchLower) ||
      req.bloodType.toLowerCase().includes(searchLower) ||
      req.location.toLowerCase().includes(searchLower) ||
      req.urgencyLevel.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Blood Requests</h1>
        <Link 
          to="/admin/add-blood-request" 
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md"
        >
          Create New Request
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">All Blood Requests</h2>
          <input
            type="text"
            placeholder="Search requests..."
            className="border rounded-md px-4 py-2 w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
            <p className="mt-2 text-gray-600">Loading blood requests...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <tr key={request.requestId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{request.hospitalName}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{request.bloodType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-800' : 
                          request.urgencyLevel === 'High' ? 'bg-orange-100 text-orange-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {request.urgencyLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{request.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(request.datePosted).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.accepted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {request.accepted ? 'Accepted' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDeleteRequest(request.requestId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No blood requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBloodRequestsPage;
