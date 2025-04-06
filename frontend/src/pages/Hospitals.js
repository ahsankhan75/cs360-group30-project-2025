// import { useEffect, useState, useCallback } from "react";
// import HospitalList from "../components/HospitalList";
// import HospitalFilters from "../components/HospitalFilters";

// const Hospitals = () => {
//   const [hospitals, setHospitals] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch hospitals (with optional filters)
//   const fetchHospitals = useCallback(async (filters = {}) => {
//     setLoading(true);
//     const queryParams = new URLSearchParams(filters).toString();

//     try {
//       const res = await fetch(`/api/hospitals/filter?${queryParams}`);
//       if (!res.ok) throw new Error("Failed to fetch hospitals");

//       setHospitals(await res.json());
//     } catch (error) {
//       console.error("Error fetching hospitals:", error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Fetch all hospitals initially
//   useEffect(() => {
//     fetchHospitals();
//   }, [fetchHospitals]);

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Find Hospitals</h1>
//       <HospitalFilters onFilterChange={fetchHospitals} />
//       {loading ? <p>Loading...</p> : <HospitalList hospitals={hospitals} />}
//     </div>
//   );
// };

// export default Hospitals;

import { useEffect, useState, useCallback } from "react";
import HospitalList from "../components/HospitalList";
import HospitalFilters from "../components/HospitalFilters";
import ProfileIcon from "../components/profile-icon"; // 👈 import the new component

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHospitals = useCallback(async (filters = {}) => {
    setLoading(true);
    const queryParams = new URLSearchParams(filters).toString();

    try {
      const res = await fetch(`/api/hospitals/filter?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch hospitals");

      const data = await res.json();
      setHospitals(data);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  return (
    <div className="relative p-6 min-h-screen bg-white">
      <ProfileIcon /> 

      <h1 className="text-2xl font-bold mb-4 text-gray-800">Find Hospitals</h1>
      <HospitalFilters onFilterChange={fetchHospitals} />
      {loading ? (
        <p className="text-gray-600 mt-4">Loading...</p>
      ) : (
        <HospitalList hospitals={hospitals} />
      )}
    </div>
  );
};

export default Hospitals;