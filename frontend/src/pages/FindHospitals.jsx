import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProfileIcon from '../components/profile-icon';
import StarRating from '../components/Reviews/StarRating';

const FindHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [minRating, setMinRating] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async (params = {}) => {
    setLoading(true);
    try {
      // Build query string from params
      const queryString = Object.entries(params)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      const response = await fetch(`/api/hospitals/filter${queryString ? `?${queryString}` : ''}`);
      const data = await response.json();

      if (response.ok) {
        setHospitals(data);
      } else {
        throw new Error(data.error || 'Failed to fetch hospitals');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHospitals({ 
      name: searchQuery,
      minRating: minRating || undefined,
      services: serviceFilter || undefined
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setMinRating('');
    setServiceFilter('');
    fetchHospitals();
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="relative z-50">
        <ProfileIcon />
      </div>
      
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-bold text-teal-600 mb-6">Find Hospitals</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Hospital Name or Location:
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospitals..."
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15aacf]"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Minimum Rating:
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15aacf]"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Star</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Service:
              </label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15aacf]"
              >
                <option value="">Any Service</option>
                <option value="Emergency Care">Emergency Care</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopedic">Orthopedic</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatric">Pediatric</option>
                <option value="Maternity">Maternity</option>
                <option value="Blood Bank">Blood Bank</option>
                <option value="ICU">ICU</option>
              </select>
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                type="submit"
                className="px-6 py-2 bg-teal-500 text-white font-medium rounded-md hover:bg-teal-600 transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading hospitals...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.length > 0 ? (
              hospitals.map((hospital) => (
                <div
                  key={hospital._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold">{hospital.name}</h2>
                      <Link 
                        to={`/reviews?hospital=${hospital._id}`} 
                        className="text-sm text-teal-600 hover:underline"
                      >
                        Write Review
                      </Link>
                    </div>
                    
                    <div className="flex items-center mt-2">
                      <StarRating rating={hospital.ratings || 0} />
                      <span className="ml-2 text-sm">
                        {hospital.ratings ? hospital.ratings.toFixed(1) : 'No ratings'}
                      </span>
                      <span className="ml-1 text-xs text-gray-500">
                        ({hospital.reviewCount || 0} {hospital.reviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                    
                    <p className="mt-2 text-gray-600">
                      {hospital.location?.address || 'Address not available'}
                    </p>
                    
                    {/* Resources summary badge */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {hospital.resources?.blood_bank && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                          Blood Bank
                        </span>
                      )}
                      {hospital.resources?.icu_beds > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                          ICU: {hospital.resources.icu_beds} beds
                        </span>
                      )}
                    </div>
                    
                    {hospital.services && hospital.services.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Services:</div>
                        <div className="flex flex-wrap gap-2">
                          {hospital.services.slice(0, 3).map((service, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full"
                            >
                              {service}
                            </span>
                          ))}
                          {hospital.services.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              +{hospital.services.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-between">
                      <Link
                        to={`/hospitals/${hospital._id}`}
                        className="text-teal-600 font-medium hover:underline"
                      >
                        View Details →
                      </Link>
                      <Link
                        to={`/add-request?hospital=${hospital._id}`}
                        className="text-red-600 hover:underline"
                      >
                        Add Blood Request
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                No hospitals found matching your search criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindHospitals;
