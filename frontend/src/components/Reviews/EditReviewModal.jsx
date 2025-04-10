import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { toast } from 'react-toastify';

const EditReviewModal = ({ review, onClose, onReviewUpdated }) => {
  const [rating, setRating] = useState(review?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(review?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuthContext();

  useEffect(() => {
    // Add class to prevent body scroll when modal is open
    document.body.classList.add('overflow-hidden');
    
    // Cleanup function
    return () => document.body.classList.remove('overflow-hidden');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to update a review');
      return;
    }
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/reviews/${review._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          rating,
          comment
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update review');
      }

      // Notify parent component
      if (onReviewUpdated) {
        onReviewUpdated(data);
      }
      
      onClose();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-medium text-gray-900">Edit Your Review</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-6 py-4">
          <p className="text-gray-600 mb-4">
            Editing your review for <span className="font-semibold">{review.hospitalId?.name || 'this hospital'}</span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 pt-0">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience at this hospital..."
            ></textarea>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReviewModal;
