import React, { useEffect, useState } from 'react';
import BloodRequestTable from '../components/BloodRequestTable';
import { Link, useNavigate } from 'react-router-dom';
import { filterRequests } from '../utils/bloodRequestFilters';
import { useAuthContext } from '../hooks/useAuthContext';

const BloodRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationFilter, setLocationFilter] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [filterByUserBloodType, setFilterByUserBloodType] = useState(false); // New state for user blood type filter
  const [userBloodType, setUserBloodType] = useState(''); // Store user's blood type
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthContext(); // Get user context

  useEffect(() => {
    const fetchUserBloodType = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/medical-card', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserBloodType(data.bloodType || ''); // Save the blood type from the medical card
        } else {
          console.error('Failed to fetch user medical card');
        }
      } catch (err) {
        console.error('Error fetching user medical card:', err);
      }
    };

    const fetchRequests = async () => {
      setLoading(true);
      try {
        // Fetch blood requests
        const reqResponse = await fetch('/api/blood-requests');
        if (!reqResponse.ok) {
          throw new Error(`HTTP error! Status: ${reqResponse.status}`);
        }
        const requestData = await reqResponse.json();
        
        try {
          // Fetch hospital data to get ratings
          const hospitalResponse = await fetch('/api/hospitals/names');
          if (!hospitalResponse.ok) {
            console.warn("Could not fetch hospital ratings");
            setRequests(requestData);
            setFilteredRequests(requestData);
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
      } finally {
        setLoading(false);
      }
    };

    fetchUserBloodType(); // Fetch the user's blood type
    fetchRequests(); // Fetch the blood donation requests
  }, [user]);

  useEffect(() => {
    // Apply filters whenever filter criteria change
    const applyFilters = () => {
      const filters = {
        search,
        bloodType: filterByUserBloodType ? userBloodType : bloodTypeFilter, // Use user's blood type if checkbox is selected
        urgency: urgencyFilter,
        nearMe: locationFilter,
        userLocation,
        maxDistance: 50 // 50km radius
      };
      
      const filtered = filterRequests(requests, filters);
      setFilteredRequests(filtered);
    };
    
    applyFilters();
  }, [search, bloodTypeFilter, urgencyFilter, locationFilter, userLocation, requests, filterByUserBloodType, userBloodType]);

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
    <div className="p-8 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-teal-600">Blood Donation Requests</h1>
        {/* Remove "Create Request" button for normal users */}
      </div>

      {/* Enhanced Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Filter Requests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Search Hospital or Location
            </label>
            <input
              type="text"
              placeholder="Search..."
              className="w-full border rounded px-4 py-2 text-md"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Blood Type
            </label>
            <select
              className="w-full border rounded px-4 py-2 text-md"
              value={bloodTypeFilter}
              onChange={e => setBloodTypeFilter(e.target.value)}
              disabled={filterByUserBloodType} // Disable dropdown if filtering by user's blood type
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

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Urgency Level
            </label>
            <select
              className="w-full border rounded px-4 py-2 text-md"
              value={urgencyFilter}
              onChange={e => setUrgencyFilter(e.target.value)}
            >
              <option value="">Any Urgency</option>
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Location
            </label>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                checked={locationFilter}
                onChange={() => setLocationFilter(prev => !prev)}
              />
              <span className="ml-2 text-sm">Near me (within 50km)</span>
            </div>
            {locationError && (
              <p className="text-red-500 text-xs mt-1">{locationError}</p>
            )}
            {locationFilter && userLocation && (
              <p className="text-green-600 text-xs mt-1">
                Using your location
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Filter by My Blood Type
            </label>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                checked={filterByUserBloodType}
                onChange={() => setFilterByUserBloodType((prev) => !prev)}
              />
              <span className="ml-2 text-sm">
                {userBloodType ? `My Blood Type (${userBloodType})` : 'Not Set'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-gray-600">
        Found {filteredRequests.length} out of {requests.length} requests matching your criteria.
      </div>

      {/* Add management link */}
      <div className="mb-4">
        <Link 
          to="/my-blood-requests" 
          className="inline-flex items-center text-teal-600 hover:text-teal-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          Manage My Requests
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
          <p className="mt-2 text-gray-600">Loading requests...</p>
        </div>
      ) : (
        <BloodRequestTable data={filteredRequests} onRowClick={handleRowClick} />
      )}
      
      {/* Add info message explaining blood requests workflow */}
      <div className="mt-8 bg-blue-50 p-4 rounded-md border border-blue-200 text-blue-700">
        <h3 className="font-semibold text-lg mb-2">How Blood Donation Requests Work</h3>
        <p>Blood donation requests are posted by hospital administrators. If you'd like to help, you can view the details of any request and accept it if you're able to donate.</p>
      </div>
    </div>
  );
};

export default BloodRequestsPage;