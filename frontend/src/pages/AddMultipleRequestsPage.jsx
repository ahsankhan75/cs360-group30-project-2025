import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cityCoordinates = {
  Lahore: { lat: 31.5204, lon: 74.3587 },
  Karachi: { lat: 24.8607, lon: 67.0011 },
  Islamabad: { lat: 33.6844, lon: 73.0479 },
  Rawalpindi: { lat: 33.5651, lon: 73.0169 },
  Faisalabad: { lat: 31.4504, lon: 73.135 },
  Multan: { lat: 30.1575, lon: 71.5249 },
  Peshawar: { lat: 34.0151, lon: 71.5249 },
  Quetta: { lat: 30.1798, lon: 66.975 },
  Sialkot: { lat: 32.4945, lon: 74.5229 },
  Gujranwala: { lat: 32.1877, lon: 74.1945 },
  Bahawalpur: { lat: 29.3956, lon: 71.6836 },
  Hyderabad: { lat: 25.396, lon: 68.3578 },
  Sukkur: { lat: 27.7052, lon: 68.8574 },
  Abbottabad: { lat: 34.1463, lon: 73.2117 },
  Mardan: { lat: 34.1982, lon: 72.0459 },
  Okara: { lat: 30.8138, lon: 73.445 },
  RahimYarKhan: { lat: 28.4202, lon: 70.2956 },
  Jhelum: { lat: 32.9408, lon: 73.7276 },
  Sargodha: { lat: 32.0836, lon: 72.6711 },
  Mirpur: { lat: 33.1478, lon: 73.751 },
};

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const urgencyLevels = ['Low', 'Medium', 'High'];
const generateId = () => Math.random().toString(36).substring(2, 10);

