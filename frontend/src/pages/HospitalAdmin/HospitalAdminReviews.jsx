import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospitalAdminAuthContext } from '../../hooks/useHospitalAdminAuthContext';
import { toast } from 'react-toastify';
import HospitalAdminNavbar from '../../components/HospitalAdmin/HospitalAdminNavbar';

const HospitalAdminReviews = () => {
  const { hospitalAdmin } = useHospitalAdminAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewsData, setReviewsData] = useState({
    hospital: {},
    reviews: [],
    stats: {
      count: 0,
      avgRating: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    }
  });

  useEffect(() => {
    const fetchReviews = async () => {
      if (!hospitalAdmin) {
        navigate('/hospital-admin/login');
        return;
      }

      try {
        const response = await fetch('/api/hospital-admin/reviews', {
          headers: {
            'Authorization': `Bearer ${hospitalAdmin.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }

        const data = await response.json();
        setReviewsData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
        toast.error('Error loading reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [hospitalAdmin, navigate]);

  // Calculate percentage for rating bars
  const calculatePercentage = (count) => {
    if (reviewsData.stats.count === 0) return 0;
    return Math.round((count / reviewsData.stats.count) * 100);
  };

  if (loading) {
    return (
      <div>
        <HospitalAdminNavbar />
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-teal-500 border-solid"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <HospitalAdminNavbar />
      <div className="container mx-auto px-2 xs:px-4 py-4 sm:py-8">
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl xs:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
            Reviews for {reviewsData.hospital?.name || 'Your Hospital'}
          </h1>
          
          {/* Rating Summary */}
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mb-4 sm:mb-8">
            <div className="flex-1">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-800 mr-3 sm:mr-4">
                  {reviewsData.stats.avgRating ? reviewsData.stats.avgRating.toFixed(1) : '0.0'}
                </div>
                <div>
                  <div className="flex text-yellow-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 ${
                          i < Math.round(reviewsData.stats.avgRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-xs xs:text-sm text-gray-500">
                    Based on {reviewsData.stats.count} {reviewsData.stats.count === 1 ? 'review' : 'reviews'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center mb-1.5 sm:mb-2">
                  <div className="w-10 xs:w-12 text-xs xs:text-sm text-gray-600">{rating} stars</div>
                  <div className="flex-1 mx-2 xs:mx-4">
                    <div className="h-2 xs:h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${calculatePercentage(reviewsData.stats.distribution[rating])}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-10 xs:w-12 text-xs xs:text-sm text-gray-600">
                    {reviewsData.stats.distribution[rating]} {reviewsData.stats.distribution[rating] === 1 ? 'review' : 'reviews'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
          <h2 className="text-lg xs:text-xl font-bold text-gray-800 mb-3 sm:mb-4">All Reviews</h2>
          
          {reviewsData.reviews && reviewsData.reviews.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {reviewsData.reviews.map((review) => (
                <li key={review._id} className="py-3 sm:py-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs xs:text-sm font-semibold">
                        {review.userId?.fullName ? review.userId.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                    <div className="ml-2 xs:ml-4 flex-1">
                      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between">
                        <h3 className="text-xs xs:text-sm font-medium text-gray-900">
                          {review.userId?.fullName || review.userId?.email || 'Anonymous User'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 xs:mt-0">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-3 w-3 xs:h-4 xs:w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="mt-2 text-xs xs:text-sm text-gray-700">{review.comment}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-4 sm:py-8 text-center">
              <svg
                className="mx-auto h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h3 className="mt-2 text-xs xs:text-sm font-medium text-gray-900">No reviews yet</h3>
              <p className="mt-1 text-xs xs:text-sm text-gray-500">
                Your hospital hasn't received any reviews yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalAdminReviews;
