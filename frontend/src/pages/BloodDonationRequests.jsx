import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProfileIcon from '../components/profile-icon';
import StarRating from '../components/Reviews/StarRating';
import { formatDistanceToNow } from 'date-fns';

const BloodDonationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hospitals, setHospitals] = useState({});
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationDistanceFilter, setLocationDistanceFilter] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/blood-requests');
        const data = await response.json();
        
        if (response.ok) {
          console.log('Blood requests data received:', data.length, 'requests'); 
          
          // Map city names to coordinates directly here
          const enhancedRequests = data.map(req => {
            // Extract city name from location string
            const cityName = req.location.split(',')[0].trim();
            const coordsData = getCityCoordinates(cityName);
            
            // Always ensure we have numeric latitude and longitude
            return {
              ...req,
              // Use exact coords if available, otherwise use city coordinates
              lat: req.latitude || (coordsData ? coordsData.lat : null),
              lng: req.longitude || (coordsData ? coordsData.lon : null),
            };
          });
          
          console.log('Enhanced requests with coordinates:', 
            enhancedRequests.filter(r => r.lat && r.lng).length, 
            'out of', enhancedRequests.length);
          
          setRequests(enhancedRequests);
          
          // Extract unique hospital names
          const uniqueHospitalNames = [...new Set(data.map(req => req.hospitalName))];
          fetchHospitalDetails(uniqueHospitalNames);
        } else {
          setError('Failed to fetch blood donation requests');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);
  
  // Helper function to get coordinates for known cities
  const getCityCoordinates = (locationName) => {
    const cityCoordinates = {
      'Lahore': { lat: 31.5204, lon: 74.3587 },
      'Karachi': { lat: 24.8607, lon: 67.0011 },
      'Islamabad': { lat: 33.6844, lon: 73.0479 },
      'Rawalpindi': { lat: 33.5651, lon: 73.0169 },
      'Faisalabad': { lat: 31.4504, lon: 73.135 },
      'Multan': { lat: 30.1575, lon: 71.5249 },
      'Peshawar': { lat: 34.0151, lon: 71.5249 },
      'Quetta': { lat: 30.1798, lon: 66.975 },
      'Sialkot': { lat: 32.4945, lon: 74.5229 },
      'Gujranwala': { lat: 32.1877, lon: 74.1945 },
      'Bahawalpur': { lat: 29.3956, lon: 71.6836 },
      'Hyderabad': { lat: 25.396, lon: 68.3578 },
      'Sukkur': { lat: 27.7052, lon: 68.8574 },
      'Larkana': { lat: 27.5631, lon: 68.2158 },
      'Mardan': { lat: 34.1988, lon: 72.0400 }
    };
    
    // Check if we have exact location match
    if (cityCoordinates[locationName]) {
      return cityCoordinates[locationName];
    }
    
    // Try to find partial matches
    const cityName = Object.keys(cityCoordinates).find(city => 
      locationName.toLowerCase().includes(city.toLowerCase())
    );
    
    return cityName ? cityCoordinates[cityName] : null;
  };

  // Fetch hospital details including ratings
  const fetchHospitalDetails = async (hospitalNames) => {
    try {
      const response = await fetch('/api/hospitals/names');
      const allHospitals = await response.json();
      
      if (response.ok) {
        // Create a map of hospital name to hospital details
        const hospitalMap = {};
        allHospitals.forEach(hospital => {
          hospitalMap[hospital.name] = hospital;
        });
        
        setHospitals(hospitalMap);
      }
    } catch (err) {
      console.error('Error fetching hospital details:', err);
    }
  };

  const getHospitalRating = (hospitalName) => {
    if (hospitals[hospitalName]) {
      return hospitals[hospitalName].ratings || 0;
    }
    return 0;
  };

  const getHospitalId = (hospitalName) => {
    return hospitals[hospitalName]?._id || '';
  };

  // Add distance calculation function (same as the one in BloodRequestsPage)
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => deg * (Math.PI / 180);
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Add geolocation hook
  useEffect(() => {
    if (locationDistanceFilter && !userLocation) {
      console.log("Getting user location for nearby blood requests filter...");
      
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by your browser');
        setLocationDistanceFilter(false);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log("User location obtained:", coords);
          setUserLocation(coords);
          setLocationError('');
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError(`Location access denied. Please enable location services.`);
          setLocationDistanceFilter(false);
        }
      );
    }
  }, [locationDistanceFilter, userLocation]);

  // Apply filters to requests
  const filteredRequests = requests.filter(request => {
    // Blood type filter
    if (bloodTypeFilter && request.bloodType !== bloodTypeFilter) {
      return false;
    }
    
    // Text-based location filter
    if (locationFilter && 
        !request.location.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }
    
    // Urgency level filter
    if (urgencyFilter && request.urgencyLevel !== urgencyFilter) {
      return false;
    }
    
    // Distance-based location filter
    if (locationDistanceFilter && userLocation) {
      // Skip requests without coordinates
      if (!request.lat || !request.lng) {
        console.log(`No coordinates for: ${request.hospitalName} in ${request.location}`);
        return false;
      }
      
      try {
        // Calculate distance using Haversine formula
        const distance = getDistanceFromLatLonInKm(
          userLocation.lat,
          userLocation.lng,
          parseFloat(request.lat),
          parseFloat(request.lng)
        );
        
        if (distance > 50) {
          // Too far away
          return false;
        }
        
        // For debugging - show distances for matched requests
        console.log(`${request.hospitalName} is ${distance.toFixed(1)}km away`);
      } catch (error) {
        console.error(`Error calculating distance for ${request.hospitalName}:`, error);
        return false;
      }
    }
    
    // If we get here, all filters passed
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 font-medium">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="relative z-50">
        <ProfileIcon />
      </div>
      
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <h1 className="text-3xl font-bold text-teal-600">Blood Donation Requests</h1>
          <Link 
            to="/add-blood-request" 
            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
          >
            Add New Request
          </Link>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="font-semibold mb-3">Filter Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm mb-1">Blood Type</label>
              <select 
                value={bloodTypeFilter} 
                onChange={(e) => setBloodTypeFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Blood Types</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Location</label>
              <input 
                type="text" 
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Filter by location..."
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1">Urgency Level</label>
              <select 
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Urgency Levels</option>
                {['Normal', 'Urgent', 'Critical'].map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Add location distance filter */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="block text-sm mb-1">Nearby only (within 50km)</span>
                <input
                  type="checkbox"
                  checked={locationDistanceFilter}
                  onChange={() => setLocationDistanceFilter(prev => !prev)}
                  className="h-4 w-4 text-teal-500 focus:ring-teal-400 border-gray-300 rounded"
                />
              </label>
              {locationError && (
                <p className="text-xs text-red-500 mt-1">{locationError}</p>
              )}
              {userLocation && locationDistanceFilter && (
                <p className="text-xs text-gray-500 mt-1">Using your current location</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Add debugging information for location filter */}
        {locationDistanceFilter && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md mb-4">
            {userLocation ? (
              <p>Using your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>
            ) : (
              <p>Getting your location...</p>
            )}
            {locationError && <p className="text-red-500">{locationError}</p>}
          </div>
        )}
        
        {/* Add count of results */}
        <div className="mb-4 text-gray-600">
          Found {filteredRequests.length} out of {requests.length} requests matching your criteria.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <Link 
                to={`/blood-requests/${request.requestId}`} 
                key={request.requestId}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">
                      {request.bloodType}
                    </div>
                    <div className={`px-3 py-1 rounded-full font-medium ${
                      request.urgencyLevel === 'Critical' 
                        ? 'bg-red-100 text-red-800' 
                        : request.urgencyLevel === 'Urgent' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {request.urgencyLevel}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold mt-3">{request.hospitalName}</h2>
                  
                  <div className="mt-2 flex items-center">
                    <StarRating rating={getHospitalRating(request.hospitalName)} />
                    <span className="ml-2 text-sm text-gray-600">
                      {getHospitalRating(request.hospitalName).toFixed(1)}
                    </span>
                    <span className="ml-1 text-xs text-gray-500">
                      ({hospitals[request.hospitalName]?.reviewCount || 0})
                    </span>
                    <Link 
                      to={`/reviews?hospital=${getHospitalId(request.hospitalName)}`} 
                      onClick={(e) => e.stopPropagation()}
                      className="ml-auto text-xs text-teal-600 hover:underline"
                    >
                      View Reviews
                    </Link>
                  </div>
                  
                  <div className="mt-3 text-gray-600">
                    <p><span className="font-medium">Location:</span> {request.location}</p>
                    <p><span className="font-medium">Units Needed:</span> {request.unitsNeeded}</p>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-500">
                    Posted {formatDistanceToNow(new Date(request.datePosted), { addSuffix: true })}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
              No blood donation requests found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloodDonationRequests;
