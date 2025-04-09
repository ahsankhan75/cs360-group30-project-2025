import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProfileIcon from '../components/profile-icon';
import RatingStars from '../components/RatingStars';

const ReviewsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newReview, setNewReview] = useState({
    hospitalId: '',
    reviewerName: '',
    rating: 5,
    comment: ''
  });

  // Get hospitalId from URL query parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const hospitalIdParam = queryParams.get('hospital');

  // Debug logging function
  const logDebug = (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args);
    }
  };

  // Handle hospital selection change
  const handleHospitalChange = (e) => {
    setSelectedHospital(e.target.value);
    setNewReview(prev => ({ ...prev, hospitalId: e.target.value }));
  };

  // Handle input changes in the review form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!selectedHospital) {
      setError('Please select a hospital before submitting a review.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newReview,
          hospitalId: selectedHospital
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Reset form and refresh reviews
      setNewReview({
        hospitalId: selectedHospital,
        reviewerName: '',
        rating: 5,
        comment: ''
      });
      
      // Fetch updated reviews
      fetchReviews();
      
    } catch (err) {
      logDebug('Error submitting review:', err.message);
      setError('Failed to submit review. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch reviews
  const fetchReviews = async () => {
    try {
      logDebug('Fetching reviews for hospital:', selectedHospital);
      setLoading(true);
      
      const url = selectedHospital 
        ? `/api/reviews?hospitalId=${selectedHospital}`
        : '/api/reviews';
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      logDebug('Reviews fetched successfully:', data.length);
      setReviews(data);
    } catch (err) {
      logDebug('Error fetching reviews:', err.message);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch hospitals on component mount
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        // Use the existing filter endpoint instead of a direct /hospitals endpoint
        const response = await fetch('/api/hospitals/filter');
        logDebug('Hospitals filter endpoint status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        logDebug('Hospitals fetched successfully:', data.length);
        setHospitals(data);

        // If there's a hospital ID in the URL, select it
        if (hospitalIdParam) {
          setSelectedHospital(hospitalIdParam);
          setNewReview(prev => ({ ...prev, hospitalId: hospitalIdParam }));
        }
      } catch (err) {
        logDebug('Error fetching hospitals:', err.message);
        setError('Failed to load hospitals. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [hospitalIdParam]);

  // Fetch reviews when selected hospital changes
  useEffect(() => {
    if (hospitals.length > 0) {
      fetchReviews();
    }
  }, [selectedHospital, hospitals]);

  // ... existing code with the return JSX ...
  return (
    <div className="p-8 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-teal-500">Hospital Reviews</h1>
        <ProfileIcon />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-8">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="hospital">
          Select Hospital:
        </label>
        <select
          id="hospital"
          value={selectedHospital}
          onChange={handleHospitalChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">All Hospitals</option>
          {hospitals.length > 0 ? (
            hospitals.map((hospital) => (
              <option key={hospital._id} value={hospital._id}>
                {hospital.name}
              </option>
            ))
          ) : (
            <option disabled>{loading ? 'Loading hospitals...' : 'No hospitals available'}</option>
          )}
        </select>
        
        <div className="text-xs text-gray-500 mt-1">
          {`DEBUG: Loaded ${hospitals.length} hospitals`}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
        <form onSubmit={handleSubmitReview}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reviewerName">
              Your Name (optional)
            </label>
            <input
              type="text"
              id="reviewerName"
              name="reviewerName"
              value={newReview.reviewerName}
              onChange={handleInputChange}
              placeholder="Anonymous"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rating">
              Rating
            </label>
            <select
              id="rating"
              name="rating"
              value={newReview.rating}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              {[5, 4, 3, 2, 1].map(num => (
                <option key={num} value={num}>
                  {num} Star{num !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="comment">
              Your Review
            </label>
            <textarea
              id="comment"
              name="comment"
              value={newReview.comment}
              onChange={handleInputChange}
              placeholder="Share your experience with this hospital..."
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !newReview.comment || !selectedHospital}
            className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold p-6 border-b">
          {selectedHospital 
            ? `Reviews for ${hospitals.find(h => h._id === selectedHospital)?.name || 'Selected Hospital'}`
            : 'All Reviews'}
        </h2>
        
        {loading ? (
          <div className="p-6 text-center">Loading reviews...</div>
        ) : reviews.length > 0 ? (
          <div className="divide-y">
            {reviews.map(review => (
              <div key={review._id} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold">{review.reviewerName || 'Anonymous'}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <RatingStars rating={review.rating} />
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                {!selectedHospital && review.hospitalId && (
                  <p className="text-sm text-teal-600 mt-2">
                    Hospital: {typeof review.hospitalId === 'object' 
                      ? review.hospitalId.name 
                      : hospitals.find(h => h._id === review.hospitalId)?.name || 'Unknown'}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No reviews found for {selectedHospital ? 'this hospital' : 'any hospitals'} yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;