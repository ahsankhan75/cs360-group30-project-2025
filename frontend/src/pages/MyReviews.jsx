import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import StarRating from '../components/Reviews/StarRating';
import { toast } from 'react-toastify';
import EditReviewModal from '../components/Reviews/EditReviewModal';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [totalReviewCount, setTotalReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchMyReviews = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/reviews/my-reviews', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch your reviews');
        }

        const data = await response.json();
        setReviews(data);
        
        // Calculate statistics
        setTotalReviewCount(data.length);
        if (data.length > 0) {
          const avgRating = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
          setAverageRating(avgRating);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error(error.message);
        setLoading(false);
      }
    };

    fetchMyReviews();
  }, [user]);

  const handleReviewUpdate = (updatedReview) => {
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review._id === updatedReview._id ? updatedReview : review
      )
    );
    toast.success('Review updated successfully');
  };

  const handleReviewDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      // Remove the review from the state
      setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
      toast.success('Review deleted successfully');
      
      // Update statistics
      setTotalReviewCount(prevCount => prevCount - 1);
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error.message);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!user) {
    return (
      <div className="p-4 md:p-6 min-h-screen bg-gray-100">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-teal-600 mb-6">My Reviews</h1>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 mb-4">Please log in to view your reviews.</p>
            <Link to="/login" className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition">
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-100">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-teal-600 mb-4 md:mb-0">My Reviews</h1>
        </div>
        
        {/* Statistics Section */}
        {!loading && reviews.length > 0 && (
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center md:text-left">
                <h2 className="text-xl font-semibold mb-1">Your Review Activity</h2>
                <p className="text-sm opacity-90">Track your contributions across hospitals</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-end gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{totalReviewCount}</p>
                  <p className="text-sm">Total Reviews</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center items-center">
                    <span className="text-3xl font-bold mr-1">{averageRating.toFixed(1)}</span>
                    <span className="text-2xl">★</span>
                  </div>
                  <p className="text-sm">Average Rating</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 text-center">
            <div className="text-teal-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Reviews Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't written any reviews yet. Share your experiences at hospitals to help others.
            </p>
            <Link to="/reviews" className="px-6 py-2 bg-teal-500 text-white font-medium rounded hover:bg-teal-600 transition">
              Write a Review
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div 
                key={review._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Hospital Info */}
                <div className="bg-gray-50 p-4 border-b">
                  <Link 
                    to={`/reviews?hospital=${review.hospitalId._id}`}
                    className="text-lg font-semibold text-teal-700 hover:text-teal-900 transition-colors"
                  >
                    {review.hospitalId.name}
                  </Link>
                  <p className="text-sm text-gray-600">{review.hospitalId.location?.address}</p>
                </div>
                
                {/* Review Content */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <StarRating rating={review.rating} />
                      <span className="ml-2 font-medium">{review.rating}.0</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    {review.comment ? (
                      <p className="text-gray-700">{review.comment}</p>
                    ) : (
                      <p className="text-gray-500 italic">No comment provided.</p>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="mt-4 flex justify-end space-x-2">
                    <button 
                      onClick={() => handleReviewDelete(review._id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                    <button 
                      onClick={() => setEditingReview(review)}
                      className="px-3 py-1 text-sm text-teal-600 hover:text-teal-800 transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Back to All Reviews link */}
        <div className="mt-8 text-center">
          <Link 
            to="/reviews" 
            className="text-teal-600 hover:text-teal-800 transition-colors flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Hospital Reviews
          </Link>
        </div>
      </div>
      
      {/* Edit Review Modal */}
      {editingReview && (
        <EditReviewModal 
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onReviewUpdated={handleReviewUpdate}
        />
      )}
    </div>
  );
};

export default MyReviews;
