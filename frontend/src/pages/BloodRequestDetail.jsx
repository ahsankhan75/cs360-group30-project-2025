import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProfileIcon from '../components/profile-icon';
import StarRating from '../components/Reviews/StarRating';
import ReviewList from '../components/Reviews/ReviewList';
import { formatDistanceToNow } from 'date-fns';

const BloodRequestDetail = () => {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [hospitalReviews, setHospitalReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const response = await fetch(`/api/blood-requests/${requestId}`);
        const data = await response.json();
        
        if (response.ok) {
          setRequest(data);
          setAccepted(data.accepted || false);
          // Once we have the request, fetch the hospital details
          fetchHospitalByName(data.hospitalName);
        } else {
          setError('Failed to fetch blood request details');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [requestId]);

  const fetchHospitalByName = async (hospitalName) => {
    try {
      const response = await fetch(`/api/hospitals/filter?name=${encodeURIComponent(hospitalName)}`);
      const data = await response.json();
      
      if (response.ok && data.length > 0) {
        const hospitalData = data[0]; // Assume the first match is the correct one
        setHospital(hospitalData);
        
        // Now fetch reviews for this hospital
        fetchHospitalReviews(hospitalData._id);
      }
    } catch (err) {
      console.error('Error fetching hospital details:', err);
    }
  };

  const fetchHospitalReviews = async (hospitalId) => {
    setReviewsLoading(true);
    try {
      const response = await fetch(`/api/reviews/hospital/${hospitalId}`);
      const data = await response.json();
      
      if (response.ok) {
        setHospitalReviews(data);
      }
    } catch (err) {
      console.error('Error fetching hospital reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      const response = await fetch(`/api/blood-requests/${requestId}/accept`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setAccepted(true);
      } else {
        alert('Failed to accept request. Please try again.');
      }
    } catch (err) {
      console.error('Error accepting request:', err);
      alert('An error occurred. Please try again.');
    }
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
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{request.bloodType} Blood Needed</h1>
                <div className="mt-2 text-gray-600">
                  Posted {formatDistanceToNow(new Date(request.datePosted), { addSuffix: true })}
                </div>
              </div>
              
              <div className={`px-4 py-2 rounded-full font-medium ${
                request.urgencyLevel === 'Critical' 
                  ? 'bg-red-100 text-red-800' 
                  : request.urgencyLevel === 'Urgent' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {request.urgencyLevel} Priority
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold border-b pb-2 mb-4">Request Details</h2>
                
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Blood Type:</span> {request.bloodType}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Units Needed:</span> {request.unitsNeeded}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span> {request.location}
                  </div>
                  {request.contactNumber && (
                    <div>
                      <span className="font-medium text-gray-700">Contact Number:</span> {request.contactNumber}
                    </div>
                  )}
                  {request.email && (
                    <div>
                      <span className="font-medium text-gray-700">Email:</span> {request.email}
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <button 
                    onClick={handleAcceptRequest}
                    disabled={accepted}
                    className={`w-full px-6 py-3 font-medium rounded-md transition-colors ${
                      accepted 
                        ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {accepted ? 'Request Accepted' : 'Respond to Request'}
                  </button>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold border-b pb-2 mb-4">Hospital Information</h2>
                
                {hospital ? (
                  <div>
                    <h3 className="text-lg font-medium">{hospital.name}</h3>
                    
                    <div className="mt-2 flex items-center">
                      <StarRating rating={hospital.ratings || 0} />
                      <span className="ml-2">
                        {hospital.ratings ? hospital.ratings.toFixed(1) : 'No ratings'} out of 5
                      </span>
                    </div>
                    
                    {hospital.location && (
                      <div className="mt-3">
                        <span className="font-medium text-gray-700">Address:</span> {hospital.location.address}
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <Link 
                        to={`/reviews?hospital=${hospital._id}`} 
                        className="text-teal-600 hover:underline"
                      >
                        See all reviews
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Loading hospital information...</div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Hospital Reviews Section */}
        {hospital && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Hospital Reviews</h2>
                <Link 
                  to={`/reviews?hospital=${hospital._id}`} 
                  className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors text-sm"
                >
                  Write a Review
                </Link>
              </div>
              <ReviewList reviews={hospitalReviews} loading={reviewsLoading} />
            </div>
          </div>
        )}
        
        {/* Map/Location Section */}
        {request.latitude && request.longitude && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Location Map</h2>
              <div className="h-64 bg-gray-200 rounded-md">
                {/* Map component would go here */}
                <div className="flex items-center justify-center h-full text-gray-500">
                  Map view of hospital location
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
