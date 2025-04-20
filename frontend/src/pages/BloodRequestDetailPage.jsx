// src/pages/BloodRequestDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { toast } from 'react-toastify';
import StarRating from '../components/Reviews/StarRating';
import { api, isUserAdmin } from '../utils/api';

const BloodRequestDetailPage = () => {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [hospital, setHospital] = useState(null);
  const { user } = useAuthContext();
  const navigate = useNavigate();
  
  // Check if user is an admin
  const isAdmin = isUserAdmin();

  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        // Fetch blood request
        const reqResponse = await fetch(`/api/blood-requests/${requestId}`);
        const reqData = await reqResponse.json();
        setRequest(reqData);
        
        // Fetch hospital data for rating information
        const hospitalResponse = await fetch('/api/hospitals/names');
        const hospitalsData = await hospitalResponse.json();
        
        // Find matching hospital by name
        const matchingHospital = hospitalsData.find(h => h.name === reqData.hospitalName);
        if (matchingHospital) {
          setHospital(matchingHospital);
        }
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    
    fetchRequestData();
  }, [requestId]);

  const handleAcceptRequest = async () => {
    if (!user) {
      toast.error("You must be logged in to accept a request");
      navigate('/login');
      return;
    }

    try {
      setAccepting(true);
      const response = await fetch(`/api/blood-requests/${requestId}/accept`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}` // Add the token for authorization
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to accept request');
      }

      const updatedRequest = await response.json();
      setRequest({...request, accepted: true, acceptedBy: user._id});
      toast.success('Blood donation request accepted! Thank you for your help.');
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error(error.message || 'Failed to accept request');
    } finally {
      setAccepting(false);
    }
  };
  
  const handleDeleteRequest = async () => {
    if (!isAdmin) {
      toast.error('Only administrators can delete blood requests');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this blood request?')) {
      return;
    }

    try {
      await api.adminDeleteBloodRequest(requestId);
      toast.success('Blood request deleted successfully');
      navigate('/admin/blood-requests');
    } catch (err) {
      console.error('Error deleting blood request:', err);
      toast.error('Failed to delete blood request');
    }
  };

  if (loading) {
    return <div className="p-8">Loading request details...</div>;
  }

  if (!request) {
    return <div className="p-8">Request not found.</div>;
  }

  // Format date
  const dateStr = new Date(request.datePosted).toLocaleDateString();

  return (
    <div className="p-8 max-w-screen-xl mx-auto">
      <h1 className="text-3xl font-bold text-teal-500 mb-4">Blood Donation Request</h1>
      <div className="text-md text-gray-600 mb-4">Hospital Information</div>

      <div className="mb-6">
        <Link 
          to="/blood-requests" 
          className="text-teal-600 hover:underline flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to All Requests
        </Link>
      </div>

      <div className="bg-orange-100 shadow-lg rounded p-6 mb-6">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-semibold mb-2">{request.hospitalName}</h2>
          
          {/* Hospital Rating */}
          {hospital && (
            <div className="flex items-center">
              <StarRating rating={hospital.ratings || 0} />
              <span className="ml-2 text-sm font-medium">
                {hospital.ratings ? hospital.ratings.toFixed(1) : '-'}
              </span>
              <span className="ml-1 text-xs text-gray-600">
                ({hospital.reviewCount || 0} {hospital.reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <p className="text-gray-700 mb-2">
            <strong>Blood Type Required:</strong> {request.bloodType}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Units Needed:</strong> {request.unitsNeeded}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Urgency Level:</strong> <span className={`${
              request.urgencyLevel === 'High' ? 'text-red-600' : 
              request.urgencyLevel === 'Medium' ? 'text-orange-600' : 'text-green-600'
            } font-medium`}>{request.urgencyLevel}</span>
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Date Posted:</strong> {dateStr}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>City:</strong> {request.location}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Request ID:</strong> {request.requestId}
          </p>
          
          {/* Status indicator */}
          <div className="mt-4">
            <p className="text-gray-700 mb-2">
              <strong>Status:</strong> 
              {request.accepted ? (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Accepted
                </span>
              ) : (
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  Pending
                </span>
              )}
            </p>
          </div>
          
          {/* Contact Information */}
          <div className="mt-4 p-4 bg-white rounded-md">
            <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
            <p className="text-gray-700 mb-2">
              <strong>Contact Number:</strong> {request.contactNumber || '+92xxxxxxx'}
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Email Address:</strong> {request.email || 'donations@example.com'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-4">
          {!user ? (
            <Link
              to="/login" 
              className="px-4 py-2 bg-teal-500 text-white font-medium rounded hover:bg-teal-600"
            >
              Sign in to Accept Request
            </Link>
          ) : request && !request.accepted ? (
            <button 
              onClick={handleAcceptRequest}
              disabled={accepting}
              className={`px-4 py-2 bg-green-500 text-white font-medium rounded hover:bg-green-600 ${accepting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {accepting ? 'Processing...' : 'Accept Request'}
            </button>
          ) : (
            <div className="px-4 py-2 bg-green-100 text-green-700 font-medium rounded border border-green-300">
              Already Accepted
            </div>
          )}
          
          {hospital && hospital._id && (
            <Link 
              to={`/hospital/${hospital._id}`}
              className="px-4 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600"
            >
              View Hospital Details
            </Link>
          )}
          
          {/* Admin-only actions */}
          {isAdmin && (
            <>
              <Link 
                to={`/admin/blood-requests/edit/${requestId}`}
                className="px-4 py-2 bg-indigo-500 text-white font-medium rounded hover:bg-indigo-600"
              >
                Edit Request
              </Link>
              <button 
                onClick={handleDeleteRequest}
                className="px-4 py-2 bg-red-500 text-white font-medium rounded hover:bg-red-600"
              >
                Delete Request
              </button>
            </>
          )}
        </div>
      </div>

      {/* Information for Users */}
      {!isAdmin && (
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-4">
          <h3 className="font-medium text-blue-800 mb-2">About Blood Donation</h3>
          <p className="text-blue-700 text-sm">
            Blood donation is a vital community service that helps save lives. When you accept a blood request, 
            you're committing to contact the hospital and arrange a time to donate.
          </p>
          <p className="text-blue-700 text-sm mt-2">
            Only administrators can create or modify blood requests. If you need to add a blood request, 
            please contact the hospital directly.
          </p>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm mt-10">
        EMCON <br />
        Smart healthcare navigation for everyone!
      </footer>
    </div>
  );
};

export default BloodRequestDetailPage;