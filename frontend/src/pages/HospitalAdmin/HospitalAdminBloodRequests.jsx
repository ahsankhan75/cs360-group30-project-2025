import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospitalAdminAuthContext } from '../../hooks/useHospitalAdminAuthContext';
import HospitalAdminNavbar from '../../components/HospitalAdmin/HospitalAdminNavbar';
import PendingBloodAcceptances from '../../components/HospitalAdmin/PendingBloodAcceptances';
import { toast } from 'react-toastify';

const BloodTypeFilter = ({ selectedBloodType, onChange }) => {
  const bloodTypes = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="mb-2 sm:mb-3">
      <label htmlFor="bloodType" className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
        Blood Type
      </label>
      <select
        id="bloodType"
        value={selectedBloodType || ''}
        onChange={(e) => onChange(e.target.value === '' ? '' : e.target.value)}
        className="w-full p-1 sm:p-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
      >
        {bloodTypes.map((type) => (
          <option key={type} value={type === 'All' ? '' : type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
};



const StatusFilter = ({ selectedStatus, onChange }) => {
  const statuses = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' }
  ];

  return (
    <div className="mb-2 sm:mb-3">
      <label htmlFor="status" className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
        Status
      </label>
      <select
        id="status"
        value={selectedStatus || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-1 sm:p-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
      >
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const HospitalAdminBloodRequests = () => {
  const { hospitalAdmin } = useHospitalAdminAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [bloodType, setBloodType] = useState('');
  const [status, setStatus] = useState('');
  const [formData, setFormData] = useState({
    bloodType: 'A+',
    urgencyLevel: 'Normal',
    unitsNeeded: 1,
    contactNumber: '',
    contactEmail: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showMedicalCard, setShowMedicalCard] = useState(null);
  const [medicalCard, setMedicalCard] = useState(null);
  const [loadingMedicalCard, setLoadingMedicalCard] = useState(false);
  const [medicalCardError, setMedicalCardError] = useState(null);

  const navigate = useNavigate();

  // Add state for retry functionality
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!hospitalAdmin) {
      navigate('/hospital-admin/login');
      return;
    }

    fetchBloodRequests();

    // Cleanup function
    return () => {
      // Nothing to clean up here since timeouts are handled in fetchBloodRequests
    };
  }, [hospitalAdmin, navigate, bloodType, status, retryCount]); // Added retryCount to dependencies



  const fetchBloodRequests = async () => {
    // Create an AbortController to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      setLoading(true);
      let url = `/api/hospital-admin/blood-requests`;
      const queryParams = [];

      if (bloodType) queryParams.push(`bloodType=${bloodType}`);
      if (status) queryParams.push(`status=${status}`);

      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      console.log('Fetching blood requests from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${hospitalAdmin.token}`,
          'Cache-Control': 'no-cache',
          'Accept': 'application/json'
        },
        signal: controller.signal // Add the abort signal
      });

      // Clear the timeout since the request completed
      clearTimeout(timeoutId);

      // Handle HTTP status codes
      if (response.status === 408) {
        throw new Error('Request timed out. Please try again later.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch blood requests');
      }

      console.log('Received blood requests:', data.length);
      setBloodRequests(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching blood requests:', err);

      // Handle abort/timeout errors specifically
      if (err.name === 'AbortError') {
        setError('Request timed out. Please refresh the page or try again later.');
      } else {
        setError(err.message || 'Failed to load blood requests. Please try again later.');
      }

      toast.error('Error loading blood requests');
    } finally {
      setLoading(false);
      clearTimeout(timeoutId); // Ensure timeout is cleared in all cases
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();

    try {
      setIsCreating(true);
      setError(null);

      // Validate form data
      if (!formData.bloodType) {
        throw new Error('Blood type is required');
      }

      if (formData.unitsNeeded < 1) {
        throw new Error('Units needed must be at least 1');
      }

      // Create request payload with proper data types
      const requestPayload = {
        ...formData,
        unitsNeeded: parseInt(formData.unitsNeeded, 10)
      };

      console.log('Sending blood request data:', JSON.stringify(requestPayload));

      try {
        const response = await fetch('/api/hospital-admin/blood-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${hospitalAdmin.token}`
          },
          body: JSON.stringify(requestPayload)
        });

        let responseData;
        try {
          responseData = await response.json();
        } catch (jsonError) {
          console.error('Error parsing response JSON:', jsonError);
          throw new Error('Invalid response from server');
        }

        if (!response.ok) {
          throw new Error(responseData.error || 'Failed to create blood request');
        }

        console.log('Created blood request:', responseData);

        // Reset form and show success message
        setFormData({
          bloodType: 'A+',
          urgencyLevel: 'Normal',
          unitsNeeded: 1,
          contactNumber: '',
          contactEmail: ''
        });
        setShowCreateForm(false);
        toast.success('Blood request created successfully');

        // Refresh the blood requests list
        await fetchBloodRequests();
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        throw new Error(fetchError.message || 'Network error while creating blood request');
      }
    } catch (err) {
      console.error('Error creating blood request:', err);
      setError(err.message || 'Failed to create blood request');
      toast.error(err.message || 'Failed to create blood request');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApproveRequest = async (requestId) => {
    try {
      setProcessingRequestId(requestId);

      const response = await fetch(`/api/hospital-admin/blood-requests/${requestId}/user-acceptance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hospitalAdmin.token}`
        },
        body: JSON.stringify({ action: 'approve' })
      });

      if (!response.ok) {
        throw new Error('Failed to approve acceptance');
      }

      await response.json(); // Read the response but we don't need to use it

      // Update the request in the list
      setBloodRequests(bloodRequests.map(req =>
        req.requestId === requestId ? { ...req, hospitalApproved: 'approved', hospitalApprovedAt: new Date() } : req
      ));

      toast.success('Blood donation acceptance approved');
    } catch (err) {
      console.error('Error approving acceptance:', err);
      toast.error('Failed to approve acceptance');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const openRejectionModal = (requestId) => {
    setSelectedRequestId(requestId);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  const handleViewMedicalCard = async (requestId) => {
    if (showMedicalCard === requestId) {
      // Toggle off if already showing
      setShowMedicalCard(null);
      setMedicalCard(null);
      setMedicalCardError(null);
      return;
    }

    try {
      setLoadingMedicalCard(true);
      setMedicalCardError(null);
      setShowMedicalCard(requestId);

      console.log(`Fetching medical card for request ${requestId}`);
      const response = await fetch(`/api/hospital-admin/blood-requests/${requestId}/user-medical-card`, {
        headers: {
          'Authorization': `Bearer ${hospitalAdmin.token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server error:', data.error);
        throw new Error(data.error || 'Failed to fetch medical card');
      }

      console.log('Medical card data received:', data);
      setMedicalCard(data);
    } catch (err) {
      console.error('Error fetching medical card:', err);
      setMedicalCardError(err.message || 'Failed to load medical card');
      toast.error(err.message || 'Failed to load medical card');
      // Don't hide the medical card section so we can show the error
    } finally {
      setLoadingMedicalCard(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequestId) return;

    try {
      setProcessingRequestId(selectedRequestId);

      const response = await fetch(`/api/hospital-admin/blood-requests/${selectedRequestId}/user-acceptance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hospitalAdmin.token}`
        },
        body: JSON.stringify({
          action: 'reject',
          rejectionReason: rejectionReason || 'No reason provided'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject acceptance');
      }

      await response.json(); // Read the response but we don't need to use it

      // Update the request in the list
      setBloodRequests(bloodRequests.map(req =>
        req.requestId === selectedRequestId ?
          { ...req, hospitalApproved: 'rejected', hospitalRejectionReason: rejectionReason, hospitalApprovedAt: new Date() } :
          req
      ));

      toast.success('Blood donation acceptance rejected');
      setShowRejectionModal(false);
    } catch (err) {
      console.error('Error rejecting acceptance:', err);
      toast.error('Failed to reject acceptance');
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (loading) {
    return (
      <div>
        <HospitalAdminNavbar />
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-16 sm:w-16 border-t-4 border-teal-500 border-solid mb-2 sm:mb-4"></div>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">Loading blood requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HospitalAdminNavbar />

      <div className="py-2 sm:py-3 md:py-4 lg:py-6 px-2 sm:px-3 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header with Create Request Button */}
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-3 sm:mb-4 md:mb-6">
          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 xs:mb-0">
            Blood Donation Requests
          </h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-2 py-1 xs:px-3 xs:py-1.5 text-xs md:text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors shadow-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 xs:h-4 xs:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Request
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 text-red-700 p-2 sm:p-3 rounded-md mb-3 sm:mb-4 text-xs sm:text-sm">
            <div className="font-medium">Error</div>
            <div>{error}</div>
          </div>
        )}

        {/* Create Request Form - Responsive adjustments */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md mb-3 sm:mb-4 md:mb-6 overflow-hidden">
            <div className="p-2 sm:p-3 md:p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm sm:text-base md:text-lg font-medium text-gray-800">Create Blood Request</h2>
            </div>
            <form onSubmit={handleCreateRequest} className="p-2 sm:p-3 md:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <div>
                  <label htmlFor="bloodType" className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
                    Blood Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    required
                    className="w-full p-1 sm:p-1.5 md:p-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
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

                <div>
                  <label htmlFor="urgencyLevel" className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
                    Urgency Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="urgencyLevel"
                    name="urgencyLevel"
                    value={formData.urgencyLevel}
                    onChange={handleInputChange}
                    required
                    className="w-full p-1 sm:p-1.5 md:p-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="unitsNeeded" className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
                    Units Needed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="unitsNeeded"
                    name="unitsNeeded"
                    value={formData.unitsNeeded}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full p-1 sm:p-1.5 md:p-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label htmlFor="contactNumber" className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="w-full p-1 sm:p-1.5 md:p-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Optional"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="contactEmail" className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5 sm:mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="w-full p-1 sm:p-1.5 md:p-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Optional - defaults to hospital admin email"
                  />
                </div>
              </div>

              <div className="mt-3 sm:mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setError(null);
                  }}
                  className="mr-2 px-2 py-1 sm:px-3 sm:py-1.5 text-xs md:text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs md:text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 md:gap-6">
          <div className="lg:col-span-3 xl:col-span-2">
            <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md">
              <h2 className="text-sm md:text-base lg:text-lg font-medium text-gray-800 mb-2 sm:mb-3">Filters</h2>

              <BloodTypeFilter
                selectedBloodType={bloodType}
                onChange={setBloodType}
              />

              <StatusFilter
                selectedStatus={status}
                onChange={setStatus}
              />

              <button
                onClick={() => {
                  setBloodType('');
                  setStatus('');
                  // Trigger a refetch after clearing filters
                  setRetryCount(prev => prev + 1);
                }}
                className="w-full mt-1 sm:mt-2 px-2 py-1 sm:px-3 sm:py-1.5 text-xs md:text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="lg:col-span-9 xl:col-span-10">
            {/* Pending Blood Acceptances Section */}
            <div className="mb-2 sm:mb-4">
              <PendingBloodAcceptances
                bloodTypeFilter={bloodType}
                statusFilter={status}
              />
            </div>

            {/* Blood Requests Section */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200">
                <h2 className="text-sm md:text-base lg:text-lg font-medium text-gray-800">Blood Requests</h2>
                {bloodRequests.length === 0 && !loading && (
                  <p className="text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm">No blood requests found.</p>
                )}
              </div>

              {loading ? (
                <div className="p-4 sm:p-6 flex justify-center">
                  <div className="animate-spin h-6 w-6 sm:h-8 sm:w-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
                </div>
              ) : bloodRequests.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {bloodRequests.map((request) => {
                    // Format dates
                    const postedDate = new Date(request.datePosted);
                    const expiryDate = request.expiryDate ? new Date(request.expiryDate) : null;
                    const isExpired = expiryDate && expiryDate < new Date();

                    return (
                      <li key={request._id || request.requestId} className="p-2 sm:p-3 md:p-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between">
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-1 sm:gap-1.5 items-center">
                              <span className="text-sm sm:text-base font-medium text-gray-900">
                                Blood Type: {request.bloodType}
                              </span>
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${request.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                                    request.urgencyLevel === 'Urgent' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                  }`}
                              >
                                {request.urgencyLevel}
                              </span>

                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${request.userAccepted && request.hospitalApproved === 'approved' ? 'bg-green-100 text-green-800' :
                                    request.userAccepted && request.hospitalApproved === 'rejected' ? 'bg-red-100 text-red-800' :
                                      request.userAccepted ? 'bg-yellow-100 text-yellow-800' :
                                        isExpired ? 'bg-red-100 text-red-800' :
                                          'bg-blue-100 text-blue-800'
                                  }`}
                              >
                                {request.userAccepted && request.hospitalApproved === 'approved' ? 'Accepted' :
                                  request.userAccepted && request.hospitalApproved === 'rejected' ? 'Rejected' :
                                    request.userAccepted ? 'Pending Approval' :
                                      isExpired ? 'Expired' : 'Available'}
                              </span>
                            </div>

                            <div className="mt-1 sm:mt-2 grid grid-cols-1 sm:grid-cols-2 gap-0.5 sm:gap-1 text-xs md:text-sm">
                              <p className="text-gray-500">
                                <span className="font-medium">Posted:</span> {postedDate.toLocaleDateString()} {postedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {expiryDate && (
                                <p className="text-gray-500">
                                  <span className="font-medium">Expires:</span> {expiryDate.toLocaleDateString()}
                                </p>
                              )}
                              <p className="text-gray-500">
                                <span className="font-medium">Units Needed:</span> {request.unitsNeeded}
                              </p>
                              <p className="text-gray-500">
                                <span className="font-medium">Location:</span> {request.location || 'Not specified'}
                              </p>
                              <p className="text-gray-500 md:col-span-2">
                                <span className="font-medium">Contact:</span> {request.contactNumber || 'N/A'} | {request.email}
                              </p>
                              {request.userAccepted && (
                                <div className="mt-0.5 sm:mt-1 md:col-span-2">
                                  <div className="flex items-center mb-0.5">
                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${request.hospitalApproved === 'approved' ? 'bg-green-100 text-green-800' : request.hospitalApproved === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                      {request.hospitalApproved === 'approved' ? 'Accepted' :
                                        request.hospitalApproved === 'rejected' ? 'Rejected' :
                                          'Pending approval'}
                                    </span>
                                  </div>
                                  <p className="text-xs">
                                    <span className="font-medium">Donor:</span> <strong>{request.acceptedByName || (request.acceptedBy && (request.acceptedBy.fullName || request.acceptedBy.email)) || 'Unknown'}</strong>
                                  </p>
                                  <p className="text-xs">
                                    <span className="font-medium">Accepted on:</span> {new Date(request.acceptedAt).toLocaleDateString()}
                                  </p>
                                  {request.hospitalApproved !== 'pending' && (
                                    <p className="text-xs">
                                      <span className="font-medium">{request.hospitalApproved === 'approved' ? 'Approved' : 'Rejected'} on:</span> {new Date(request.hospitalApprovedAt).toLocaleDateString()}
                                    </p>
                                  )}
                                  {request.hospitalApproved === 'rejected' && request.hospitalRejectionReason && (
                                    <p className="text-xs text-red-600">
                                      <span className="font-medium">Reason:</span> {request.hospitalRejectionReason}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            {/* Action buttons for pending requests - Smaller for mobile */}
                            {request.userAccepted && (
                              <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1 sm:gap-1.5">
                                <button
                                  onClick={() => handleViewMedicalCard(request.requestId)}
                                  className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs rounded flex items-center ${showMedicalCard === request.requestId ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                                >
                                  {showMedicalCard === request.requestId ? (
                                    <>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                      Hide Card
                                    </>
                                  ) : (
                                    <>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                                      </svg>
                                      View Card
                                    </>
                                  )}
                                </button>

                                {request.hospitalApproved === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveRequest(request.requestId)}
                                      disabled={processingRequestId === request.requestId}
                                      className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:bg-gray-400 flex items-center"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      {processingRequestId === request.requestId ? 'Processing...' : 'Approve'}
                                    </button>
                                    <button
                                      onClick={() => openRejectionModal(request.requestId)}
                                      disabled={processingRequestId === request.requestId}
                                      className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 disabled:bg-gray-400 flex items-center"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Medical Card Display - Smaller for mobile */}
                        {showMedicalCard === request.requestId && (
                          <div className="mt-2 sm:mt-3 p-2 sm:p-3 border border-blue-200 rounded-md bg-blue-50 text-xs">
                            <h5 className="font-medium text-blue-800 mb-1 sm:mb-2">Medical Card</h5>
                            
                            {/* Medical card content */}
                            {loadingMedicalCard ? (
                              <div className="flex justify-center items-center h-10 sm:h-16">
                                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-blue-500"></div>
                              </div>
                            ) : medicalCardError ? (
                              // Error display
                              <div className="p-2 sm:p-3 bg-red-50 text-red-700 rounded-md">
                                <p className="font-medium">Error loading medical card:</p>
                                <p>{medicalCardError}</p>
                                <button
                                  onClick={() => handleViewMedicalCard(request.requestId)}
                                  className="mt-1 sm:mt-2 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                >
                                  Try Again
                                </button>
                              </div>
                            ) : medicalCard ? (
                              // Medical card data
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-2">
                                {/* User info section */}
                                <div className="md:col-span-2 p-1.5 sm:p-2 bg-blue-50 rounded-md mb-1 sm:mb-2">
                                  <div className="flex items-center">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-1.5 sm:mr-2">
                                      {medicalCard.name ? medicalCard.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                      <h3 className="text-xs sm:text-sm font-semibold">{medicalCard.name || medicalCard.email}</h3>
                                      <p className="text-xs text-gray-600">{medicalCard.email}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Medical sections */}
                                <div className="md:col-span-2 mb-1 sm:mb-2">
                                  <h4 className="font-medium text-blue-800 mb-0.5 sm:mb-1 text-xs">Medical Information</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 sm:gap-1 bg-white bg-opacity-50 p-1.5 sm:p-2 rounded-md">
                                    <p className="text-xs"><strong>Blood Type:</strong> {medicalCard.bloodType || 'Not specified'}</p>
                                    <p className="text-xs"><strong>Organ Donor:</strong> {medicalCard.organDonor ? 'Yes' : 'No'}</p>
                                    <p className="text-xs"><strong>Age:</strong> {medicalCard.age || 'Not specified'}</p>
                                    <p className="text-xs"><strong>Gender:</strong> {medicalCard.gender || 'Not specified'}</p>
                                  </div>
                                </div>

                                {/* Additional medical info with toggleable sections */}
                                <div className="md:col-span-2">
                                  <h4 className="font-medium text-blue-800 mb-0.5 sm:mb-1 text-xs">Medical Details</h4>
                                  <div className="bg-white bg-opacity-50 p-1.5 sm:p-2 rounded-md">
                                    <p className="text-xs mb-0.5"><strong>Allergies:</strong> {medicalCard.allergies || 'None'}</p>
                                    <p className="text-xs mb-0.5"><strong>Current Medications:</strong> {medicalCard.currentMedications || 'None'}</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-700">No medical card information available.</p>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-3 sm:p-4 text-center">
                  <p className="text-gray-500 text-xs sm:text-sm">No blood requests found with the current filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal - Responsive version */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-0">
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3">Reject Blood Donation</h3>
            <p className="mb-2 sm:mb-3 text-xs sm:text-sm text-gray-700">Please provide a reason for rejecting this blood donation acceptance:</p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-1.5 sm:p-2 border border-gray-300 rounded mb-2 sm:mb-3 text-xs sm:text-sm"
              rows="3"
              placeholder="Reason for rejection (optional)"
            ></textarea>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs md:text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectRequest}
                className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs md:text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalAdminBloodRequests;