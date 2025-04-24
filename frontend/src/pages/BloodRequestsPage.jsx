import React, { useEffect, useState } from 'react';
import BloodRequestTable from '../components/BloodRequestTable';
import { Link, useNavigate } from 'react-router-dom';
import { filterRequests } from '../utils/bloodRequestFilters';
import { useAuthContext } from '../hooks/useAuthContext';
import FallbackErrorComponent from '../components/FallbackErrorComponent';

// Define a list of possible cities for the filter.
// In a real app, you might fetch these unique values from the backend.
const CITIES_FOR_FILTER = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Other']; // Add more as needed

const BloodRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [cityuFilter, setCityuFilter] = useState(''); // Add state for the new cityu filter
  const [userLocation, setUserLocation] = useState(null);
  const [locationFilter, setLocationFilter] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthContext(); // Get user context

  // Get current user's blood type (could be fetched from API or local storage)
  const userBloodType = localStorage.getItem('userBloodType') || '';

  const [error, setError] = useState(null);

  // Track retry attempts
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);

    // Set a timeout to prevent infinite loading
    const mainTimeoutId = setTimeout(() => {
      setLoading(false);
      if (retryCount < maxRetries) {
        console.log(`Request timed out. Retrying (${retryCount + 1}/${maxRetries})...`);
        setRetryCount(prev => prev + 1);
      } else {
        setError('Request timed out. Please refresh the page.');
      }
    }, 15000); // 15 seconds timeout

    try {
      console.log('Fetching blood requests...');
      // Fetch blood requests with a timeout
      const controller = new AbortController();
      const fetchTimeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      // Use a direct API call with error handling
      let requestData = [];
      try {
        const reqResponse = await fetch('/api/blood-requests', {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        clearTimeout(fetchTimeoutId);

        if (!reqResponse.ok) {
          const errorText = await reqResponse.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP error! Status: ${reqResponse.status}`);
        }

        requestData = await reqResponse.json();
        console.log(`Received ${requestData.length} blood requests`);

        // Reset retry count on success
        setRetryCount(0);
      } catch (fetchError) {
        console.error('Error fetching blood requests:', fetchError);
        // If there's an error, set empty requests but continue to try fetching hospital data
        requestData = [];

        // If we've reached max retries, show the error
        if (retryCount >= maxRetries) {
          throw fetchError;
        }
      }

      try {
        // Fetch hospital data to get ratings
        const hospitalResponse = await fetch('/api/hospitals/names');
        if (!hospitalResponse.ok) {
          console.warn("Could not fetch hospital ratings");
          setRequests(requestData);
          setFilteredRequests(requestData);
          clearTimeout(fetchTimeoutId);
          return;
        }

        const hospitalData = await hospitalResponse.json();

        // Create a map of hospital names to their ratings and review counts
        const hospitalMap = {};
        hospitalData.forEach(hospital => {
          hospitalMap[hospital.name] = {
            rating: hospital.ratings || 0,
            reviewCount: hospital.reviewCount || 0
          };
        });

        // Add ratings to requests
        const requestsWithRatings = requestData.map(request => ({
          ...request,
          hospitalRating: hospitalMap[request.hospitalName]?.rating || 0,
          reviewCount: hospitalMap[request.hospitalName]?.reviewCount || 0
        }));

        setRequests(requestsWithRatings);
        setFilteredRequests(requestsWithRatings);
      } catch (err) {
        // If hospital ratings fail, still show requests
        console.warn("Error fetching hospital ratings:", err);
        setRequests(requestData);
        setFilteredRequests(requestData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);

      // Handle AbortController timeout
      if (err.name === 'AbortError') {
        setError('Request timed out. The server is taking too long to respond. Please try again later.');
      } else {
        setError(`Failed to load blood requests: ${err.message}. Please try again.`);
      }
    } finally {
      setLoading(false);
      clearTimeout(mainTimeoutId);
    }
  };

  // Effect to handle initial load and retries
  useEffect(() => {
    fetchRequests();

    // Cleanup function to clear timeout if component unmounts
    return () => {
      const timeoutId = setTimeout(() => {}, 0);
      clearTimeout(timeoutId);
    };
  }, [retryCount]); // Re-run when retryCount changes

  useEffect(() => {
    // Apply filters whenever filter criteria change
    const applyFilters = () => {
      const filters = {
        search,
        bloodType: bloodTypeFilter,
        urgency: urgencyFilter,
        cityu: cityuFilter, // Pass the new cityu filter
        nearMe: locationFilter,
        userLocation,
        maxDistance: 50 // 50km radius
      };

      const filtered = filterRequests(requests, filters);
      setFilteredRequests(filtered);
    };

    applyFilters();
    // Add cityuFilter to dependency array
  }, [search, bloodTypeFilter, urgencyFilter, cityuFilter, locationFilter, userLocation, requests]);

  useEffect(() => {
    if (locationFilter && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
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

  const handleRowClick = (requestId) => {
    navigate(`/blood-requests/${requestId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-8 px-6 shadow-md">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Blood Donation Requests</h1>
              <p className="mt-2 text-teal-100">Find and respond to blood donation needs in your area</p>
            </div>
            {user && user.role === 'hospital-admin' && (
              <Link
                to="/hospital-admin/blood-requests/create"
                className="px-4 py-2 bg-white text-teal-700 rounded-md hover:bg-teal-50 transition-colors font-medium shadow-sm"
              >
                Create New Request
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Card */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Filter Blood Requests</h2>
          </div>
          <div className="p-6">
            {/* Updated grid layout to accommodate 5 filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Search Input */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Search Hospital or Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Hospital or Address..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Blood Type Select */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Blood Type
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={bloodTypeFilter}
                  onChange={e => setBloodTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Urgency Select */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Urgency Level
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={urgencyFilter}
                  onChange={e => setUrgencyFilter(e.target.value)}
                >
                  <option value="">Any Urgency</option>
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* New CityU Filter - Changed from dropdown to text input */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  City (Tag)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter city name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={cityuFilter}
                    onChange={e => setCityuFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Location Checkbox */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Proximity
                </label>
                <div className="flex items-center mt-2 bg-gray-50 p-3 rounded-md border border-gray-200 h-[42px]"> {/* Match height */}
                  <input
                    type="checkbox"
                    id="locationFilter"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    checked={locationFilter}
                    onChange={() => setLocationFilter(prev => !prev)}
                  />
                  <label htmlFor="locationFilter" className="ml-2 text-sm text-gray-700">Near me (50km)</label>
                </div>
                {locationError && (
                  <p className="text-red-500 text-xs mt-1">{locationError}</p>
                )}
                {locationFilter && userLocation && (
                  <p className="text-green-600 text-xs mt-1 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Using your current location
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div className="text-gray-600 mb-2 md:mb-0">
            <span className="font-medium">{filteredRequests.length}</span> out of <span className="font-medium">{requests.length}</span> requests matching your criteria
          </div>

          {/* Management Link */}
          {user && (
            <Link
              to="/my-blood-requests"
              className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Manage My Requests
            </Link>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-4 border-t-teal-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Loading blood requests...</p>
              <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
            </div>
          ) : error ? (
            <div className="p-6">
              <FallbackErrorComponent
                error={error}
                onRetry={() => {
                  setError(null);
                  setLoading(true);
                  window.location.reload();
                }}
              />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blood requests found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {requests.length === 0 ? 'There might be an issue with the server or no requests have been posted yet.' : 'Try adjusting your filters to see more results.'}
              </p>
              {requests.length === 0 && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium inline-flex items-center"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Page
                </button>
              )}
            </div>
          ) : (
            <BloodRequestTable data={filteredRequests} onRowClick={handleRowClick} />
          )}
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-lg border border-blue-100 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-blue-800 mb-2">How Blood Donation Requests Work</h3>
              <p className="text-blue-700 mb-2">Blood donation requests are posted by hospital administrators when there is a need for specific blood types.</p>
              <p className="text-blue-700">If you'd like to help, you can view the details of any request and accept it if you're able to donate. The hospital will then contact you with further instructions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodRequestsPage;