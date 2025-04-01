import { useEffect, useState, useCallback } from "react";
import HospitalList from "../components/HospitalList";
import HospitalFilters from "../components/HospitalFilters";
import { useAuthContext } from "../hooks/useAuthContext";

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  // Fetch hospitals (with optional filters)
  const fetchHospitals = useCallback(async (filters = {}) => {
    setLoading(true);
    const queryParams = new URLSearchParams(filters).toString();

    try {
      const res = await fetch(`/api/hospitals/filter?${queryParams}`, {
        headers: user ? { Authorization: `Bearer ${user.token}` } : {},
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