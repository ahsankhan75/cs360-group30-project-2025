import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminHeader from '../../components/Admin/AdminHeader';

const AdminBloodRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const { admin } = useAdminAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    urgency: '',
    bloodType: '',
    status: ''
  });

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
        setError(error.message);
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      urgency: '',
      bloodType: '',
      status: ''
    });
    setSearchTerm('');
  };

  const filteredRequests = requests.filter(req => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      req.hospitalName?.toLowerCase().includes(searchLower) ||
      req.bloodType?.toLowerCase().includes(searchLower) ||
      req.location?.toLowerCase().includes(searchLower) ||
      req.urgencyLevel?.toLowerCase().includes(searchLower) ||
      req.requestId?.toLowerCase().includes(searchLower);

    const matchesUrgency = filters.urgency === '' || req.urgencyLevel === filters.urgency;
    const matchesBloodType = filters.bloodType === '' || req.bloodType === filters.bloodType;
    const matchesStatus = filters.status === '' ||
      (filters.status === 'accepted' && req.accepted) ||
      (filters.status === 'pending' && !req.accepted);

    return matchesSearch && matchesUrgency && matchesBloodType && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Blood Requests Management" />

        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 sm:mb-4 md:mb-6 lg:mb-8 gap-2 sm:gap-3 md:gap-4">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Manage Blood Requests</h1>


            </div>

            {error && (
              <div className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 bg-red-50 border-l-4 border-red-500 p-2 sm:p-3 md:p-4 lg:p-5 rounded-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-2 sm:ml-3 md:ml-4">
                    <p className="text-xs sm:text-sm md:text-base text-red-700">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base font-medium text-red-700 hover:text-red-600"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 lg:mb-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 sm:mb-4 md:mb-6 lg:mb-8 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-700">Blood Requests</h2>

                <div className="w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Search by hospital, blood type, location..."
                    className="w-full md:w-60 lg:w-80 xl:w-96 border rounded-md text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 lg:py-2.5"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-3 sm:mb-4 md:mb-6 lg:mb-8 bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-5 rounded-md">
                <div className="w-[calc(50%-0.5rem)] sm:w-auto">
                  <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-0.5 sm:mb-1 md:mb-2">Urgency Level</label>
                  <select
                    name="urgency"
                    value={filters.urgency}
                    onChange={handleFilterChange}
                    className="w-full sm:w-auto border rounded-md px-1.5 sm:px-2 md:px-3 lg:px-4 py-1 sm:py-1.5 md:py-2 lg:py-2.5 text-xs sm:text-sm md:text-base"
                  >
                    <option value="">All</option>
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="w-[calc(50%-0.5rem)] sm:w-auto">
                  <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-0.5 sm:mb-1 md:mb-2">Blood Type</label>
                  <select
                    name="bloodType"
                    value={filters.bloodType}
                    onChange={handleFilterChange}
                    className="w-full sm:w-auto border rounded-md px-1.5 sm:px-2 md:px-3 lg:px-4 py-1 sm:py-1.5 md:py-2 lg:py-2.5 text-xs sm:text-sm md:text-base"
                  >
                    <option value="">All</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="w-[calc(50%-0.5rem)] sm:w-auto">
                  <label className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-0.5 sm:mb-1 md:mb-2">Status</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full sm:w-auto border rounded-md px-1.5 sm:px-2 md:px-3 lg:px-4 py-1 sm:py-1.5 md:py-2 lg:py-2.5 text-xs sm:text-sm md:text-base"
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                  </select>
                </div>
                <div className="w-[calc(50%-0.5rem)] sm:w-auto flex items-end">
                  <button
                    onClick={resetFilters}
                    className="w-full sm:w-auto text-teal-600 hover:text-teal-800 px-1.5 sm:px-2 md:px-3 lg:px-4 py-1 sm:py-1.5 md:py-2 lg:py-2.5 text-xs sm:text-sm md:text-base flex items-center justify-center sm:justify-start border border-teal-600 rounded-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-0.5 sm:mr-1 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-4 sm:py-6 md:py-8 lg:py-10">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 border-t-2 border-b-2 border-teal-600"></div>
                  <p className="mt-1 sm:mt-2 md:mt-3 text-xs sm:text-sm md:text-base lg:text-lg text-gray-600">Loading blood requests...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto responsive-table-container">
                    {filteredRequests.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 text-left text-xs sm:text-sm md:text-base font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                            <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 text-left text-xs sm:text-sm md:text-base font-medium text-gray-500 uppercase tracking-wider">Blood</th>
                            <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 text-left text-xs sm:text-sm md:text-base font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                            <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 text-left text-xs sm:text-sm md:text-base font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 text-left text-xs sm:text-sm md:text-base font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 text-center text-xs sm:text-sm md:text-base font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredRequests.map((request) => (
                            <tr key={request.requestId} className="hover:bg-gray-50">
                              <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 lg:py-5 w-1/6">
                                <div className="text-xs sm:text-sm md:text-base font-medium text-gray-900 truncate" title={request.hospitalName}>
                                  {request.hospitalName}
                                </div>
                              </td>
                              <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 lg:py-5 w-1/12">
                                <span className="inline-flex items-center px-1.5 sm:px-2 md:px-2.5 lg:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800">
                                  {request.bloodType}
                                </span>
                              </td>
                              <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 lg:py-5 w-1/12">
                                <span className={`px-1.5 sm:px-2 md:px-3 lg:px-4 py-0.5 sm:py-1 md:py-1.5 inline-flex text-xs sm:text-sm leading-5 font-semibold rounded-full ${
                                  request.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                                  request.urgencyLevel === 'Urgent' ? 'bg-orange-100 text-orange-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {request.urgencyLevel}
                                </span>
                              </td>
                              <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 lg:py-5 whitespace-nowrap text-xs sm:text-sm md:text-base text-gray-500">
                                {new Date(request.datePosted).toLocaleDateString()}
                              </td>
                              <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 lg:py-5">
                                <span className={`px-1.5 sm:px-2 md:px-3 lg:px-4 py-0.5 sm:py-1 md:py-1.5 inline-flex text-xs sm:text-sm leading-5 font-semibold rounded-full ${
                                  request.accepted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {request.accepted ? 'Accepted' : 'Pending'}
                                </span>
                              </td>
                              <td className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 lg:py-5 text-center text-xs sm:text-sm md:text-base font-medium">
                                <div className="flex justify-center space-x-1 sm:space-x-2 md:space-x-3">
                                  <Link
                                    to={`/admin/blood-requests/${request.requestId}`}
                                    className="text-teal-600 hover:text-teal-900"
                                    title="View Details"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                  </Link>
                                  <button
                                    onClick={() => handleDeleteRequest(request.requestId)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-4 sm:py-6 md:py-8 lg:py-10 bg-gray-50 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-16 lg:w-16 mx-auto text-gray-400 mb-2 sm:mb-3 md:mb-4 lg:mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-gray-900 mb-1 sm:mb-2 md:mb-3">No blood requests found</h3>
                        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-500 mb-2 sm:mb-3 md:mb-4 lg:mb-5">
                          {searchTerm || filters.urgency || filters.bloodType || filters.status
                            ? 'Try adjusting your search or filters'
                            : 'No blood requests found in the system'}
                        </p>
                      </div>
                    )}
                  </div>

                  {filteredRequests.length > 0 && (
                    <div className="mt-2 sm:mt-3 md:mt-4 lg:mt-6 text-xs sm:text-sm md:text-base text-gray-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                      <span>Showing {filteredRequests.length} of {requests.length} blood requests</span>

                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminBloodRequestsPage;
