import React, { useState, useEffect, useRef } from 'react';
import StarRating from '../Reviews/StarRating';

const HospitalDropdown = ({ onHospitalSelect, selectedHospital = null }) => {
  const [query, setQuery] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  // Initialize query if a hospital is already selected
  useEffect(() => {
    if (selectedHospital) {
      setQuery(selectedHospital.name);
    }
  }, [selectedHospital]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search hospitals based on query
  useEffect(() => {
    const searchHospitals = async () => {
      if (!query.trim()) {
        setHospitals([]);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/hospitals/filter?name=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (response.ok) {
          setHospitals(data);
        } else {
          setError('Failed to fetch hospitals');
        }
      } catch (err) {
        setError('Error searching hospitals');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchHospitals, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectHospital = (hospital) => {
    setQuery(hospital.name);
    setShowDropdown(false);
    if (onHospitalSelect) {
      onHospitalSelect(hospital);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search for a hospital..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15aacf]"
        />
        {loading && (
          <div className="absolute right-3 top-2.5">
            <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {showDropdown && hospitals.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto">
          {hospitals.map((hospital) => (
            <div
              key={hospital._id}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
              onClick={() => handleSelectHospital(hospital)}
            >
              <div className="font-medium text-gray-900">{hospital.name}</div>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <StarRating rating={hospital.ratings || 0} />
                <span className="ml-2">{hospital.ratings ? hospital.ratings.toFixed(1) : 'No ratings'}</span>
                <span className="ml-1 text-xs text-gray-500">
                  ({hospital.reviewCount || 0})
                </span>
                <span className="mx-2">•</span>
                <span className="truncate">{hospital.location?.address || 'Address not available'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedHospital && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h4 className="font-semibold text-gray-800">{selectedHospital.name}</h4>
          <div className="flex items-center mt-1">
            <StarRating rating={selectedHospital.ratings || 0} />
            <span className="ml-2 text-sm text-gray-600">
              {selectedHospital.ratings ? selectedHospital.ratings.toFixed(1) : 'No ratings'}
            </span>
            <span className="ml-1 text-xs text-gray-500">
              ({selectedHospital.reviewCount || 0} {selectedHospital.reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{selectedHospital.location?.address || 'Address not available'}</p>
          
          {selectedHospital.services && selectedHospital.services.length > 0 && (
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-700">Services: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedHospital.services.slice(0, 3).map((service, index) => (
                  <span key={index} className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                    {service}
                  </span>
                ))}
                {selectedHospital.services.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    +{selectedHospital.services.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HospitalDropdown;
