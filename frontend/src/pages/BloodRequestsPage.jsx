// import React, { useEffect, useState } from 'react';
// import BloodRequestTable from '../components/BloodRequestTable';
// import ProfileIcon from "../components/profile-icon";


// const BloodRequestsPage = () => {
//   const [requests, setRequests] = useState([]);
//   const [filtered, setFiltered] = useState(false);
//   const [search, setSearch] = useState('');
//   const [userBloodType] = useState('O+');
//   const [userLocation, setUserLocation] = useState(null);
//   const [locationFilter, setLocationFilter] = useState(false);
//   const [locationError, setLocationError] = useState('');

//   // 👇 Inline distance calculation function
//   const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
//     const toRad = (deg) => deg * (Math.PI / 180);
//     const R = 6371;
//     const dLat = toRad(lat2 - lat1);
//     const dLon = toRad(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) ** 2 +
//       Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   };

//   useEffect(() => {
//     fetch('/api/blood-requests')
//       .then(res => res.json())
//       .then(data => setRequests(data))
//       .catch(err => console.error(err));
//   }, []);

//   useEffect(() => {
//     if (locationFilter && !userLocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             lat: position.coords.latitude,
//             lon: position.coords.longitude
//           });
//           setLocationError('');
//         },
//         (error) => {
//           setLocationError('Location access denied or unavailable.');
//           setLocationFilter(false);
//         }
//       );
//     }
//   }, [locationFilter, userLocation]);

//   const filteredRequests = requests
//     .filter(r => (filtered ? r.bloodType === userBloodType : true))
//     .filter(r => (search === '' ? true : r.hospitalName.toLowerCase().includes(search.toLowerCase())))
//     .filter(r => {
//       if (!locationFilter || !userLocation) return true;
//       if (!r.latitude || !r.longitude) return false;

//       const distance = getDistanceFromLatLonInKm(
//         userLocation.lat,
//         userLocation.lon,
//         r.latitude,
//         r.longitude
//       );
//       return distance <= 50;
//     });

//   return (
//     <div className="p-8 max-w-screen-xl mx-auto">
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-4xl font-bold text-teal-500">Blood Donation Requests</h1>
//         <ProfileIcon />
//       </div>

//       <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
//         <div className="flex gap-6 flex-wrap">
//           <label className="flex items-center gap-3">
//             <span className="text-md font-medium">Filter by your blood type</span>
//             <input
//               type="checkbox"
//               className="toggle toggle-primary"
//               checked={filtered}
//               onChange={() => setFiltered(prev => !prev)}
//             />
//           </label>

//           <label className="flex items-center gap-3">
//             <span className="text-md font-medium">Nearby only (within 50km)</span>
//             <input
//               type="checkbox"
//               className="toggle toggle-info"
//               checked={locationFilter}
//               onChange={() => setLocationFilter(prev => !prev)}
//             />
//           </label>
//         </div>

//         <input
//           type="text"
//           placeholder="🔍 Search hospital..."
//           className="border rounded px-4 py-2 text-md w-72"
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//         />
//       </div>

//       {locationError && (
//         <div className="text-sm text-red-600 mb-4">{locationError}</div>
//       )}

//       <BloodRequestTable data={filteredRequests} />
//     </div>
//   );
// };

// export default BloodRequestsPage;

// return (
//   <div className="relative p-6 min-h-screen bg-white">
//     <ProfileIcon /> 

//     <h1 className="text-2xl font-bold mb-4 text-gray-800">Find Hospitals</h1>
//     <HospitalFilters onFilterChange={fetchHospitals} />
//     {loading ? (
//       <p className="text-gray-600 mt-4">Loading...</p>
//     ) : (
//       <HospitalList hospitals={hospitals} />
//     )}
//   </div>
// );

import React, { useEffect, useState } from 'react';
import BloodRequestTable from '../components/BloodRequestTable';
import ProfileIcon from '../components/profile-icon';

const BloodRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState(false);
  const [search, setSearch] = useState('');
  const [userBloodType] = useState('O+');
  const [userLocation, setUserLocation] = useState(null);
  const [locationFilter, setLocationFilter] = useState(false);
  const [locationError, setLocationError] = useState('');

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

  useEffect(() => {
    fetch('/api/blood-requests')
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(err => console.error(err));
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
        <ProfileIcon />
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

      <BloodRequestTable data={filteredRequests} />
    </div>
  );
};

export default BloodRequestsPage;