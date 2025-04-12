import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';

const AdminAddBloodRequestPage = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuthContext();

  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [bloodType, setBloodType] = useState('A+');
  const [urgencyLevel, setUrgencyLevel] = useState('Normal');
  const [unitsNeeded, setUnitsNeeded] = useState(1);
  const [contactNumber, setContactNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [hospitalLoading, setHospitalLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }

    const fetchHospitals = async () => {
      try {
        setHospitalLoading(true);
        const response = await fetch('/api/hospitals/names', {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });
        
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
  }, [admin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!admin) {
      setError('You must be logged in as an admin to create a blood request');
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
      
      // Extract location coordinates
      let latitude = null;
      let longitude = null;
      
      if (hospital.location && hospital.location.coordinates) {
        if (Array.isArray(hospital.location.coordinates) && hospital.location.coordinates.length >= 2) {
          longitude = hospital.location.coordinates[0];
          latitude = hospital.location.coordinates[1];
        } else if (hospital.location.coordinates.latitude && hospital.location.coordinates.longitude) {
          latitude = hospital.location.coordinates.latitude;
          longitude = hospital.location.coordinates.longitude;
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
        email: contactEmail || admin.email,
        latitude,
        longitude
      };

      const response = await fetch('/api/blood-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`
        },
        body: JSON.stringify(newRequest)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create blood request');
      }

      toast.success('Blood request created successfully!');
      navigate('/admin/blood-requests');
    } catch (err) {
      setError(err.message);
      toast.error('Error creating blood request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Create Blood Request</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Select Hospital
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
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Blood Type
                </label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Urgency Level
                </label>
                <select
                  value={urgencyLevel}
                  onChange={(e) => setUrgencyLevel(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Units Needed
                </label>
                <input
                  type="number"
                  min="1"
                  value={unitsNeeded}
                  onChange={(e) => setUnitsNeeded(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Optional"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Optional (defaults to admin email)"
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-100 text-red-800 p-4 rounded-md">
                {error}
              </div>
            )}
            
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/blood-requests')}
                className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || hospitalLoading}
                className="px-6 py-3 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAddBloodRequestPage;
