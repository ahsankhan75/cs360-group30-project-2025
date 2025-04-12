import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';

const AddBloodRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [bloodType, setBloodType] = useState('A+');
  const [urgencyLevel, setUrgencyLevel] = useState('Normal');
  const [unitsNeeded, setUnitsNeeded] = useState(1);
  const [contactNumber, setContactNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [hospitalLoading, setHospitalLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch hospitals from API when component mounts
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('/api/hospitals/names');
        if (!response.ok) {
          throw new Error('Failed to fetch hospitals');
        }
        const data = await response.json();
        setHospitals(data);
      } catch (err) {
        console.error('Error fetching hospitals:', err);
        setError('Failed to load hospitals. Please try again.');
        toast.error('Failed to load hospitals');
      } finally {
        setHospitalLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a blood request');
      return;
    }
    
    if (!selectedHospital) {
      setError('Please select a hospital');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const hospital = hospitals.find(h => h._id === selectedHospital);
      
      if (!hospital) {
        throw new Error('Selected hospital not found');
      }
      
      // Ensure coordinates are properly extracted from hospital data
      let latitude = null;
      let longitude = null;
      
      // Try to get coordinates from different possible hospital data structures
      if (hospital.location && hospital.location.coordinates) {
        // If coordinates are in location.coordinates object
        if (hospital.location.coordinates.latitude && hospital.location.coordinates.longitude) {
          latitude = hospital.location.coordinates.latitude;
          longitude = hospital.location.coordinates.longitude;
        } 
        // If coordinates are in location.coordinates array [lng, lat] format
        else if (Array.isArray(hospital.location.coordinates) && hospital.location.coordinates.length >= 2) {
          longitude = hospital.location.coordinates[0];
          latitude = hospital.location.coordinates[1];
        }
      }
      
      // Use city-based coordinates as fallback if exact coordinates aren't available
      if (!latitude || !longitude) {
        // Extract city from location or use city field directly
        const cityMatch = (hospital.location?.address || hospital.city || '').match(/([A-Za-z]+)/);
        const city = cityMatch ? cityMatch[0] : '';
        
        // City coordinates lookup table
        const cityCoordinates = {
          'Lahore': { lat: 31.5204, lon: 74.3587 },
          'Karachi': { lat: 24.8607, lon: 67.0011 },
          'Islamabad': { lat: 33.6844, lon: 73.0479 },
          // ...other cities as needed
        };
        
        if (city && cityCoordinates[city]) {
          latitude = cityCoordinates[city].lat;
          longitude = cityCoordinates[city].lon;
        }
      }
      
      const newRequest = {
        requestId: uuidv4(),
        hospitalName: hospital.name,
        bloodType,
        urgencyLevel,
        unitsNeeded: parseInt(unitsNeeded),
        location: hospital.location?.address || hospital.city || 'Unknown location',
        datePosted: new Date().toISOString(),
        contactNumber,
        email: user.email,
        latitude,
        longitude
      };

      const response = await fetch('/api/blood-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newRequest)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create blood request');
      }

      toast.success('Blood request created successfully!');
      navigate('/requests');
    } catch (err) {
      setError(err.message);
      toast.error('Error creating blood request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="max-w-screen-md mx-auto">
        <h1 className="text-3xl font-bold text-teal-600 mb-6">Create Blood Donation Request</h1>
        
        {!user && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-6">
            You must be logged in to create a blood donation request.
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Select Hospital:
            </label>
            {hospitalLoading ? (
              <div className="flex items-center text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-teal-500 mr-2"></div>
                Loading hospitals...
              </div>
            ) : (
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select a hospital</option>
                {hospitals.map((hospital) => (
                  <option key={hospital._id} value={hospital._id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Blood Type:
            </label>
            <select
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
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
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Urgency Level:
            </label>
            <select
              value={urgencyLevel}
              onChange={(e) => setUrgencyLevel(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Units Needed:
            </label>
            <input
              type="number"
              min="1"
              value={unitsNeeded}
              onChange={(e) => setUnitsNeeded(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Contact Number (optional):
            </label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || !user || hospitalLoading}
            className="w-full px-6 py-3 bg-teal-500 text-white font-medium rounded-md hover:bg-teal-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBloodRequest;
