import React, { useState, useEffect, useCallback } from 'react';
import HospitalList from '../components/HospitalList';

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    minRating: '',
    blood_bank: false,
    medicalImaging: []
  });
  
  // Add location filtering state
  const [userLocation, setUserLocation] = useState(null);
  const [locationFilter, setLocationFilter] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [radius, setRadius] = useState(10); // Default radius in km

  const fetchHospitals = useCallback(async (appliedFilters = {}) => {
    setLoading(true);
    
    // Handle location filtering
    let queryParams = {...appliedFilters};
    
    // If location filtering is enabled and we have user's location, add those parameters
    if (locationFilter && userLocation) {
      queryParams = {
        ...queryParams,
        latitude: userLocation.lat,
        longitude: userLocation.lon,
        radius: radius
      };
    }
    
    // Handle medical imaging filters
    if (filters.medicalImaging && filters.medicalImaging.length > 0) {
      queryParams.medicalImaging = filters.medicalImaging.join(',');
    }
    
    const queryString = new URLSearchParams(queryParams).toString();

    try {
      const res = await fetch(`/api/hospitals/filter?${queryString}`);
      if (!res.ok) throw new Error("Failed to fetch hospitals");

      const data = await res.json();
      setHospitals(data);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    } finally {
      setLoading(false);
    }
  }, [locationFilter, userLocation, radius, filters.medicalImaging]);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);
  
  // Handle geolocation when location filter is toggled
  useEffect(() => {
    if (locationFilter && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLocationError('');
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError('Location access denied or unavailable.');
          setLocationFilter(false);
        }
      );
    }
  }, [locationFilter, userLocation]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFilters(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  const handleMedicalImagingChange = (imaging) => {
    setFilters(prev => {
      const currentImaging = [...prev.medicalImaging];
      
      if (currentImaging.includes(imaging)) {
        // Remove if already selected
        return {
          ...prev,
          medicalImaging: currentImaging.filter(item => item !== imaging)
        };
      } else {
        // Add if not already selected
        return {
          ...prev,
          medicalImaging: [...currentImaging, imaging]
        };
      }
    });
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchHospitals(filters);
  };
  
  const resetFilters = () => {
    setFilters({
      name: '',
      minRating: '',
      blood_bank: false,
      medicalImaging: []
    });
    setLocationFilter(false);
    fetchHospitals({});
  };

  // Medical imaging options with icons
  const imagingOptions = [
    { value: 'MRI', label: 'MRI', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
    { value: 'CT', label: 'CT Scan', icon: 'M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5' },
    { value: 'X-Ray', label: 'X-Ray', icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4' },
    { value: 'Ultrasound', label: 'Ultrasound', icon: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-screen-xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-teal-600 mb-6">Find Hospitals</h1>
      
      {/* Filter Form */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-700">Search Options</h2>
          <button
            type="button"
            onClick={resetFilters}
            className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Filters
          </button>
        </div>

        {/* Location Filter Section */}
        <div className="mb-6 border-b pb-6">
          <h3 className="text-md font-medium mb-3 text-gray-700">Location</h3>
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm font-medium text-gray-700">Show nearby hospitals</span>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in">
                <input 
                  type="checkbox"
                  checked={locationFilter}
                  onChange={() => setLocationFilter(prev => !prev)}
                  className="opacity-0 w-0 h-0"
                />
                <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-300 ${locationFilter ? 'bg-teal-500' : 'bg-gray-300'}`}></span>
                <span 
                  className={`absolute h-5 w-5 bg-white rounded-full transition-transform duration-300 transform ${locationFilter ? 'translate-x-6' : 'translate-x-1'} top-0.5`}
                  style={{ boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.25)' }}
                ></span>
              </div>
            </label>
            
            {locationFilter && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Search radius:
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="w-24 md:w-32 accent-teal-500"
                />
                <span className="text-sm font-semibold text-teal-700">{radius} km</span>
              </div>
            )}
          </div>
          
          {locationError && (
            <div className="text-sm text-red-600 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {locationError}
            </div>
          )}
          
          {userLocation && locationFilter && (
            <div className="text-xs text-gray-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Using your location ({userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)})
            </div>
          )}
        </div>

        <form onSubmit={applyFilters} className="space-y-5">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  placeholder="Search by hospital name"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
              <select
                name="minRating"
                value={filters.minRating}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Any Rating</option>
                <option value="1">1+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
          </div>
          
          {/* Facility Options */}
          <div className="pt-4">
            <h3 className="text-md font-medium mb-3 text-gray-700">Medical Facilities</h3>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="blood_bank"
                  name="blood_bank"
                  checked={filters.blood_bank}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="blood_bank" className="ml-2 text-sm font-medium text-gray-700">
                  Blood Bank Available
                </label>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Medical Imaging Options</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {imagingOptions.map(option => (
                  <div 
                    key={option.value}
                    onClick={() => handleMedicalImagingChange(option.value)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer border-2 transition-colors ${
                      filters.medicalImaging.includes(option.value) 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${filters.medicalImaging.includes(option.value) ? 'text-teal-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={option.icon} />
                    </svg>
                    <span className={`mt-1 text-sm font-medium ${filters.medicalImaging.includes(option.value) ? 'text-teal-700' : 'text-gray-600'}`}>
                      {option.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Search Hospitals
            </button>
          </div>
        </form>
      </div>
      
      {/* Results Section */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
          <span className="ml-3 text-gray-600">Loading hospitals...</span>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Found <span className="font-medium">{hospitals.length}</span> {hospitals.length === 1 ? 'hospital' : 'hospitals'}
              {locationFilter && userLocation ? ` within ${radius} km of your location` : ''}
            </p>
            
            {filters.medicalImaging.length > 0 && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Imaging:</span> {filters.medicalImaging.join(', ')}
              </div>
            )}
          </div>
          
          <HospitalList hospitals={hospitals} />
          
          {hospitals.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-700 mb-2">No hospitals match your criteria</h3>
              <p className="text-gray-500 max-w-md mx-auto">Try adjusting your filters or expanding your search radius to find more hospitals.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Hospitals;