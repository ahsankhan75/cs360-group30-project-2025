import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProfileIcon from '../components/profile-icon';
import StarRating from '../components/Reviews/StarRating';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';

const FindHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [minRating, setMinRating] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async (params = {}) => {
    setLoading(true);
    setIsSearching(true);
    try {
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
      setIsSearching(false);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="relative z-50">
        <ProfileIcon />
      </div>
      
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-teal-600 mb-2">Find Hospitals</h1>
          <p className="text-gray-600 text-lg">Search and discover hospitals near you</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospitals..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            
            <div>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
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
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
              >
                  <option value="">All Services</option>
                  <option value="emergency">Emergency Care</option>
                  <option value="surgery">Surgery</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="cardiology">Cardiology</option>
              </select>
            </div>
            
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                type="submit"
                  className="flex-1 px-6 py-3 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                  {isSearching ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </div>
                  ) : (
                    'Search'
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleClearFilters}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Clear
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>

        <AnimatePresence>
        {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-12"
            >
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"></div>
                <p className="mt-4 text-gray-600 text-lg">Loading hospitals...</p>
          </div>
            </motion.div>
        ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
            {hospitals.length > 0 ? (
              hospitals.map((hospital) => (
                  <motion.div
                  key={hospital._id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold text-gray-800">{hospital.name}</h2>
                      <Link 
                        to={`/reviews?hospital=${hospital._id}`} 
                          className="text-sm text-teal-600 hover:text-teal-700 transition-colors"
                      >
                        Write Review
                      </Link>
                    </div>
                    
                      <div className="flex items-center mt-3">
                      <StarRating rating={hospital.ratings || 0} />
                        <span className="ml-2 text-sm font-medium text-gray-600">
                        {hospital.ratings ? hospital.ratings.toFixed(1) : 'No ratings'}
                      </span>
                      <span className="ml-1 text-xs text-gray-500">
                        ({hospital.reviewCount || 0} {hospital.reviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                    
                      {/* Enhanced Wait Time Display */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-4 border border-blue-100"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <motion.div
                                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [0.7, 1, 0.7],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700">Current Wait Time</h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold text-blue-600">
                                  {hospital.waitTime || 'N/A'}
                                </span>
                                <span className="text-sm text-gray-500">minutes</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Last Updated</div>
                            <div className="text-sm font-medium text-gray-700">
                              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Estimated Time</span>
                            <span>Real-time Updates</span>
                          </div>
                          <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-400 to-teal-400 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((hospital.waitTime || 0) / 120 * 100, 100)}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      </motion.div>

                      <p className="mt-3 text-gray-600">
                      {hospital.location?.address || 'Address not available'}
                    </p>
                    
                      <div className="mt-4 flex flex-wrap gap-2">
                      {hospital.resources?.blood_bank && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          Blood Bank
                        </span>
                      )}
                      {hospital.resources?.icu_beds > 0 && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          ICU: {hospital.resources.icu_beds} beds
                        </span>
                      )}
                    </div>
                    
                    {hospital.services && hospital.services.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm font-medium text-gray-700 mb-2">Services:</div>
                        <div className="flex flex-wrap gap-2">
                          {hospital.services.slice(0, 3).map((service, index) => (
                            <span
                              key={index}
                                className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded-full"
                            >
                              {service}
                            </span>
                          ))}
                          {hospital.services.length > 3 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                              +{hospital.services.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                      <div className="mt-6 flex justify-between items-center">
                      <Link
                        to={`/hospitals/${hospital._id}`}
                          className="text-teal-600 font-medium hover:text-teal-700 transition-colors"
                      >
                        View Details →
                      </Link>
                      <Link
                        to={`/add-request?hospital=${hospital._id}`}
                          className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        Add Blood Request
                      </Link>
                    </div>
                  </div>
                  </motion.div>
              ))
            ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-12"
                >
                  <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No hospitals found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Try adjusting your search criteria or filters to find more hospitals.
                    </p>
              </div>
                </motion.div>
            )}
            </motion.div>
        )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
};

export default FindHospitals;
