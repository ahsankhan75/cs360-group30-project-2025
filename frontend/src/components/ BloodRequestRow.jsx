import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from '../components/Reviews/StarRating';
import { useAuthContext } from '../hooks/useAuthContext';
import { toast } from 'react-toastify';

const BloodRequestRow = ({ request }) => {
  const [userAccepted, setUserAccepted] = useState(request.userAccepted);
  const [hospitalApproved, setHospitalApproved] = useState(request.hospitalApproved);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { user, refreshUserToken } = useAuthContext();

  // Update local state when request prop changes
  useEffect(() => {
    setUserAccepted(request.userAccepted);
    setHospitalApproved(request.hospitalApproved);
  }, [request]);

  const handleRowClick = () => {
    navigate(`/blood-requests/${request.requestId}`);
  };

  const handleAccept = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    // Check if user is logged in
    if (!user) {
      toast.error('You must be logged in to accept a blood donation request');
      navigate('/login');
      return;
    }

    // Prevent multiple clicks while processing
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // First attempt with current token
      let res = await fetch(`/api/blood-requests/${request.requestId}/accept`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      let data = await res.json();

      // If token is expired, try to refresh and retry request
      if (res.status === 401 && data.code === 'TOKEN_EXPIRED') {
        const newToken = await refreshUserToken();

        if (newToken) {
          // Retry the request with the new token
          res = await fetch(`/api/blood-requests/${request.requestId}/accept`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newToken}`
            }
          });

          data = await res.json();
        } else {
          // Refresh failed, redirect to login
          navigate('/login');
          return;
        }
      }

      if (res.ok) {
        setUserAccepted(true);
        setHospitalApproved('pending');
        toast.success('Blood donation request accepted! Waiting for hospital approval.');
      } else {
        toast.error(data.error || 'Failed to accept request');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    if (userAccepted && hospitalApproved === 'approved') {
      return (
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Accepted
          </span>
        </div>
      );
    } else if (userAccepted && hospitalApproved === 'rejected') {
      return (
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Rejected
          </span>
        </div>
      );
    } else if (userAccepted) {
      return (
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <svg className="w-3 h-3 mr-1 animate-spin" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Pending Approval
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <tr
      onClick={handleRowClick}
      className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
    >
      <td className="px-4 sm:px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{request.hospitalName}</div>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center">
          <StarRating rating={request.hospitalRating || 0} />
          <span className="ml-2 text-sm text-gray-600">
            {request.hospitalRating ? request.hospitalRating.toFixed(1) : '-'}
          </span>
          {request.reviewCount > 0 && (
            <span className="ml-1 text-xs text-gray-500">
              ({request.reviewCount})
            </span>
          )}
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="text-sm text-gray-900">{request.requestId}</div>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{request.bloodType}</div>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${request.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-800' :
            request.urgencyLevel === 'Urgent' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
          }`}>
          {request.urgencyLevel}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="text-sm text-gray-900">
          {typeof request.location === 'object'
            ? (request.location.type === 'Point' && Array.isArray(request.location.coordinates))
              ? `${request.location.coordinates[1]?.toFixed(4)}, ${request.location.coordinates[0]?.toFixed(4)}`
              : (request.location.coordinates && Array.isArray(request.location.coordinates))
                ? `${request.location.coordinates[1]?.toFixed(4)}, ${request.location.coordinates[0]?.toFixed(4)}`
                : (request.location.latitude && request.location.longitude)
                  ? `${request.location.latitude?.toFixed(4)}, ${request.location.longitude?.toFixed(4)}`
                  : 'Unknown location'
            : request.location}
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="text-sm text-gray-900">
          {new Date(request.datePosted).toLocaleDateString()}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(request.datePosted).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 text-center">
        <div className="text-sm font-medium text-gray-900">{request.unitsNeeded}</div>
      </td>
      <td className="px-4 sm:px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
        {userAccepted ? (
          getStatusBadge()
        ) : (
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className={`w-full sm:w-auto px-4 py-3 sm:py-2 rounded-md text-sm font-medium transition-colors touch-manipulation ${isProcessing ? 'bg-gray-300 text-gray-700 cursor-not-allowed' :
                'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
              }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Accept'}
          </button>
        )}
      </td>
    </tr>
  );
};

export default BloodRequestRow;