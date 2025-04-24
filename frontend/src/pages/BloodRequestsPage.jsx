import React, { useEffect, useState, useCallback } from 'react';
import BloodRequestTable from '../components/BloodRequestTable';
import { Link, useNavigate } from 'react-router-dom';
import { filterRequests } from '../utils/bloodRequestFilters'; // Assuming this utility handles the 'cityu' filter key
import { useAuthContext } from '../hooks/useAuthContext';
import FallbackErrorComponent from '../components/FallbackErrorComponent';

// Removed CITIES_FOR_FILTER as the implemented filter is a text input

const BloodRequestsPage = () => {
  // --- State Variables ---
  const [requests, setRequests] = useState([]); // All fetched requests
  const [filteredRequests, setFilteredRequests] = useState([]); // Requests after filtering
  const [search, setSearch] = useState(''); // Search input value (Hospital or Location address)
  const [bloodTypeFilter, setBloodTypeFilter] = useState(''); // Selected blood type filter
  const [urgencyFilter, setUrgencyFilter] = useState(''); // Selected urgency filter
  const [cityuFilter, setCityuFilter] = useState(''); // State for the city tag filter (text input)
  const [userLocation, setUserLocation] = useState(null); // User's geolocation {latitude, longitude}
  const [locationFilter, setLocationFilter] = useState(false); // 'Near me' proximity filter toggle
  const [locationError, setLocationError] = useState(''); // Geolocation error message
  const [filterByUserBloodType, setFilterByUserBloodType] = useState(false); // Toggle for filtering by user's own blood type
  const [userBloodType, setUserBloodType] = useState(''); // User's blood type fetched from API
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [error, setError] = useState(null); // Error state for data fetching
  const [retryCount, setRetryCount] = useState(0); // Retry counter for fetch failures

  // --- Hooks ---
  const navigate = useNavigate();
  const { user } = useAuthContext(); // Get user context for auth status and details

  // --- Constants ---
  const maxRetries = 3; // Maximum number of fetch retries
  const fetchTimeoutDuration = 10000; // 10 seconds for individual fetch requests
  const mainTimeoutDuration = 15000; // 15 seconds for the entire fetch process
  const proximityDistanceKm = 50; // Distance for "Near me" filter

  // --- Data Fetching ---

  // Function to fetch user's blood type from their medical card
  const fetchUserBloodType = useCallback(async () => {
    if (!user || !user.token) {
      console.log('User not logged in, cannot fetch blood type.');
      return; // No user or token, can't fetch
    }
    try {
      const response = await fetch('/api/medical-card', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserBloodType(data.bloodType || ''); // Save the blood type
        console.log('User blood type fetched:', data.bloodType);
      } else {
        // Don't treat as a fatal error, just log it. User might not have a card yet.
        console.warn(`Failed to fetch user medical card: ${response.status}`);
        setUserBloodType(''); // Ensure it's reset if fetch fails
      }
    } catch (err) {
      console.error('Error fetching user medical card:', err);
      setUserBloodType(''); // Ensure it's reset on error
    }
  }, [user]); // Dependency: user context

  // Function to fetch blood requests and hospital ratings
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log(`Workspaceing data... Attempt ${retryCount + 1}`);

    // Overall timeout for the entire fetch operation
    const mainTimeoutId = setTimeout(() => {
      if (loading) { // Check if still loading
        setLoading(false);
        if (retryCount < maxRetries) {
          console.log(`Main operation timed out. Retrying (${retryCount + 1}/${maxRetries})...`);
          setRetryCount(prev => prev + 1);
        } else {
          setError('Request timed out after multiple retries. Please refresh the page.');
          console.error('Main operation timed out after max retries.');
        }
      }
    }, mainTimeoutDuration);

    try {
      // --- Fetch User Blood Type (if logged in) ---
      if (user) {
        await fetchUserBloodType();
      }

      // --- Fetch Blood Requests ---
      let requestData = [];
      const reqController = new AbortController();
      const reqTimeoutId = setTimeout(() => reqController.abort(), fetchTimeoutDuration);

      try {
        console.log('Fetching blood requests...');
        const reqResponse = await fetch('/api/blood-requests', {
          signal: reqController.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        clearTimeout(reqTimeoutId);

        if (!reqResponse.ok) {
          const errorText = await reqResponse.text();
          console.error('Error response fetching requests:', reqResponse.status, errorText);
          throw new Error(`HTTP error fetching requests! Status: ${reqResponse.status}`);
        }
        requestData = await reqResponse.json();
        console.log(`Received ${requestData.length} blood requests.`);
        setRetryCount(0); // Reset retry count on success

      } catch (fetchError) {
        clearTimeout(reqTimeoutId);
        console.error('Error fetching blood requests:', fetchError);
        if (fetchError.name === 'AbortError') {
          throw new Error('Fetching blood requests timed out.');
        }
        requestData = [];
        if (retryCount >= maxRetries) {
          throw fetchError;
        }
        // Proceed to fetch hospitals even if requests failed (maybe ratings still work)
      }

      // --- Fetch Hospital Data (for ratings) ---
      let hospitalMap = {};
      try {
        console.log('Fetching hospital names/ratings...');
        const hosController = new AbortController();
        const hosTimeoutId = setTimeout(() => hosController.abort(), fetchTimeoutDuration);

        const hospitalResponse = await fetch('/api/hospitals/names', {
          signal: hosController.signal,
           headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        clearTimeout(hosTimeoutId);

        if (hospitalResponse.ok) {
          const hospitalData = await hospitalResponse.json();
          console.log(`Received data for ${hospitalData.length} hospitals.`);
          hospitalData.forEach(hospital => {
            hospitalMap[hospital.name] = {
              rating: hospital.ratings || 0,
              reviewCount: hospital.reviewCount || 0
            };
          });
        } else {
          console.warn(`Could not fetch hospital ratings: ${hospitalResponse.status}`);
        }
      } catch (hospitalError) {
        console.warn("Error fetching hospital ratings:", hospitalError);
         if (hospitalError.name === 'AbortError') {
          console.warn('Fetching hospital data timed out.');
        }
      }

      // --- Combine Data and Update State ---
      const requestsWithRatings = requestData.map(request => ({
        ...request,
        hospitalRating: hospitalMap[request.hospitalName]?.rating || 0,
        reviewCount: hospitalMap[request.hospitalName]?.reviewCount || 0
      }));

      setRequests(requestsWithRatings);
      setError(null);
      console.log("Data fetching successful.");

    } catch (err) {
      console.error('Error during data fetching process:', err);
      if (retryCount < maxRetries) {
        console.log(`Error encountered. Retrying (${retryCount + 1}/${maxRetries})...`);
         clearTimeout(mainTimeoutId);
         setRetryCount(prev => prev + 1);
         setLoading(true);
         return;
      } else {
        if (err.name === 'AbortError') {
            setError('Request timed out. The server took too long to respond. Please try refreshing.');
        } else {
            setError(`Failed to load data after multiple attempts: ${err.message}. Please try refreshing.`);
        }
        setRequests([]);
      }
    } finally {
      clearTimeout(mainTimeoutId);
      // Set loading false only if not retrying or if error is final
      if (error || retryCount >= maxRetries || !loading) { // Check loading flag consistency
           setLoading(false);
      }
      console.log("Fetch function finished.");
    }
  }, [retryCount, user, fetchUserBloodType, loading, error]); // Added error to dependency list for final loading state check

  // --- Effects ---

  // Effect for initial data load and retries
  useEffect(() => {
    // Only fetch if not already loading to avoid parallel fetches on rapid state changes
    if(loading && retryCount === 0) { // Fetch on initial load or if loading reset for retry
       fetchRequests();
    } else if (retryCount > 0 && !loading) { // Trigger retry if count changed and not currently loading
        setLoading(true); // Set loading before retrying
        fetchRequests();
    }
    // Cleanup not strictly needed due to AbortController/timeouts
  }, [fetchRequests, loading, retryCount]); // Depend on fetchRequests callback, loading, and retryCount

  // Effect for applying filters whenever filter states or requests change
  useEffect(() => {
    const applyFilters = () => {
      // Determine the active blood type filter (user's type or selected type)
      const activeBloodTypeFilter = filterByUserBloodType && userBloodType ? userBloodType : bloodTypeFilter;

      const filters = {
        search,
        bloodType: activeBloodTypeFilter,
        urgency: urgencyFilter,
        cityu: cityuFilter, // Pass the city tag filter value
        nearMe: locationFilter,
        userLocation,
        maxDistance: proximityDistanceKm // Use constant for distance
      };

      // console.log("Applying filters:", filters);
      const filtered = filterRequests(requests, filters); // Pass requests and filters to utility
      setFilteredRequests(filtered);
      // console.log("Filtered results:", filtered.length);
    };

    // Apply filters only when data is not loading to prevent filtering incomplete data
    if (!loading) {
         applyFilters();
    }
  }, [
      search,
      bloodTypeFilter,
      urgencyFilter,
      cityuFilter, // Added city filter state
      locationFilter,
      userLocation,
      requests,
      filterByUserBloodType,
      userBloodType,
      loading // Ensure filtering waits for loading to complete
  ]);


  // Effect for handling geolocation request when 'Near me' is checked
  useEffect(() => {
    let isMounted = true; // Track mount status for async operation

    if (locationFilter && !userLocation) {
      setLocationError(''); // Clear previous errors
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isMounted) {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            console.log("Geolocation obtained:", position.coords);
          }
        },
        (error) => {
          if (isMounted) {
            console.error("Geolocation error:", error);
            setLocationError('Location access denied or unavailable. Please enable location services.');
            setLocationFilter(false); // Uncheck the box if location fails
          }
        }
      );
    } else if (!locationFilter) {
      // If filter is unchecked, clear location data and error
      setUserLocation(null);
      setLocationError('');
    }

    return () => {
      isMounted = false; // Cleanup function to prevent state updates on unmounted component
    };
  }, [locationFilter, userLocation]); // Rerun when locationFilter changes or userLocation updates (though latter is less likely needed)

  // --- Event Handlers ---

  const handleRowClick = (requestId) => {
    navigate(`/blood-requests/${requestId}`);
  };

  // Handler for the retry button in the error component
  const handleRetry = () => {
    setError(null); // Clear error
    setRetryCount(0); // Reset retries
    setRequests([]); // Clear potentially stale data
    setFilteredRequests([]);
    setLoading(true); // Set loading true -> useEffect will trigger fetchRequests
    // Simplest approach: force a full reload to ensure clean state
    // window.location.reload();
  };

  // --- Rendering ---

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-8 px-6 shadow-md">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-center sm:text-left">Blood Donation Requests</h1>
              <p className="mt-2 text-teal-100 text-center sm:text-left">Find and respond to blood donation needs</p>
            </div>
            {user && user.role === 'hospital-admin' && (
              <Link
                to="/hospital-admin/blood-requests/create"
                className="px-4 py-2 bg-white text-teal-700 rounded-md hover:bg-teal-50 transition-colors font-medium shadow-sm whitespace-nowrap"
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
             {/* Updated grid layout for 6 filter elements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {/* Search Filter (Hospital or Location Address) */}
              <div>
                <label htmlFor="searchFilter" className="block text-gray-700 text-sm font-medium mb-2">
                  Search Hospital/Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="searchFilter"
                    type="text"
                    placeholder="Hospital or Address..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Blood Type Select Filter */}
              <div>
                <label htmlFor="bloodTypeFilterSelect" className="block text-gray-700 text-sm font-medium mb-2">
                  Blood Type Needed
                </label>
                <select
                  id="bloodTypeFilterSelect"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={bloodTypeFilter}
                  onChange={e => setBloodTypeFilter(e.target.value)}
                  disabled={filterByUserBloodType} // Disable if filtering by user's type
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

               {/* Filter by User's Blood Type Checkbox */}
               {user && ( // Only show if user is logged in
                <div className="pt-2 flex flex-col justify-end"> {/* Use flex-col and justify-end for alignment */}
                  <div className="flex items-center bg-gray-50 p-3 rounded-md border border-gray-200 h-[42px]"> {/* Set explicit height */}
                    <input
                      type="checkbox"
                      id="filterByUserBloodType"
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      checked={filterByUserBloodType}
                      onChange={() => setFilterByUserBloodType((prev) => !prev)}
                      disabled={!userBloodType} // Disable if user blood type not fetched/available
                    />
                    <label htmlFor="filterByUserBloodType" className={`ml-2 text-sm ${!userBloodType ? 'text-gray-500' : 'text-gray-700'}`}>
                      {userBloodType ? `My Type (${userBloodType})` : 'My Type (N/A)'}
                    </label>
                  </div>
                     {!userBloodType && (
                         <p className="text-xs text-gray-500 mt-1">Blood type not set.</p>
                     )}
                </div>
                )}

              {/* Urgency Filter */}
              <div>
                <label htmlFor="urgencyFilterSelect" className="block text-gray-700 text-sm font-medium mb-2">
                  Urgency Level
                </label>
                <select
                  id="urgencyFilterSelect"
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

               {/* City (Tag) Text Input Filter */}
               <div>
                 <label htmlFor="cityuFilterInput" className="block text-gray-700 text-sm font-medium mb-2">
                   City (Tag)
                 </label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     {/* Location Pin Icon */}
                     <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                   </div>
                   <input
                     id="cityuFilterInput"
                     type="text"
                     placeholder="Enter city name..."
                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                     value={cityuFilter}
                     onChange={e => setCityuFilter(e.target.value)}
                   />
                 </div>
               </div>

              {/* Location Proximity Checkbox Filter */}
              <div>
                 <label className="block text-gray-700 text-sm font-medium mb-2">
                   Proximity
                 </label>
                <div className="flex items-center bg-gray-50 p-3 rounded-md border border-gray-200 h-[42px]"> {/* Use consistent height */}
                  <input
                    type="checkbox"
                    id="locationFilterCheckbox" // Ensure ID matches htmlFor
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    checked={locationFilter}
                    onChange={() => setLocationFilter(prev => !prev)}
                  />
                  <label htmlFor="locationFilterCheckbox" className="ml-2 text-sm text-gray-700">Near me (within {proximityDistanceKm}km)</label>
                </div>
                {locationError && (
                  <p className="text-red-500 text-xs mt-1">{locationError}</p>
                )}
                {locationFilter && userLocation && !locationError && (
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

        {/* Results Stats & Management Link */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          {!loading && !error && (
            <div className="text-gray-600 mb-2 md:mb-0">
              Showing <span className="font-medium">{filteredRequests.length}</span> out of <span className="font-medium">{requests.length}</span> requests matching your criteria
            </div>
          )}
          {user && ( // Show manage link only if user is logged in
            <Link
              to="/my-blood-requests"
              className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Manage My Accepted Requests
            </Link>
          )}
        </div>

        {/* Main Content Area (Table or Status Messages) */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-4 border-t-teal-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Loading blood requests...</p>
              {retryCount > 0 && <p className="text-gray-500 text-sm mt-2">Attempting to reconnect ({retryCount}/{maxRetries})...</p>}
              <p className="text-gray-500 text-sm mt-2">This may take a moment.</p>
            </div>
          ) : error ? (
             // Error State
            <div className="p-6">
              <FallbackErrorComponent
                error={error} // Pass the error message string directly
                onRetry={handleRetry} // Use the reload-based retry handler
              />
            </div>
          ) : filteredRequests.length === 0 ? (
             // Empty State (No results matching filters or no requests at all)
            <div className="p-8 text-center">
              <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blood requests found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {requests.length === 0
                  ? 'There are currently no active blood requests. Check back later or try refreshing the page.'
                  : 'Try adjusting your search or filter criteria to find matching requests.'}
              </p>
              {requests.length === 0 && !loading && ( // Show refresh only if the initial fetch likely failed or returned nothing, and not currently loading
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium inline-flex items-center"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
              )}
            </div>
          ) : (
            // Success State (Display Table)
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
              <p className="text-blue-700 mb-2">Hospitals post requests here when they need specific blood types urgently or to replenish stock.</p>
              <p className="text-blue-700">Click on a request row to see details. If you can help, accept the request, and the hospital will coordinate with you.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodRequestsPage;