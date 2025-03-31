// import { useEffect, useState } from "react";
// // import { filterHospitals } from "../services/hospitalsApi";
// import HospitalList from "../components/HospitalList";
// import HospitalFilters from "../components/HospitalFilters";
// import { useAuthContext } from '../hooks/useAuthContext';

// const Hospitals = () => {
//   const [hospitals, setHospitals] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { user } = useAuthContext();

//   useEffect(() => {
//     const getAllHospitals = async () => {
//         const res = await fetch('api/hospitals/filter', {
//             headers: {
//                 'Authorization': `Bearer ${user.token}`
//             }
//         });
//         setHospitals(await res.json());
//         setLoading(false);
//     };
//     if (user) {
//         getAllHospitals();
//     }
//   }, [user]);

//   const handleFilterChange = async (filters) => {
//     setLoading(true);
//     const filterHospitals = async (filters) => {
//         const queryParams = new URLSearchParams(filters).toString();
//         const res = await fetch(`api/hospitals/filter?${queryParams}`, {
//             headers: {
//                 'Authorization': `Bearer ${user.token}`
//             }
//         });
//         setHospitals(await res.json());
//         setLoading(false);
//     };
//     if (user) {
//         filterHospitals(filters);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Find Hospitals</h1>
//       <HospitalFilters onFilterChange={handleFilterChange} />
//       {loading ? <p>Loading...</p> : <HospitalList hospitals={hospitals} />}
//     </div>
//   );
// };

// export default Hospitals;

import { useEffect, useState, useCallback } from "react";
import HospitalList from "../components/HospitalList";
import HospitalFilters from "../components/HospitalFilters";
import { useAuthContext } from "../hooks/useAuthContext";

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  // Function to fetch hospitals with filters
  const fetchHospitals = useCallback(async (filters = {}) => {
    if (!user) return;

    setLoading(true);
    const queryParams = new URLSearchParams(filters).toString();
    try {
      const res = await fetch(`/api/hospitals/filter?${queryParams}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch hospitals");

      setHospitals(await res.json());
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch all hospitals initially
  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Find Hospitals</h1>
      <HospitalFilters onFilterChange={fetchHospitals} />
      {loading ? <p>Loading...</p> : <HospitalList hospitals={hospitals} />}
    </div>
  );
};

export default Hospitals;