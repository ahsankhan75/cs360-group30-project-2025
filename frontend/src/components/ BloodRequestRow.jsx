import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from '../components/Reviews/StarRating';
import { useAuthContext } from '../hooks/useAuthContext';
import { toast } from 'react-toastify';

const BloodRequestRow = ({ request }) => {
  const [userAccepted, setUserAccepted] = useState(request.userAccepted);
  const [hospitalApproved, setHospitalApproved] = useState(request.hospitalApproved);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { user, refreshUserToken } = useAuthContext(); // Get the auth context with refresh function

  const handleRowClick = () => {
    navigate(`/blood-requests/${request.requestId}`);
  };

  const handleAccept = async (e) => {
    e.stopPropagation();

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

  return (
    <tr
      onClick={handleRowClick}
      className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{request.hospitalName}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
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
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{request.requestId}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{request.bloodType}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          request.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-800' :
          request.urgencyLevel === 'Urgent' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {request.urgencyLevel}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{request.location}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {new Date(request.datePosted).toLocaleDateString()}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(request.datePosted).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="text-sm font-medium text-gray-900">{request.unitsNeeded}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleAccept}
          disabled={userAccepted || isProcessing}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            userAccepted && hospitalApproved === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' :
            userAccepted && hospitalApproved === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
            userAccepted ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
            isProcessing ? 'bg-gray-300 text-gray-700 cursor-not-allowed' :
            'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
          }`}
        >
          {userAccepted && hospitalApproved === 'approved' ? 'Accepted' :
           userAccepted && hospitalApproved === 'rejected' ? 'Rejected' :
           userAccepted ? 'Pending Approval' :
           isProcessing ? 'Processing...' : 'Accept'}
        </button>
      </td>
    </tr>
  );
};

export default BloodRequestRow;