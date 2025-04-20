import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHospitalAdminAuthContext } from '../../hooks/useHospitalAdminAuthContext';
import HospitalAdminNavbar from '../../components/HospitalAdmin/HospitalAdminNavbar';
import { toast } from 'react-toastify';

const BloodTypeFilter = ({ selectedBloodType, onChange }) => {
  const bloodTypes = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="mb-4">
      <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">
        Blood Type
      </label>
      <select
        id="bloodType"
        value={selectedBloodType}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
      >
        {bloodTypes.map((type) => (
          <option key={type} value={type === 'All' ? '' : type}>
            {type}
          </option>
        ))}
      </select>
    </div>
  );
};

const StatusFilter = ({ selectedStatus, onChange }) => {
  const statuses = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' }
  ];

  return (
    <div className="mb-4">
      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
        Status
      </label>
      <select
        id="status"
        value={selectedStatus}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
      >
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const HospitalAdminBloodRequests = () => {
  const { hospitalAdmin } = useHospitalAdminAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [bloodType, setBloodType] = useState('');
  const [status, setStatus] = useState('');
  const [formData, setFormData] = useState({
    bloodType: 'A+',
    urgencyLevel: 'Normal',
    unitsNeeded: 1,
    contactNumber: '',
    contactEmail: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!hospitalAdmin) {
      navigate('/hospital-admin/login');
      return;
    }

    fetchBloodRequests();
  }, [hospitalAdmin, navigate, bloodType, status]);

  const fetchBloodRequests = async () => {
    try {
      setLoading(true);
      let url = `/api/hospital-admin/blood-requests`;
      const queryParams = [];
      
      if (bloodType) queryParams.push(`bloodType=${bloodType}`);
      if (status) queryParams.push(`status=${status}`);
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${hospitalAdmin.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blood requests');
      }

      const data = await response.json();
      setBloodRequests(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching blood requests:', err);
      setError('Failed to load blood requests. Please try again later.');
      toast.error('Error loading blood requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    
    try {
      setIsCreating(true);
      
      const response = await fetch('/api/hospital-admin/blood-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hospitalAdmin.token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create blood request');
      }
      
      const newRequest = await response.json();
      
      setBloodRequests(prevRequests => [newRequest, ...prevRequests]);
      setFormData({
        bloodType: 'A+',
        urgencyLevel: 'Normal',
        unitsNeeded: 1,
        contactNumber: '',
        contactEmail: ''
      });
      setShowCreateForm(false);
      toast.success('Blood request created successfully');
    } catch (err) {
      console.error('Error creating blood request:', err);
      toast.error(err.message || 'Failed to create blood request');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading && bloodRequests.length === 0) {
    return (
      <div>
        <HospitalAdminNavbar />
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-500 border-solid"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <HospitalAdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Blood Requests</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="mt-3 md:mt-0 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {showCreateForm ? 'Cancel' : 'Create New Request'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Create New Blood Request</h2>
            <form onSubmit={handleCreateRequest}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Type *
                  </label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="urgencyLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level *
                  </label>
                  <select
                    id="urgencyLevel"
                    name="urgencyLevel"
                    value={formData.urgencyLevel}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    {['Normal', 'Urgent', 'Critical'].map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="unitsNeeded" className="block text-sm font-medium text-gray-700 mb-1">
                    Units Needed *
                  </label>
                  <input
                    type="number"
                    id="unitsNeeded"
                    name="unitsNeeded"
                    min="1"
                    max="10"
                    value={formData.unitsNeeded}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Optional"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Optional - defaults to hospital admin email"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Request'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-medium text-gray-800 mb-4">Filters</h2>
              
              <BloodTypeFilter
                selectedBloodType={bloodType}
                onChange={setBloodType}
              />
              
              <StatusFilter
                selectedStatus={status}
                onChange={setStatus}
              />
              
              <button
                onClick={() => {
                  setBloodType('');
                  setStatus('');
                }}
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-800">Blood Requests</h2>
                {bloodRequests.length === 0 && !loading && (
                  <p className="text-gray-500 mt-2">No blood requests found.</p>
                )}
              </div>
              
              {bloodRequests.length > 0 && (
                <ul className="divide-y divide-gray-200">
                  {bloodRequests.map((request) => (
                    <li key={request._id || request.requestId} className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center">
                            <span className="text-lg font-medium text-gray-900">
                              Blood Type: {request.bloodType}
                            </span>
                            <span 
                              className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                request.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-800' : 
                                request.urgencyLevel === 'Urgent' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'
                              }`}
                            >
                              {request.urgencyLevel}
                            </span>
                          </div>
                          
                          <p className="mt-1 text-sm text-gray-500">
                            Posted: {new Date(request.datePosted).toLocaleString()}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Units Needed: {request.unitsNeeded}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Contact: {request.contactNumber || 'N/A'} | {request.email}
                          </p>
                        </div>
                        
                        <span 
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            request.accepted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {request.accepted ? 'Accepted' : 'Pending'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalAdminBloodRequests;