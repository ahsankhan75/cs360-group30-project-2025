import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import ProfileIcon from '../components/profile-icon';
import HospitalDropdown from '../components/HospitalSearch/HospitalDropdown';
import { v4 as uuidv4 } from 'uuid';

const AddBloodRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  const [bloodType, setBloodType] = useState('A+');
  const [urgencyLevel, setUrgencyLevel] = useState('Normal');
  const [unitsNeeded, setUnitsNeeded] = useState(1);
  const [contactNumber, setContactNumber] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital);
  };

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
      const newRequest = {
        requestId: uuidv4(),
        hospitalName: selectedHospital.name,
        bloodType,
        urgencyLevel,
        unitsNeeded: parseInt(unitsNeeded),
        location: selectedHospital.location?.address || 'Unknown location',
        datePosted: new Date().toISOString(),
        contactNumber,
        email: user.email,
        latitude: selectedHospital.location?.coordinates?.latitude || null,
        longitude: selectedHospital.location?.coordinates?.longitude || null
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

      // Redirect to the blood requests page
      navigate('/blood-requests');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="relative z-50">
        <ProfileIcon />
      </div>
      
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
            <HospitalDropdown 
              onHospitalSelect={handleHospitalSelect} 
              selectedHospital={selectedHospital}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Blood Type:
            </label>
            <select
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15aacf]"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15aacf]"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15aacf]"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15aacf]"
            />
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || !user || !selectedHospital}
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
