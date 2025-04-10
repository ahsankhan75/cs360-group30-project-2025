import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import { toast } from 'react-toastify';

export const useReviews = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();

  // Fetch all reviews for a hospital
  const fetchReviews = async (hospitalId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/hospital/${hospitalId}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to fetch reviews`);
      }
      
      const data = await response.json();
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      toast.error('Error loading reviews');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Submit a new review
  const submitReview = async (hospitalId, rating, comment) => {
    if (!user) {
      toast.error('You must be logged in to submit a review');
      return null;
    }
    
    setLoading(true);
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
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }
      
      setError(null);
      toast.success('Review submitted successfully!');
      return data;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Edit an existing review
  const editReview = async (reviewId, rating, comment) => {
    if (!user) {
      toast.error('You must be logged in to edit a review');
      return null;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
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
      
      setError(null);
      toast.success('Review updated successfully!');
      return data;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { 
    fetchReviews, 
    submitReview, 
    editReview,
    loading, 
    error 
  };
};
