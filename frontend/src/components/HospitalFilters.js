// import { useState, useEffect } from "react";

// const HospitalFilters = ({ onFilterChange }) => {
//   const [filters, setFilters] = useState({
//     icu: "",
//     ventilator: "",
//     blood_bank: false,
//     medicalImaging: [],
//   });

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     setFilters((prevFilters) => ({
//       ...prevFilters,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleMedicalImagingChange = (e) => {
//     const { value, checked } = e.target;
//     setFilters((prevFilters) => {
//       const updatedImaging = checked
//         ? [...prevFilters.medicalImaging, value]
//         : prevFilters.medicalImaging.filter((item) => item !== value);
//       return { ...prevFilters, medicalImaging: updatedImaging };
//     });
//   };

//   // ✅ Automatically apply filters whenever they change
//   useEffect(() => {
//     // if (!user) return;
//     onFilterChange(filters);
//   }, [filters, onFilterChange]);

//   return (
//     <div className="p-4 bg-gray-100 rounded-lg">
//       <h2 className="text-lg font-semibold mb-2">Filter Hospitals</h2>
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block font-medium">ICU Beds</label>
//           <input
//             type="number"
//             name="icu"
//             value={filters.icu}
//             onChange={handleChange}
//             className="border p-2 w-full rounded"
//           />
//         </div>

//         <div>
//           <label className="block font-medium">Ventilators</label>
//           <input
//             type="number"
//             name="ventilator"
//             value={filters.ventilator}
//             onChange={handleChange}
//             className="border p-2 w-full rounded"
//           />
//         </div>

//         <div>
//           <label className="block font-medium">Blood Bank</label>
//           <input
//             type="checkbox"
//             name="blood_bank"
//             checked={filters.blood_bank}
//             onChange={handleChange}
//             className="ml-2"
//           />
//         </div>

//         <div>
//           <label className="block font-medium">Medical Imaging</label>
//           <div className="flex flex-wrap gap-2">
//             {["MRI", "CT Scan", "X-Ray", "Ultrasound"].map((type) => (
//               <label key={type} className="flex items-center">
//                 <input
//                   type="checkbox"
//                   value={type}
//                   checked={filters.medicalImaging.includes(type)}
//                   onChange={handleMedicalImagingChange}
//                   className="mr-2"
//                 />
//                 {type}
//               </label>
//             ))}
//           </div>
//         </div>
//       </div>
//       {/* <button
//         onClick={() => onFilterChange(filters)}
//         className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"

// Apply Filters
//       </button> */}
//     </div>
//   );
// };

// export default HospitalFilters;

import { useState, useEffect } from "react";

const HospitalFilters = ({ onFilterChange }) => {
  // const [filters, setFilters] = useState({
  //   icu: "",
  //   ventilator: "",
  //   blood_bank: false,
  //   medicalImaging: [],
  // });
  const [filters, setFilters] = useState({
    icu: "",
    ventilator: "",
    blood_bank: false,
    medicalImaging: [],
    latitude: "",
    longitude: "",
    radius: "10", // Default radius in km
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMedicalImagingChange = (e) => {
    const { value, checked } = e.target;
    setFilters((prevFilters) => {
      const updatedImaging = checked
        ? [...prevFilters.medicalImaging, value]
        : prevFilters.medicalImaging.filter((item) => item !== value);
      return { ...prevFilters, medicalImaging: updatedImaging };
    });
  };

  

  // ✅ Automatically apply filters whenever they change
  useEffect(() => {
    // if (!user) return;
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFilters((prevFilters) => ({
                    ...prevFilters,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }));
            },
            (error) => {
                // Handle different error cases
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert("You denied location access. Please enable it in your browser settings.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Location information is unavailable.");
                        break;
                    case error.TIMEOUT:
                        alert("Location request timed out. Try again.");
                        break;
                    default:
                        alert("An unknown error occurred.");
                }
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Filter Hospitals</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">ICU Beds</label>
          <input
            type="number"
            name="icu"
            value={filters.icu}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Ventilators</label>
          <input
            type="number"
            name="ventilator"
            value={filters.ventilator}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Blood Bank</label>
          <input
            type="checkbox"
            name="blood_bank"
            checked={filters.blood_bank}
            onChange={handleChange}
            className="ml-2"
          />
        </div>

        <div>
          <label className="block font-medium">Medical Imaging</label>
          <div className="flex flex-wrap gap-2">
            {["MRI", "CT", "X-Ray", "Ultrasound"].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  value={type}
                  checked={filters.medicalImaging.includes(type)}
                  onChange={handleMedicalImagingChange}
                  className="mr-2"
                />
                {type}
              </label>
            ))}
          </div>
        </div>
      </div>
      {/* <button
        onClick={() => onFilterChange(filters)}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Apply Filters
      </button> */}

      {/* Location Filters */}
      <div className="mt-4">
        <label className="block font-medium">Location</label>
        <button onClick={getUserLocation} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
          Use My Location
        </button>

        {filters.latitude && filters.longitude && (
          <p className="text-sm mt-2">Lat: {filters.latitude}, Lng: {filters.longitude}</p>
        )}

        <label className="block font-medium mt-4">Search Radius (km)</label>
        <input type="number" name="radius" value={filters.radius} onChange={handleChange} className="border p-2 w-full rounded" />
      </div>
    </div>
  );
};

export default HospitalFilters;