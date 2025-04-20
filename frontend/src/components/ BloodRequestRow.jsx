import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StarRating from '../components/Reviews/StarRating';
import { useAuthContext } from '../hooks/useAuthContext';
import { toast } from 'react-toastify';

const BloodRequestRow = ({ request }) => {
  const [accepted, setAccepted] = useState(request.accepted); 
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
        setAccepted(true);
        toast.success('Blood donation request accepted successfully!');
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
      className="cursor-pointer transition duration-200 hover:bg-gray-300"
    >
      <td className="p-4">{request.hospitalName}</td>
      <td className="p-4">
        <div className="flex items-center">
          <StarRating rating={request.hospitalRating || 0} />
          <span className="ml-2 text-sm">
            {request.hospitalRating ? request.hospitalRating.toFixed(1) : '-'}
          </span>
          {request.reviewCount > 0 && (
            <span className="ml-1 text-xs text-gray-500">
              ({request.reviewCount})
            </span>
          )}
        </div>
      </td>
      <td className="p-4">{request.requestId}</td>
      <td className="p-4">{request.bloodType}</td>
      <td className="p-4">{request.urgencyLevel}</td>
      <td className="p-4">{request.location}</td>
      <td className="p-4">
        {new Date(request.datePosted).toLocaleDateString()}
        <br />
        <span className="text-sm text-gray-500">
          {new Date(request.datePosted).toLocaleTimeString()}
        </span>
      </td>
      <td className="p-4 text-center">{request.unitsNeeded}</td>
      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleAccept}
          disabled={accepted || isProcessing}
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            accepted
              ? 'bg-green-100 text-green-700'
              : isProcessing
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {accepted ? 'Accepted' : isProcessing ? 'Processing...' : 'Accept'}
        </button>
      </td>
    </tr>
  );
};

export default BloodRequestRow;