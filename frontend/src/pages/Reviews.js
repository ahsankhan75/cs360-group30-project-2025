import React, { useState, useEffect } from 'react';
import HospitalReviewForm from '../components/Reviews/HospitalReviewForm';
import ReviewList from '../components/Reviews/ReviewList';
import ProfileIcon from "../components/profile-icon";
import { useAuthContext } from '../hooks/useAuthContext';

const Reviews = () => {
  const [hospitals, setHospitals] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  // Fetch hospitals on component mount
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('/api/hospitals/names');
        const json = await response.json();
        
        if (response.ok) {
          setHospitals(json);
          // Set first hospital as default if available
          if (json.length > 0) {
            setSelectedHospital(json[0]._id);
            fetchReviewsForHospital(json[0]._id);
          } else {
            setLoading(false);
          }
        } else {
          console.error('Failed to fetch hospitals');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  // Fetch reviews for a specific hospital
  const fetchReviewsForHospital = async (hospitalId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/hospital/${hospitalId}`);
      const json = await response.json();
      
      if (response.ok) {
        setReviews(json);
      } else {
        console.error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle hospital selection change
  const handleHospitalChange = (e) => {
    const hospitalId = e.target.value;
    setSelectedHospital(hospitalId);
    fetchReviewsForHospital(hospitalId);
  };

  // Handle new review submission
  const handleReviewSubmitted = (newReview) => {
    setReviews(prevReviews => [newReview, ...prevReviews]);
  };

  // Find the selected hospital object
  const currentHospital = hospitals.find(h => h._id === selectedHospital);

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="relative z-50">
        <ProfileIcon />
      </div>
      
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-bold text-teal-600 mb-6">Hospital Reviews</h1>
        
        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">Select Hospital:</label>
          <select
            value={selectedHospital}
            onChange={handleHospitalChange}
            className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15aacf]"
          >
            {hospitals.map(hospital => (
              <option key={hospital._id} value={hospital._id}>
                {hospital.name}
              </option>
            ))}
          </select>
        </div>
        
        {selectedHospital && currentHospital && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-2">{currentHospital.name}</h2>
              <p className="text-gray-700">{currentHospital.location?.address}</p>
              
              {currentHospital.ratings > 0 && (
                <div className="mt-3 flex items-center">
                  <div className="flex mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star} 
                        className={`text-lg ${star <= currentHospital.ratings ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span>{currentHospital.ratings.toFixed(1)} out of 5</span>
                </div>
              )}
            </div>
            
            <HospitalReviewForm 
              hospitalId={selectedHospital} 
              hospitalName={currentHospital.name}
              onReviewSubmitted={handleReviewSubmitted}
            />
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <ReviewList reviews={reviews} loading={loading} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reviews;