const AddMultipleRequestsPage = () => {
  const [requests, setRequests] = useState([
    {
      requestId: generateId(),
      hospitalName: '',
      bloodType: '',
      urgencyLevel: '',
      location: '',
      datePosted: new Date().toISOString(),
      unitsNeeded: '',
      latitude: '',
      longitude: '',
    },
  ]);

  const [hospitals, setHospitals] = useState([]);
  const [submitted, setSubmitted] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Create options for the searchable dropdowns
  const bloodTypeOptions = bloodTypes.map(type => ({ value: type, label: type }));
  const urgencyOptions = urgencyLevels.map(level => ({ 
    value: level, 
    label: level,
    className: level === 'High' ? 'text-red-600' : level === 'Medium' ? 'text-amber-600' : 'text-green-600'
  }));
  const locationOptions = Object.keys(cityCoordinates).map(city => ({ value: city, label: city }));

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('/api/hospitals/names');
        if (response.ok) {
          const data = await response.json();
          setHospitals(data);
        }
      } catch (err) {
        console.error('Error fetching hospitals:', err);
      }
    };

    fetchHospitals();

    const fetchMyRequests = async () => {
      setIsLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token;
        if (!token) return;

        const response = await fetch('/api/blood-requests/mine', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setSubmitted(data);
      } catch (error) {
        console.error('Error fetching your requests:', error);
        // Show a more user-friendly error message
        toast.error('Failed to load your blood donation requests. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyRequests();
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...requests];
    updated[index][field] = value;

    if (field === 'location' && cityCoordinates[value]) {
      updated[index].latitude = cityCoordinates[value].lat;
      updated[index].longitude = cityCoordinates[value].lon;
    }

    setRequests(updated);
  };

  const addRow = () => {
    setRequests([
      ...requests,
      {
        requestId: generateId(),
        hospitalName: '',
        bloodType: '',
        urgencyLevel: '',
        location: '',
        datePosted: new Date().toISOString(),
        unitsNeeded: '',
        latitude: '',
        longitude: '',
      },
    ]);
  };

  const validateForm = () => {
    const errors = requests.map((req) => {
      const err = {};
      if (!req.hospitalName) err.hospitalName = 'Hospital name is required';
      if (!req.bloodType) err.bloodType = 'Blood type is required';
      if (!req.urgencyLevel) err.urgencyLevel = 'Urgency level is required';
      if (!req.location) err.location = 'Location is required';
      if (!req.unitsNeeded || req.unitsNeeded <= 0) err.unitsNeeded = 'Enter valid units';
      return err;
    });

    setValidationErrors(errors);
    return errors.every((err) => Object.keys(err).length === 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix validation errors before submitting.');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;
    if (!token) {
      toast.error('You must be logged in to submit requests.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/blood-requests/multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requests),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success('Requests submitted successfully!');
        setSubmitted((prev) => [...prev, ...result]);
        setRequests([
          {
            requestId: generateId(),
            hospitalName: '',
            bloodType: '',
            urgencyLevel: '',
            location: '',
            datePosted: new Date().toISOString(),
            unitsNeeded: '',
            latitude: '',
            longitude: '',
          },
        ]);
        setValidationErrors([]);
      } else {
        toast.error('Error: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/blood-requests/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSubmitted((prev) => prev.filter((r) => r.requestId !== id));
        toast.success('Request deleted successfully');
      } else {
        toast.error('Failed to delete request.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting request');
    } finally {
      setIsLoading(false);
    }
  };

  const removeRow = (index) => {
    if (requests.length === 1) {
      toast.info("You need at least one request form");
      return;
    }
    const updated = [...requests];
    updated.splice(index, 1);
    setRequests(updated);
  };

  const filteredSubmitted = submitted.filter(req => 
    req.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.bloodType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hospitalOptions = hospitals.map(hospital => ({ 
    value: hospital.name, 
    label: hospital.name
  }));

  return (
    <div className="p-4 md:p-8 max-w-screen-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-teal-600">Blood Donation Requests Management</h1>
        {isLoading && (
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-600"></div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Request(s)</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {requests.map((req, index) => {
            const errors = validationErrors[index] || {};
            return (
              <div key={index} className="border rounded-lg p-4 bg-gray-50 space-y-4 relative">
                <button 
                  type="button" 
                  onClick={() => removeRow(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  title="Remove this request"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                    <Select
                      options={hospitalOptions}
                      placeholder="Select hospital"
                      isClearable
                      className={errors.hospitalName ? 'border-red-500 rounded' : ''}
                      onChange={(option) => handleChange(index, 'hospitalName', option ? option.value : '')}
                    />
                    {errors.hospitalName && <p className="text-red-500 text-xs mt-1">{errors.hospitalName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                    <Select
                      options={bloodTypeOptions}
                      placeholder="Select blood type"
                      isClearable
                      className={errors.bloodType ? 'border-red-500 rounded' : ''}
                      onChange={(option) => handleChange(index, 'bloodType', option ? option.value : '')}
                    />
                    {errors.bloodType && <p className="text-red-500 text-xs mt-1">{errors.bloodType}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
                    <Select
                      options={urgencyOptions}
                      placeholder="Select urgency level"
                      isClearable
                      className={errors.urgencyLevel ? 'border-red-500 rounded' : ''}
                      onChange={(option) => handleChange(index, 'urgencyLevel', option ? option.value : '')}
                      formatOptionLabel={option => (
                        <span className={option.className}>{option.label}</span>
                      )}
                    />
                    {errors.urgencyLevel && <p className="text-red-500 text-xs mt-1">{errors.urgencyLevel}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <Select
                      options={locationOptions}
                      placeholder="Select location"
                      isClearable
                      className={errors.location ? 'border-red-500 rounded' : ''}
                      onChange={(option) => handleChange(index, 'location', option ? option.value : '')}
                    />
                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Units Needed</label>
                    <input
                      type="number"
                      min="1"
                      className={`border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.unitsNeeded ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter number of units"
                      value={req.unitsNeeded}
                      onChange={(e) => handleChange(index, 'unitsNeeded', e.target.value)}
                    />
                    {errors.unitsNeeded && <p className="text-red-500 text-xs mt-1">{errors.unitsNeeded}</p>}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 mr-2">ID: {req.requestId}</span>
                  {req.latitude && req.longitude && (
                    <span className="inline-block bg-gray-200 rounded-full px-3 py-1 mr-2">
                      GPS: {req.latitude.toFixed(4)}, {req.longitude.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap gap-4 justify-between items-center">
            <button 
              type="button" 
              onClick={addRow}
              className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Another Request
            </button>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Submit All Requests
            </button>
          </div>
        </form>
      </div>

      {submitted.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold">Your Submitted Requests</h2>
            <div className="w-full md:w-64">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search requests..."
                  className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Hospital</th>
                  <th className="px-4 py-3 text-left">Blood Type</th>
                  <th className="px-4 py-3 text-left">Urgency</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-center">Units</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubmitted.length > 0 ? (
                  filteredSubmitted.map((req) => (
                    <tr key={req.requestId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{req.hospitalName}</td>
                      <td className="px-4 py-3 text-center font-medium">{req.bloodType}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          req.urgencyLevel === 'High' ? 'bg-red-100 text-red-700' : 
                          req.urgencyLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                          'bg-green-100 text-green-700'
                        }`}>
                          {req.urgencyLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3">{req.location}</td>
                      <td className="px-4 py-3 text-center">{req.unitsNeeded}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(req.datePosted).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center">
                        {req.accepted ? (
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">Accepted</span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(req.requestId)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Delete request"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                      {searchTerm ? 'No matching requests found.' : 'No submitted requests yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default AddMultipleRequestsPage;