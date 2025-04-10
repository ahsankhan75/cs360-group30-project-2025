import React, { useEffect, useState } from 'react';
import BloodRequestTable from '../components/BloodRequestTable';

const BloodRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState(false);
  const [search, setSearch] = useState('');
  const [userBloodType] = useState('O+');
  const [userLocation, setUserLocation] = useState(null);
  const [locationFilter, setLocationFilter] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [loading, setLoading] = useState(true);

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => deg * (Math.PI / 180);
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lat2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
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
        } catch (err) {
          // If hospital ratings fail, still show requests
          console.warn("Error fetching hospital ratings:", err);
          setRequests(requestData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

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
        () => {
          setLocationError('Location access denied or unavailable.');
          setLocationFilter(false);
        }
      );
    }
  }, [locationFilter, userLocation]);

  const filteredRequests = requests
    .filter(r => !filtered || r.bloodType === userBloodType)
    .filter(r => r.hospitalName.toLowerCase().includes(search.toLowerCase()))
    .filter(r => {
      if (!locationFilter || !userLocation) return true;
      if (!r.latitude || !r.longitude) return false;

      const distance = getDistanceFromLatLonInKm(
        userLocation.lat,
        userLocation.lon,
        r.latitude,
        r.longitude
      );
      return distance <= 50;
    });

  return (
    <div className="p-8 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-teal-500">Blood Donation Requests</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
        <div className="flex gap-6 flex-wrap">
          <label className="flex items-center gap-3">
            <span className="text-md font-medium">Filter by your blood type</span>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={filtered}
              onChange={() => setFiltered(prev => !prev)}
            />
          </label>

          <label className="flex items-center gap-3">
            <span className="text-md font-medium">Nearby only (within 50km)</span>
            <input
              type="checkbox"
              className="toggle toggle-info"
              checked={locationFilter}
              onChange={() => setLocationFilter(prev => !prev)}
            />
          </label>
        </div>

        <input
          type="text"
          placeholder="🔍 Search hospital..."
          className="border rounded px-4 py-2 text-md w-72"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {locationError && (
        <div className="text-sm text-red-600 mb-4">{locationError}</div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
          <p className="mt-2 text-gray-600">Loading requests...</p>
        </div>
      ) : (
        <BloodRequestTable data={filteredRequests} />
      )}
    </div>
  );
};

export default BloodRequestsPage;