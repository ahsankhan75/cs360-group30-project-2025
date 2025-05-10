import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminHeader from '../../components/Admin/AdminHeader';

const AdminAddBloodRequestPage = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuthContext();

  // Form state
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [bloodType, setBloodType] = useState('A+');
  const [urgencyLevel, setUrgencyLevel] = useState('Normal');
  const [unitsNeeded, setUnitsNeeded] = useState(1);
  const [contactNumber, setContactNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [expiryDays, setExpiryDays] = useState(7);
  const [notes, setNotes] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [hospitalLoading, setHospitalLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }

    const fetchHospitals = async () => {
      try {
        setHospitalLoading(true);
        const response = await fetch('/api/admin/hospitals', {
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
    setSuccess(false);

    try {
      const hospital = hospitals.find(h => h._id === selectedHospital);

      if (!hospital) {
        throw new Error('Selected hospital not found');
      }

      const newRequest = {
        hospitalId: selectedHospital,
        hospitalName: hospital.name,
        bloodType,
        urgencyLevel,
        unitsNeeded: parseInt(unitsNeeded),
        location: hospital.location?.address || hospital.city || 'Unknown location',
        contactNumber,
        email: contactEmail || admin.email,
        expiryDays: parseInt(expiryDays),
        notes
      };

      const response = await fetch('/api/admin/blood-requests', {
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

      setSuccess(true);
      toast.success('Blood request created successfully!');

      // Reset form
      setSelectedHospital('');
      setBloodType('A+');
      setUrgencyLevel('Normal');
      setUnitsNeeded(1);
      setContactNumber('');
      setContactEmail('');
      setExpiryDays(7);
      setNotes('');

      // Navigate back to the blood requests list after a short delay
      setTimeout(() => {
        navigate('/admin/blood-requests');
      }, 2000);

    } catch (err) {
      setError(err.message);
      toast.error('Error creating blood request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Create Blood Request" />

        <main className="flex-1 overflow-auto p-6">
          <div className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Create New Blood Request</h1>
              <Link
                to="/admin/blood-requests"
                className="text-teal-600 hover:text-teal-800 flex items-center text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Blood Requests
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              {success ? (
                <div className="bg-green-50 p-6 text-center rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-xl font-semibold text-green-800 mb-2">Blood Request Created Successfully</h2>
                  <p className="text-green-700 mb-4">You're being redirected to the blood requests list.</p>
                  <Link
                    to="/admin/blood-requests"
                    className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Go to Blood Requests
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
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
                              {hospital.name} - {hospital.location?.address || hospital.city || 'Unknown location'}
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
                        Request Expiry (Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={expiryDays}
                        onChange={(e) => setExpiryDays(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Number of days this request should remain active
                      </p>
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
                        placeholder="Hospital contact number (optional)"
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
                        placeholder="Contact email (optional)"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-medium mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Any additional information or special requirements (optional)"
                      ></textarea>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-4">
                    <Link
                      to="/admin/blood-requests"
                      className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={loading || hospitalLoading}
                      className="px-6 py-3 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </span>
                      ) : 'Create Blood Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAddBloodRequestPage;
