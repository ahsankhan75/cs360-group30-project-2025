import React, { useState } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';

const HospitalReviewForm = ({ hospitalId, hospitalName, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to submit a review');
      return;
    }
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          hospitalId,
          rating,
          comment
        })
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Failed to submit review');
      }

      // Reset form
      setRating(0);
      setComment('');
      
      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted(json);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4">Write a Review for {hospitalName}</h3>
      
      {!user && (
        <p className="text-red-500 mb-4">Please log in to submit a review</p>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Star Rating */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Rating:
          </label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                disabled={!user}
                className="text-3xl focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <span className={`${(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
                  ★
                </span>
              </button>
            ))}
            <span className="ml-2 text-gray-600">
              {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select a rating'}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
            Your Review:
          </label>
          <textarea
            id="comment"
            rows="4"
            disabled={!user}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15aacf]"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience at this hospital..."
          ></textarea>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={!user || isSubmitting}
          className="px-6 py-2 bg-[#2a9fa7] text-white font-semibold rounded-md hover:bg-opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default HospitalReviewForm;
