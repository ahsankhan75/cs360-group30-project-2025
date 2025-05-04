import React, { useEffect, useState, useCallback } from "react";
import BloodRequestTable from "../components/BloodRequestTable";
import { Link, useNavigate } from "react-router-dom";
import { filterRequests } from "../utils/bloodRequestFilters"; // Assuming this utility handles the 'cityu' filter key
import { useAuthContext } from "../hooks/useAuthContext";
import FallbackErrorComponent from "../components/FallbackErrorComponent";
import Footer from "../components/Footer";

const BloodRequestsPage = () => {
  // --- State Variables ---
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [bloodTypeFilter, setBloodTypeFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const [cityuFilter, setCityuFilter] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationFilter, setLocationFilter] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [filterByUserBloodType, setFilterByUserBloodType] = useState(false);
  const [userBloodType, setUserBloodType] = useState("");
  const [loading, setLoading] = useState(true); // Start loading initially
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // --- Hooks ---
  const navigate = useNavigate();
  const { user } = useAuthContext();

  // --- Constants ---
  const maxRetries = 3;
  const fetchTimeoutDuration = 10000;
  const mainTimeoutDuration = 15000;
  const proximityDistanceKm = 50;

  // --- Data Fetching ---

  const fetchUserBloodType = useCallback(async () => {
    // (fetchUserBloodType implementation remains the same)
    if (!user || !user.token) {
      console.log("User not logged in, cannot fetch blood type.");
      return;
    }
    try {
      const response = await fetch("/api/medical-card", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUserBloodType(data.bloodType || "");
        console.log("User blood type fetched:", data.bloodType);
      } else {
        console.warn(`Failed to fetch user medical card: ${response.status}`);
        setUserBloodType("");
      }
    } catch (err) {
      console.error("Error fetching user medical card:", err);
      setUserBloodType("");
    }
  }, [user]);

  const fetchRequests = useCallback(async () => {
    // Don't set loading true here if already loading due to retry trigger
    // Let the useEffect handle setting loading true before calling
    // setLoading(true); // Removed from here
    setError(null); // Clear previous errors on new attempt
    console.log(
      `Workspaceing data... Attempt ${retryCount + 1
      }, Current Loading State: ${loading}`
    ); // Log current loading state

    const mainTimeoutId = setTimeout(() => {
      if (loading) {
        // No setLoading(false) here, let finally block handle it
        if (retryCount < maxRetries) {
          console.log(`Main operation timed out. Setting retry count.`);
          setRetryCount((prev) => prev + 1); // Trigger retry via state change
        } else {
          setError(
            "Request timed out after multiple retries. Please refresh the page."
          );
          console.error("Main operation timed out after max retries.");
          setLoading(false); // Ensure loading stops if timeout hits max retries
        }
      }
    }, mainTimeoutDuration);

    let fetchErrorOccurred = false; // Flag to track errors within the try block

    try {
      if (user) {
        await fetchUserBloodType();
      }

      let requestData = [];
      const reqController = new AbortController();
      const reqTimeoutId = setTimeout(
        () => reqController.abort(),
        fetchTimeoutDuration
      );

      try {
        console.log("Fetching blood requests...");
        const reqResponse = await fetch("/api/blood-requests", {
          signal: reqController.signal,
          headers: { Accept: "application/json", "Cache-Control": "no-cache" },
        });
        clearTimeout(reqTimeoutId);

        if (!reqResponse.ok) {
          const errorText = await reqResponse.text();
          console.error(
            "Error response fetching requests:",
            reqResponse.status,
            errorText
          );
          throw new Error(
            `HTTP error fetching requests! Status: ${reqResponse.status}`
          );
        }
        requestData = await reqResponse.json();
        console.log(`Received ${requestData.length} blood requests.`);
        // Don't reset retry count here, reset it only when fully successful (after hospital fetch too)
      } catch (fetchError) {
        fetchErrorOccurred = true; // Mark that an error happened
        clearTimeout(reqTimeoutId);
        console.error("Error fetching blood requests:", fetchError);
        if (fetchError.name === "AbortError") {
          throw new Error("Fetching blood requests timed out."); // Rethrow specific error
        }
        requestData = []; // Keep empty data
        // Don't throw if retries remain; allow hospital fetch attempt
        if (retryCount >= maxRetries) {
          throw fetchError; // Throw only if max retries reached
        }
      }

      let hospitalMap = {};
      try {
        console.log("Fetching hospital names/ratings...");
        const hosController = new AbortController();
        const hosTimeoutId = setTimeout(
          () => hosController.abort(),
          fetchTimeoutDuration
        );

        const hospitalResponse = await fetch("/api/hospitals/names", {
          signal: hosController.signal,
          headers: { Accept: "application/json", "Cache-Control": "no-cache" },
        });
        clearTimeout(hosTimeoutId);

        if (hospitalResponse.ok) {
          const hospitalData = await hospitalResponse.json();
          console.log(`Received data for ${hospitalData.length} hospitals.`);
          hospitalData.forEach((hospital) => {
            hospitalMap[hospital.name] = {
              rating: hospital.ratings || 0,
              reviewCount: hospital.reviewCount || 0,
            };
          });
        } else {
          console.warn(
            `Could not fetch hospital ratings: ${hospitalResponse.status}`
          );
        }
      } catch (hospitalError) {
        fetchErrorOccurred = true; // Mark error if hospital fetch fails too
        console.warn("Error fetching hospital ratings:", hospitalError);
        if (hospitalError.name === "AbortError") {
          console.warn("Fetching hospital data timed out.");
        }
        // Don't throw, proceed with potentially partial data
        if (retryCount >= maxRetries && !requestData.length) {
          // Only throw if requests also failed & max retries
          throw hospitalError;
        }
      }

      const requestsWithRatings = requestData.map((request) => ({
        ...request,
        hospitalRating: hospitalMap[request.hospitalName]?.rating || 0,
        reviewCount: hospitalMap[request.hospitalName]?.reviewCount || 0,
      }));

      setRequests(requestsWithRatings);
      setError(null); // Clear any previous error state on success
      // Reset retry count only if the entire process was successful without errors flagged
      if (!fetchErrorOccurred) {
        setRetryCount(0);
      }
      console.log("Data processing successful.");
    } catch (err) {
      fetchErrorOccurred = true; // Ensure flag is set if catch block is reached
      console.error("Error during data fetching process:", err);
      if (retryCount < maxRetries) {
        console.log(
          `Error encountered. Setting retry count (${retryCount + 1
          }/${maxRetries}).`
        );
        clearTimeout(mainTimeoutId); // Clear overall timeout before retry
        setRetryCount((prev) => prev + 1); // Trigger retry via state change -> useEffect will handle setLoading(true)
        // No return needed here, finally block will execute.
      } else {
        // Max retries reached, set final error state
        if (err.name === "AbortError") {
          setError(
            "Request timed out. The server took too long to respond. Please try refreshing."
          );
        } else {
          setError(
            `Failed to load data after multiple attempts: ${err.message}. Please try refreshing.`
          );
        }
        setRequests([]); // Clear data on final failure
      }
    } finally {
      // *** THIS IS THE KEY FIX ***
      // Always clear the main timeout and set loading to false once the fetch attempt completes,
      // unless a retry is being actively triggered (which will reset loading via useEffect).
      clearTimeout(mainTimeoutId);
      // Check if we are *about* to retry. If not, set loading to false.
      // We determine if a retry is pending by checking if an error occurred AND we are below max retries.
      const willRetry = fetchErrorOccurred && retryCount < maxRetries;
      if (!willRetry) {
        console.log(
          "Fetch attempt finished (success, final error, or max retries). Setting loading to false."
        );
        setLoading(false);
      } else {
        console.log(
          "Fetch attempt finished with error, retry will be triggered by state update. Keeping loading true potentially."
        );
        // In the retry case, the useEffect listening to retryCount should set loading=true before calling fetchRequests again.
      }
      console.log("Fetch function finally block finished.");
    }
  }, [retryCount, user, fetchUserBloodType, loading, error]); // Keep dependencies

  // --- Effects ---

  // Effect for initial data load and triggering retries
  useEffect(() => {
    console.log(
      `Effect triggered: loading=${loading}, retryCount=${retryCount}`
    );
    // Fetch data on initial mount (loading is true, retryCount is 0)
    // Or fetch data if retryCount changed (indicating a retry is needed)
    if (retryCount === 0 && loading) {
      // Initial load condition
      console.log("Initial load: Calling fetchRequests.");
      fetchRequests();
    } else if (retryCount > 0) {
      // Retry condition
      console.log(
        `Retry attempt ${retryCount}: Setting loading true and calling fetchRequests.`
      );
      // Ensure loading is true before retrying, then fetch
      if (!loading) {
        setLoading(true); // Set loading before the retry fetch starts
      }
      // Directly calling fetchRequests might happen too quickly if loading wasn't false yet.
      // A small timeout can ensure the state update propagates before fetching.
      // However, relying on the state change and subsequent effect run might be cleaner.
      // Let's try direct call first. If race conditions occur, add timeout.
      fetchRequests();
    }
    // No cleanup needed here as AbortController and timeouts handle interruptions
  }, [retryCount, fetchRequests]); // Depend only on retryCount and fetchRequests callback

  // Effect for applying filters (remains the same)
  useEffect(() => {
    const applyFilters = () => {
      const activeBloodTypeFilter =
        filterByUserBloodType && userBloodType
          ? userBloodType
          : bloodTypeFilter;
      const filters = {
        search,
        bloodType: activeBloodTypeFilter,
        urgency: urgencyFilter,
        cityu: cityuFilter,
        nearMe: locationFilter,
        userLocation,
        maxDistance: proximityDistanceKm,
      };
      const filtered = filterRequests(requests, filters);
      setFilteredRequests(filtered);
    };
    if (!loading) {
      applyFilters();
    }
  }, [
    search,
    bloodTypeFilter,
    urgencyFilter,
    cityuFilter,
    locationFilter,
    userLocation,
    requests,
    filterByUserBloodType,
    userBloodType,
    loading,
  ]);

  // Effect for handling geolocation (remains the same)
  useEffect(() => {
    let isMounted = true;
    if (locationFilter && !userLocation) {
      setLocationError("");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isMounted) {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            console.log("Geolocation obtained:", position.coords);
          }
        },
        (error) => {
          if (isMounted) {
            console.error("Geolocation error:", error);
            setLocationError(
              "Location access denied or unavailable. Please enable location services."
            );
            setLocationFilter(false);
          }
        }
      );
    } else if (!locationFilter) {
      setUserLocation(null);
      setLocationError("");
    }
    return () => {
      isMounted = false;
    };
  }, [locationFilter, userLocation]);

  // --- Event Handlers --- (remain the same)
  const handleRowClick = (requestId) => {
    navigate(`/blood-requests/${requestId}`);
  };
  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    setRequests([]);
    setFilteredRequests([]);
    // Setting loading to true here will trigger the data fetching useEffect
    setLoading(true);
  };

  const handleAcceptRequest = (requestId, updates) => {
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.requestId === requestId
          ? { ...req, ...updates }
          : req
      )
    );
    setFilteredRequests(prevRequests =>
      prevRequests.map(req =>
        req.requestId === requestId
          ? { ...req, ...updates }
          : req
      )
    );
  };

  // --- Rendering --- (JSX remains the same)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center sm:text-left text-teal-600">
              Blood Donation Requests
            </h1>
            <p className="mt-2 text-sm md:text-base text-teal-600 text-center sm:text-left">
              Find and respond to blood donation needs
            </p>
          </div>
          {user && user.role === "hospital-admin" && (
            <Link
              to="/hospital-admin/blood-requests/create"
              className="px-3 py-1.5 md:px-4 md:py-2 bg-white text-teal-700 rounded-md hover:bg-teal-50 transition-colors font-medium shadow-sm whitespace-nowrap text-sm"
            >
              Create New Request
            </Link>
          )}
        </div>
      </div>


      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-6">
        {/* Filter Card */}
        <div className="bg-white rounded-lg shadow-md mb-4 md:mb-6 overflow-hidden">
          <div className="p-3 md:p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-base md:text-lg font-semibold text-gray-800">
              Filter Blood Requests
            </h2>
          </div>
          <div className="p-3 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
              {/* Search Filter */}
              <div>
                <label
                  htmlFor="searchFilter"
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Search Hospital/Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    id="searchFilter"
                    type="text"
                    placeholder="Hospital or Address..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              {/* Blood Type Filter */}
              <div>
                <label
                  htmlFor="bloodTypeFilterSelect"
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Blood Type Needed
                </label>
                <select
                  id="bloodTypeFilterSelect"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={bloodTypeFilter}
                  onChange={(e) => setBloodTypeFilter(e.target.value)}
                  disabled={filterByUserBloodType}
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
              {/* Urgency Filter */}
              <div>
                <label
                  htmlFor="urgencyFilterSelect"
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  Urgency Level
                </label>
                <select
                  id="urgencyFilterSelect"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={urgencyFilter}
                  onChange={(e) => setUrgencyFilter(e.target.value)}
                >
                  <option value="">Any Urgency</option>
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              {/* City Filter */}
              <div>
                <label
                  htmlFor="cityuFilterInput"
                  className="block text-gray-700 text-sm font-medium mb-2"
                >
                  City (Tag)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <input
                    id="cityuFilterInput"
                    type="text"
                    placeholder="Enter city name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={cityuFilter}
                    onChange={(e) => setCityuFilter(e.target.value)}
                  />
                </div>
              </div>
              {/* User Blood Type Filter */}
              {user && (
                <div className="pt-2 flex flex-col justify-end">
                  <div className="flex items-center bg-gray-50 p-3 rounded-md border border-gray-200 h-[42px]">
                    <input
                      type="checkbox"
                      id="filterByUserBloodType"
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      checked={filterByUserBloodType}
                      onChange={() => setFilterByUserBloodType((prev) => !prev)}
                      disabled={!userBloodType}
                    />
                    <label
                      htmlFor="filterByUserBloodType"
                      className={`ml-2 text-sm ${!userBloodType ? "text-gray-500" : "text-gray-700"
                        }`}
                    >
                      {userBloodType
                        ? `My Type (${userBloodType})`
                        : "My Type (N/A)"}
                    </label>
                  </div>
                  {!userBloodType && (
                    <p className="text-xs text-gray-500 mt-1">
                      Blood type not set.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Stats & Management Link */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          {!loading && !error && (
            <div className="text-gray-600 mb-2 md:mb-0">
              Showing{" "}
              <span className="font-medium">{filteredRequests.length}</span> out
              of <span className="font-medium">{requests.length}</span> requests
              matching your criteria
            </div>
          )}
          {user && (
            <Link
              to="/my-blood-requests"
              className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
              Manage My Accepted Requests
            </Link>
          )}
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-4 border-t-teal-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">
                Loading blood requests...
              </p>
              {retryCount > 0 && (
                <p className="text-gray-500 text-sm mt-2">
                  Attempting to reconnect ({retryCount}/{maxRetries})...
                </p>
              )}
              <p className="text-gray-500 text-sm mt-2">
                This may take a moment.
              </p>
            </div>
          ) : error ? (
            <div className="p-6">
              <FallbackErrorComponent error={error} onRetry={handleRetry} />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                <svg
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No blood requests found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {requests.length === 0
                  ? "There are currently no active blood requests. Check back later or try refreshing the page."
                  : "Try adjusting your search or filter criteria to find matching requests."}
              </p>
              {requests.length === 0 && !loading && (
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium inline-flex items-center"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Try Again
                </button>
              )}
            </div>
          ) : (
            <BloodRequestTable
              data={filteredRequests}
              onRowClick={handleRowClick}
              onAccept={handleAcceptRequest}
            />
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 md:mt-8 bg-gradient-to-r from-blue-50 to-teal-50 p-4 md:p-6 rounded-lg border border-blue-100 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-4">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-blue-800 mb-2">
                How Blood Donation Requests Work
              </h3>
              <p className="text-blue-700 mb-2">
                Hospitals post requests here when they need specific blood types
                urgently or to replenish stock.
              </p>
              <p className="text-blue-700">
                Click on a request row to see details. If you can help, accept
                the request, and the hospital will coordinate with you.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop Footer */}
      <div className="hidden md:block"><Footer /></div>
      {/* Mobile Footer */}
      <footer className="bg-[#2a9fa7] text-white py-8 px-6 mt-20 flex flex-col items-center space-y-4 md:hidden z-10">
        <h1 className="text-xl font-bold">EMCON</h1>
        <nav className="flex flex-col items-center space-y-2 mt-2">
          <a href="/hospitals" className="text-base font-medium py-2 px-6 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition">Find Hospitals</a>
          <a href="/blood-requests" className="text-base font-medium py-2 px-6 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition">Blood Requests</a>
          <a href="/medical-card" className="text-base font-medium py-2 px-6 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition">Medical Card</a>
          <a href="/reviews" className="text-base font-medium py-2 px-6 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition">Reviews</a>
        </nav>
        <p className="text-sm text-center mt-4 opacity-80">Smart healthcare navigation for everyone!</p>
      </footer>
    </div>
  );
};

export default BloodRequestsPage;
