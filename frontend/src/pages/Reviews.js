import React, { useState, useEffect } from 'react';
import HospitalReviewForm from '../components/Reviews/HospitalReviewForm';
import ReviewList from '../components/Reviews/ReviewList';
import { useAuthContext } from '../hooks/useAuthContext';
import { useLocation, Link } from 'react-router-dom';
import StarRating from '../components/Reviews/StarRating';
import HospitalDropdown from '../components/HospitalSearch/HospitalDropdown';
import { toast } from 'react-toastify';

const Reviews = () => {
  const [hospitals, setHospitals] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  const location = useLocation();
  
  // Parse query parameters for direct hospital selection
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const hospitalId = queryParams.get('hospital');
    
    if (hospitalId) {
      fetchHospitalById(hospitalId);
    } else {
      fetchHospitals();
    }
  }, [location.search]);

  // Fetch specific hospital by ID
  const fetchHospitalById = async (hospitalId) => {
    try {
      const response = await fetch(`/api/hospitals/${hospitalId}`);
      const hospital = await response.json();
      
      if (response.ok) {
        setSelectedHospital(hospital);
        fetchReviewsForHospital(hospitalId);
      } else {
        console.error('Failed to fetch hospital');
        toast.error('Failed to load hospital information');
        fetchHospitals(); // Fall back to fetching all hospitals
      }
    } catch (error) {
      console.error('Error fetching hospital:', error);
      toast.error('Error connecting to server');
      fetchHospitals(); // Fall back to fetching all hospitals
    }
  };

  // Fetch hospitals list
  const fetchHospitals = async () => {
    try {
      const response = await fetch('/api/hospitals/names');
      const json = await response.json();
      
      if (response.ok) {
        setHospitals(json);
        setLoading(false);
      } else {
        console.error('Failed to fetch hospitals');
        toast.error('Failed to load hospitals');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast.error('Error connecting to server');
      setLoading(false);
    }
  };

  // Fetch reviews for a specific hospital
  const fetchReviewsForHospital = async (hospitalId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/hospital/${hospitalId}`);
      const reviewsData = await response.json();
      
      if (response.ok) {
        // Separate user reviews from all reviews
        if (user) {
          const userReviewsList = reviewsData.filter(review => 
            review.user && review.userId === user._id
          );
          const otherReviews = reviewsData.filter(review => 
            !review.user || review.userId !== user._id
          );
          
          setUserReviews(userReviewsList);
          setAllReviews(otherReviews);
        } else {
          setAllReviews(reviewsData);
          setUserReviews([]);
        }
      } else {
        console.error('Failed to fetch reviews');
        toast.error('Failed to load reviews');
        setAllReviews([]);
        setUserReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Error loading reviews');
      setAllReviews([]);
      setUserReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle hospital selection
  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital);
    fetchReviewsForHospital(hospital._id);
  };

  // Handle new review submission
  const handleReviewSubmitted = (newReview) => {
    // If it's the user's review, add it to user reviews
    if (user && newReview.userId === user._id) {
      setUserReviews(prevReviews => [newReview, ...prevReviews]);
    } else {
      setAllReviews(prevReviews => [newReview, ...prevReviews]);
    }
    
    // Update hospital rating in the hospital list
    if (selectedHospital) {
      // We should refetch the hospital to get the updated average rating
      fetchHospitalById(selectedHospital._id);
    }
    
    toast.success('Review submitted successfully!');
  };

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-100">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-teal-600 mb-4 md:mb-0">Hospital Reviews</h1>
          {user && (
            <Link 
              to="/my-reviews" 
              className="px-4 py-2 bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 transition flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Reviews
            </Link>
          )}
        </div>
        
        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">Select or Search for Hospital:</label>
          <HospitalDropdown 
            onHospitalSelect={handleHospitalSelect}
            selectedHospital={selectedHospital}
          />
        </div>
        
        {selectedHospital && (
          <>
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
              <h2 className="text-xl md:text-2xl font-semibold mb-2">{selectedHospital.name}</h2>
              <p className="text-gray-700">{selectedHospital.location?.address || 'Address not available'}</p>
              
              <div className="mt-3 flex flex-wrap items-center">
                <StarRating rating={selectedHospital.ratings || 0} />
                <div className="ml-2 flex items-center">
                  <span className="font-medium">{selectedHospital.ratings ? selectedHospital.ratings.toFixed(1) : '0.0'}</span>
                  <span className="mx-1 text-gray-500">•</span>
                  <span className="text-gray-600">
                    {allReviews.length + userReviews.length} {allReviews.length + userReviews.length === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              </div>
            </div>
            
            {user && (
              <HospitalReviewForm 
                hospitalId={selectedHospital._id} 
                hospitalName={selectedHospital.name}
                onReviewSubmitted={handleReviewSubmitted}
              />
            )}
            
            <div className="space-y-8">
              {/* User's reviews section */}
              {userReviews.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                  <div className="bg-teal-50 border-l-4 border-teal-500 p-3 mb-4">
                    <h3 className="text-lg font-semibold text-teal-700">Your Reviews</h3>
                  </div>
                  <ReviewList reviews={userReviews} loading={false} isUserReviews={true} />
                </div>
              )}
              
              {/* All other reviews */}
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {allReviews.length > 0 ? 'Recent Reviews' : 'Reviews'}
                </h3>
                <ReviewList 
                  reviews={allReviews} 
                  loading={loading} 
                  emptyMessage={userReviews.length > 0 
                    ? "No other reviews for this hospital yet." 
                    : "No reviews yet. Be the first to share your experience!"
                  }
                />
              </div>
            </div>
          </>
        )}
        
        {!selectedHospital && !loading && (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 text-center">
            <div className="text-teal-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <p className="text-gray-600">
              Please select a hospital from the dropdown above to view and write reviews.
            </p>
          </div>
        )}
        
        {loading && !selectedHospital && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
