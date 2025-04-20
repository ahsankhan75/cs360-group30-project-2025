import React, { useState } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import EditReviewModal from './EditReviewModal';

const ReviewList = ({ reviews, loading, emptyMessage, isUserReviews = false, onReviewUpdated }) => {
  const { user } = useAuthContext();
  const [editingReview, setEditingReview] = useState(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        <span className="ml-2 text-gray-600">Loading reviews...</span>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage || "No reviews available."}
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to render stars based on rating
  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
          ★
        </span>
      ));
  };

  const handleEditClick = (review) => {
    setEditingReview(review);
  };

  const handleReviewUpdated = (updatedReview) => {
    // If parent component provided an update handler, use it
    if (onReviewUpdated) {
      onReviewUpdated(updatedReview);
    }
    setEditingReview(null);
  };

  return (
    <>
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review._id}
            className={`border-b border-gray-200 pb-4 mb-4 last:border-0 ${
              isUserReviews ? 'bg-teal-50 p-3 rounded-md' : ''
            }`}
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
              <div className="flex items-center mb-2 md:mb-0">
                <div className="flex mr-2">{renderStars(review.rating)}</div>
                <span className="font-medium">
                  {review.userId?.fullName || review.user?.fullName || review.userId?.email || 'Anonymous User'}
                  {isUserReviews && " (You)"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>

                {/* Show edit button for user's own reviews */}
                {isUserReviews && user && (
                  <button
                    className="ml-4 text-teal-600 hover:text-teal-800 flex items-center text-sm"
                    onClick={() => handleEditClick(review)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                )}
              </div>
            </div>

            <div className="mt-2">
              {review.comment ? (
                <p className="text-gray-700">{review.comment}</p>
              ) : (
                <p className="text-gray-500 italic">No comment provided.</p>
              )}
            </div>

            {/* Add date of visit if available */}
            {review.visitDate && (
              <div className="mt-2 text-xs text-gray-500">
                Visit date: {formatDate(review.visitDate)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Review Modal */}
      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onReviewUpdated={handleReviewUpdated}
        />
      )}
    </>
  );
};

export default ReviewList;
