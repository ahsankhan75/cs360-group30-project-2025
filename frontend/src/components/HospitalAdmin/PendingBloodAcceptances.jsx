import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useHospitalAdminAuthContext } from '../../hooks/useHospitalAdminAuthContext';
import { Link } from 'react-router-dom';

const PendingBloodAcceptances = ({ bloodTypeFilter = '', statusFilter = '' }) => {
  const [pendingAcceptances, setPendingAcceptances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [showMedicalCard, setShowMedicalCard] = useState(null);
  const [medicalCard, setMedicalCard] = useState(null);
  const [loadingMedicalCard, setLoadingMedicalCard] = useState(false);
  const [medicalCardError, setMedicalCardError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const { hospitalAdmin } = useHospitalAdminAuthContext();

  // Add state for retry functionality
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (hospitalAdmin) {
      fetchPendingAcceptances();

      // No need for additional timeout since we have one in fetchPendingAcceptances

      return () => {
        // Nothing to clean up here
      };
    }
  }, [hospitalAdmin, retryCount, bloodTypeFilter, statusFilter]); // Added filters to dependencies

  const fetchPendingAcceptances = async () => {
    if (!hospitalAdmin) {
      setLoading(false);
      return;
    }

    // Create an AbortController to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching pending acceptances with token:', hospitalAdmin.token);

      // Build the URL with query parameters for filtering
      let url = '/api/hospital-admin/blood-requests/pending-acceptances';
      const queryParams = [];

      if (bloodTypeFilter) {
        queryParams.push(`bloodType=${bloodTypeFilter}`);
      }

      if (statusFilter) {
        queryParams.push(`status=${statusFilter}`);
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      console.log('Fetching from URL:', url);

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

      if (!response.ok) {
        throw new Error('Failed to fetch pending acceptances');
      }

      const data = await response.json();
      console.log('Received pending acceptances:', data);
      setPendingAcceptances(data);
    } catch (err) {
      console.error('Error fetching pending acceptances:', err);

      // Handle abort/timeout errors specifically
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Failed to load pending acceptances. ' + err.message);
      }

      toast.error('Failed to load pending acceptances');
    } finally {
      setLoading(false);
      clearTimeout(timeoutId); // Ensure timeout is cleared in all cases
    }
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

  const handleApprove = async (requestId) => {
    try {
      setProcessingId(requestId);

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

      toast.success('Blood donation acceptance approved');
      // Remove from list
      setPendingAcceptances(pendingAcceptances.filter(req => req.requestId !== requestId));
    } catch (err) {
      console.error('Error approving acceptance:', err);
      toast.error('Failed to approve acceptance');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectionModal = (requestId) => {
    setSelectedRequestId(requestId);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  const handleReject = async () => {
    if (!selectedRequestId) return;

    try {
      setProcessingId(selectedRequestId);

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

      toast.success('Blood donation acceptance rejected');
      // Remove from list
      setPendingAcceptances(pendingAcceptances.filter(req => req.requestId !== selectedRequestId));
      setShowRejectionModal(false);
    } catch (err) {
      console.error('Error rejecting acceptance:', err);
      toast.error('Failed to reject acceptance');
    } finally {
      setProcessingId(null);
    }
  };

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
        <div className="mt-2 flex space-x-2">
          <button
            onClick={() => setRetryCount(prev => prev + 1)}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Apply client-side filtering for immediate response
  const filteredAcceptances = pendingAcceptances.filter(request => {
    // Filter by blood type if specified
    if (bloodTypeFilter && request.bloodType !== bloodTypeFilter) {
      return false;
    }

    // Status filtering is already handled on the server for pending acceptances
    // but we could add more status filters here if needed

    return true;
  });

  if (filteredAcceptances.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Pending Blood Donation Acceptances</h3>
        <p className="text-gray-600">
          {pendingAcceptances.length === 0
            ? "There are no pending blood donation acceptances at this time."
            : "No pending acceptances match the current filters."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Blood Donation Acceptances</h3>

      <div className="space-y-6">
        {filteredAcceptances.map((request) => (
          <div
            key={request.requestId}
            className="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-2">
                  <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full mr-2">
                    {request.bloodType}
                  </span>
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Pending Approval
                  </span>
                </div>

                <h4 className="font-medium">Request ID: {request.requestId}</h4>
                <p className="text-sm text-gray-600 mt-1">Units Needed: {request.unitsNeeded}</p>
                <p className="text-sm text-gray-600">Urgency: {request.urgencyLevel}</p>

                {request.acceptedBy && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <h5 className="font-medium text-blue-800 mb-2">Donor Information</h5>
                    <div className="grid grid-cols-1 gap-1">
                      <p className="text-sm text-gray-700">
                        <strong>Name:</strong> {request.acceptedByName || (request.acceptedBy && (request.acceptedBy.fullName || request.acceptedBy.email)) || 'Unknown user'}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Accepted on:</strong> {new Date(request.acceptedAt).toLocaleString()}
                      </p>
                      {request.acceptedBy.email && (
                        <p className="text-sm text-gray-700">
                          <strong>Email:</strong> {request.acceptedBy.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleViewMedicalCard(request.requestId)}
                  className={`px-3 py-2 text-white rounded hover:bg-blue-600 text-sm flex items-center ${showMedicalCard === request.requestId ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                  {showMedicalCard === request.requestId ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Hide Medical Card
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-6-8h6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                      </svg>
                      View Medical Card
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleApprove(request.requestId)}
                  disabled={processingId === request.requestId}
                  className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm disabled:bg-gray-400 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {processingId === request.requestId ? 'Processing...' : 'Approve'}
                </button>

                <button
                  onClick={() => openRejectionModal(request.requestId)}
                  disabled={processingId === request.requestId}
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:bg-gray-400 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </button>
              </div>
            </div>

            {/* Medical Card Display */}
            {showMedicalCard === request.requestId && (
              <div className="mt-4 p-4 border border-blue-200 rounded-md bg-blue-50">
                <h5 className="font-medium text-blue-800 mb-2">Medical Card</h5>

                {loadingMedicalCard ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : medicalCardError ? (
                  <div className="p-4 bg-red-50 text-red-700 rounded-md">
                    <p className="font-medium">Error loading medical card:</p>
                    <p>{medicalCardError}</p>
                    <button
                      onClick={() => handleViewMedicalCard(request.requestId)}
                      className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Try Again
                    </button>
                  </div>
                ) : medicalCard ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="md:col-span-2 p-3 bg-blue-50 rounded-md mb-3">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold mr-3">
                          {medicalCard.name ? medicalCard.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{medicalCard.name || medicalCard.email}</h3>
                          <p className="text-sm text-gray-600">{medicalCard.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 mb-3">
                      <h4 className="font-medium text-blue-800 mb-1">Medical Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 p-2 rounded-md">
                        <p className="text-sm"><strong>Blood Type:</strong> {medicalCard.bloodType || 'Not specified'}</p>
                        <p className="text-sm"><strong>Organ Donor:</strong> {medicalCard.organDonor ? 'Yes' : 'No'}</p>
                        <p className="text-sm"><strong>Age:</strong> {medicalCard.age || 'Not specified'}</p>
                        <p className="text-sm"><strong>Gender:</strong> {medicalCard.gender || 'Not specified'}</p>
                        <p className="text-sm"><strong>Date of Birth:</strong> {medicalCard.dateOfBirth ? new Date(medicalCard.dateOfBirth).toLocaleDateString() : 'Not specified'}</p>
                        <p className="text-sm"><strong>Contact:</strong> {medicalCard.userContactNumber || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="md:col-span-2 mb-3">
                      <h4 className="font-medium text-blue-800 mb-1">Medical Details</h4>
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="text-sm mb-1"><strong>Allergies:</strong> {medicalCard.allergies || 'None'}</p>
                        <p className="text-sm mb-1"><strong>Current Medications:</strong> {medicalCard.currentMedications || 'None'}</p>
                        <p className="text-sm mb-1"><strong>Medical Devices/Implants:</strong> {medicalCard.medicalDevicesImplants || 'None'}</p>
                        <p className="text-sm mb-1"><strong>Recent Surgery/Hospitalization:</strong> {medicalCard.recentSurgeryHospitalization || 'None'}</p>
                        <p className="text-sm"><strong>Dietary Restrictions:</strong> {medicalCard.dietaryRestrictions || 'None'}</p>
                      </div>
                    </div>

                    {medicalCard.primaryEmergencyContact && (
                      <div className="md:col-span-2 mb-3">
                        <h4 className="font-medium text-blue-800 mb-1">Emergency Contacts</h4>
                        <div className="bg-gray-50 p-2 rounded-md">
                          <div className="mb-2">
                            <p className="text-sm font-medium">Primary Contact:</p>
                            <p className="text-sm"><strong>Name:</strong> {medicalCard.primaryEmergencyContact.name}</p>
                            <p className="text-sm"><strong>Relationship:</strong> {medicalCard.primaryEmergencyContact.relationship}</p>
                            <p className="text-sm"><strong>Number:</strong> {medicalCard.primaryEmergencyContact.number}</p>
                          </div>

                          {medicalCard.secondaryEmergencyContact && (
                            <div>
                              <p className="text-sm font-medium">Secondary Contact:</p>
                              <p className="text-sm"><strong>Name:</strong> {medicalCard.secondaryEmergencyContact.name}</p>
                              <p className="text-sm"><strong>Relationship:</strong> {medicalCard.secondaryEmergencyContact.relationship}</p>
                              <p className="text-sm"><strong>Number:</strong> {medicalCard.secondaryEmergencyContact.number}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {medicalCard.insurance && medicalCard.insurance.provider && (
                      <div className="md:col-span-2 mb-3">
                        <h4 className="font-medium text-blue-800 mb-1">Insurance Information</h4>
                        <div className="bg-gray-50 p-2 rounded-md">
                          <p className="text-sm"><strong>Provider:</strong> {medicalCard.insurance.provider || 'Not specified'}</p>
                          <p className="text-sm"><strong>Policy Number:</strong> {medicalCard.insurance.policyNumber || 'Not specified'}</p>
                          <p className="text-sm"><strong>Group Number:</strong> {medicalCard.insurance.groupNumber || 'Not specified'}</p>
                        </div>
                      </div>
                    )}

                    {medicalCard.primaryPhysician && medicalCard.primaryPhysician.name && (
                      <div className="md:col-span-2 mb-3">
                        <h4 className="font-medium text-blue-800 mb-1">Primary Physician</h4>
                        <div className="bg-gray-50 p-2 rounded-md">
                          <p className="text-sm"><strong>Name:</strong> {medicalCard.primaryPhysician.name || 'Not specified'}</p>
                          <p className="text-sm"><strong>Specialization:</strong> {medicalCard.primaryPhysician.specialization || 'Not specified'}</p>
                          <p className="text-sm"><strong>Contact:</strong> {medicalCard.primaryPhysician.contact || 'Not specified'}</p>
                        </div>
                      </div>
                    )}

                    <p className="text-sm md:col-span-2 text-gray-500 text-right"><strong>Last Updated:</strong> {medicalCard.lastUpdated ? new Date(medicalCard.lastUpdated).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">No medical card information available.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reject Blood Donation</h3>
            <p className="mb-4 text-gray-700">Please provide a reason for rejecting this blood donation acceptance:</p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              rows="3"
              placeholder="Reason for rejection (optional)"
            ></textarea>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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

export default PendingBloodAcceptances;
