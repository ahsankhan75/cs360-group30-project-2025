import { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";

const HospitalFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    icu: "",
    ventilator: "",
    blood_bank: false,
    medicalImaging: [],
  });
  const { user } = useAuthContext();

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
    if (!user) return;
    onFilterChange(filters);
  }, [filters, onFilterChange, user]);

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
            {["MRI", "CT Scan", "X-Ray", "Ultrasound"].map((type) => (
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
    </div>
  );
};

export default HospitalFilters;