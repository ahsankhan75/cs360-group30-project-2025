import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProfileIcon from '../components/profile-icon';
import { useAuthContext } from '../hooks/useAuthContext';
import { toast } from 'react-toastify';

const BloodRequestDetail = () => {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();
  const navigate = useNavigate();

  console.log("BloodRequestDetail component - requestId:", requestId);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        console.log("Fetching blood request details for ID:", requestId);
        const response = await fetch(`/api/blood-requests/${requestId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(errorData.error || 'Failed to fetch blood request details');
        }
        
        const data = await response.json();
        console.log("Blood request data received:", data);
        
        setRequest(data);
        // Once we have the request, fetch the hospital details if needed
        if (data.hospitalName) {
          fetchHospitalByName(data.hospitalName);
        }
      } catch (err) {
        console.error("Error fetching request details:", err);
        setError(err.message || 'Error connecting to the server');
      } finally {
        setLoading(false);
      }
    };

    const fetchHospitalByName = async (hospitalName) => {
      try {
        const response = await fetch(`/api/hospitals/by-name?name=${encodeURIComponent(hospitalName)}`);
        if (response.ok) {
          const data = await response.json();
          setHospital(data);
        }
      } catch (err) {
        console.error("Error fetching hospital details:", err);
        // Non-critical error, don't set the main error state
      }
    };

    if (requestId) {
      fetchRequestDetails();
    } else {
      setError('Invalid request ID');
      setLoading(false);
    }
  }, [requestId]);

  const handleAcceptRequest = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/blood-requests/${requestId}` } });
      return;
    }

    try {
      setAccepting(true);
      const response = await fetch(`/api/blood-requests/${requestId}/accept`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept request');
      }

      const updatedRequest = await response.json();
      setRequest(updatedRequest);
      toast.success('Blood donation request accepted successfully!');
    } catch (err) {
      console.error("Error accepting request:", err);
      toast.error(err.message || 'Error accepting request');
    } finally {
      setAccepting(false);
    }
  };

  // Check if this request was accepted by the current user
  const isAcceptedByCurrentUser = () => {
    if (!user || !request) return false;
    return request.accepted && request.acceptedBy && request.acceptedBy.toString() === user._id;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 font-medium">{error || 'Blood request not found'}</div>
        <Link 
          to="/blood-requests" 
          className="mt-4 inline-block px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
        >
          Back to All Requests
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="relative z-50">
        <ProfileIcon />
      </div>
      
      <div className="max-w-screen-lg mx-auto">
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-gray-600 hover:text-teal-600">Home</Link>
            </li>
            <li className="inline-flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link to="/blood-requests" className="text-gray-600 hover:text-teal-600">Blood Requests</Link>
            </li>
            <li aria-current="page">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">Request {request.requestId}</span>
            </li>
          </ol>
        </nav>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h1 className="text-3xl font-bold text-teal-600 mb-2">Blood Donation Request</h1>
              <p className="text-gray-700 mb-4">From {request.hospitalName}</p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-teal-600">Request Details</h3>
                    <ul className="mt-2 space-y-2">
                      <li><strong>Request ID:</strong> {request.requestId}</li>
                      <li>
                        <strong>Blood Type:</strong> 
                        <span className="ml-2 inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full font-medium">
                          {request.bloodType}
                        </span>
                      </li>
                      <li>
                        <strong>Urgency Level:</strong> 
                        <span className={`ml-2 inline-block px-3 py-1 rounded-full font-medium ${
                          request.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                          request.urgencyLevel === 'Urgent' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {request.urgencyLevel}
                        </span>
                      </li>
                      <li><strong>Units Needed:</strong> {request.unitsNeeded}</li>
                      <li><strong>Date Posted:</strong> {new Date(request.datePosted).toLocaleDateString()}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-teal-600">Location Information</h3>
                    <ul className="mt-2">
                      <li><strong>Location:</strong> {request.location}</li>
                      {request.latitude && request.longitude && (
                        <li className="mt-2">
                          <strong>Coordinates:</strong> 
                          <div className="mt-1 text-sm">
                            Lat: {request.latitude.toFixed(6)}<br />
                            Long: {request.longitude.toFixed(6)}
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            <Link 
              to="/blood-requests" 
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back to All Requests
            </Link>
            
            {!request.accepted ? (
              <button
                onClick={handleAcceptRequest}
                disabled={accepting}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {accepting ? 'Processing...' : 'Accept Request'}
              </button>
            ) : (
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-md">
                {isAcceptedByCurrentUser() ? 'You have accepted this request' : 'This request has been accepted'}
              </div>
            )}
          </div>
        </div>
        
        {hospital && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Hospital Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-teal-600">About {hospital.name}</h3>
                <p className="mt-2 text-gray-700">{hospital.description || 'No description available.'}</p>
                
                {hospital.resources && (
                  <div className="mt-4">
                    <h4 className="font-medium">Available Resources:</h4>
                    <ul className="mt-1 list-disc list-inside text-gray-700">
                      {hospital.resources.icu_beds && (
                        <li>ICU Beds: {hospital.resources.icu_beds}</li>
                      )}
                      {hospital.resources.ventilators && (
                        <li>Ventilators: {hospital.resources.ventilators}</li>
                      )}
                      {hospital.resources.blood_bank !== undefined && (
                        <li>Blood Bank: {hospital.resources.blood_bank ? 'Available' : 'Not Available'}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-teal-600">Contact Information</h3>
                {hospital.contact ? (
                  <ul className="mt-2 text-gray-700">
                    {hospital.contact.phone && (
                      <li className="flex items-center mt-1">
                        <span className="mr-2">📞</span>
                        <span>{hospital.contact.phone}</span>
                      </li>
                    )}
                    {hospital.contact.email && (
                      <li className="flex items-center mt-1">
                        <span className="mr-2">✉️</span>
                        <span>{hospital.contact.email}</span>
                      </li>
                    )}
                    {hospital.contact.website && (
                      <li className="flex items-center mt-1">
                        <span className="mr-2">🌐</span>
                        <a 
                          href={hospital.contact.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {hospital.contact.website}
                        </a>
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="mt-2 text-gray-500">No contact information available.</p>
                )}
                
                <div className="mt-4">
                  <Link 
                    to={`/hospitals/${hospital._id}`}
                    className="text-teal-600 hover:underline"
                  >
                    View Full Hospital Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodRequestDetail;
