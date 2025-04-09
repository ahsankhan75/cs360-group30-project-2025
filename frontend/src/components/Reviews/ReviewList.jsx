import React from 'react';

const ReviewList = ({ reviews, loading }) => {
  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to share your experience!
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

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Recent Reviews</h3>
      {reviews.map((review) => (
        <div key={review._id} className="border-b border-gray-200 pb-4 mb-4 last:border-0">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <div className="flex mr-2">{renderStars(review.rating)}</div>
              <span className="font-medium">{review.user?.fullName || 'Anonymous User'}</span>
            </div>
            <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
          </div>
          <p className="text-gray-700">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
