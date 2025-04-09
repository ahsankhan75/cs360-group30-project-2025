import React, { useState } from 'react';
import ProfileIcon from "../components/profile-icon";
import React, { useState, useEffect } from 'react';

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

  const [submitted, setSubmitted] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    const fetchMyRequests = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      if (!token) return;

      try {
        const res = await fetch('/api/blood-requests/mine', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setSubmitted(data);
        } else {
          console.error('Error loading requests:', data.message);
        }
      } catch (err) {
        console.error('Fetch error:', err);
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
      alert('Please fix validation errors before submitting.');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;
    if (!token) return alert('You must be logged in.');

    try {
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
        alert('Requests submitted successfully!');
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
        alert('Error: ' + result.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit requests');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/blood-requests/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSubmitted((prev) => prev.filter((r) => r.requestId !== id));
      } else {
        alert('Failed to delete request.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-screen-lg mx-auto">
       <ProfileIcon />
      <h1 className="text-3xl font-bold mb-6 text-teal-500">Add Multiple Blood Requests</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {requests.map((req, index) => {
          const errors = validationErrors[index] || {};
          return (
            <div key={index} className="border p-4 rounded bg-white shadow space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    className={`border p-2 rounded w-full ${errors.hospitalName ? 'border-red-500' : ''}`}
                    placeholder="Hospital Name"
                    value={req.hospitalName}
                    onChange={(e) => handleChange(index, 'hospitalName', e.target.value)}
                  />
                  {errors.hospitalName && <p className="text-red-500 text-sm">{errors.hospitalName}</p>}
                </div>

                <div>
                  <select
                    className={`border p-2 rounded w-full ${errors.bloodType ? 'border-red-500' : ''}`}
                    value={req.bloodType}
                    onChange={(e) => handleChange(index, 'bloodType', e.target.value)}
                  >
                    <option value="">Select Blood Type</option>
                    {bloodTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                  {errors.bloodType && <p className="text-red-500 text-sm">{errors.bloodType}</p>}
                </div>

                <div>
                  <select
                    className={`border p-2 rounded w-full ${errors.urgencyLevel ? 'border-red-500' : ''}`}
                    value={req.urgencyLevel}
                    onChange={(e) => handleChange(index, 'urgencyLevel', e.target.value)}
                  >
                    <option value="">Select Urgency</option>
                    {urgencyLevels.map((level) => (
                      <option key={level}>{level}</option>
                    ))}
                  </select>
                  {errors.urgencyLevel && <p className="text-red-500 text-sm">{errors.urgencyLevel}</p>}
                </div>

                <div>
                  <select
                    className={`border p-2 rounded w-full ${errors.location ? 'border-red-500' : ''}`}
                    value={req.location}
                    onChange={(e) => handleChange(index, 'location', e.target.value)}
                  >
                    <option value="">Select Location</option>
                    {Object.keys(cityCoordinates).map((city) => (
                      <option key={city}>{city}</option>
                    ))}
                  </select>
                  {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                </div>

                <div>
                  <input
                    type="number"
                    className={`border p-2 rounded w-full ${errors.unitsNeeded ? 'border-red-500' : ''}`}
                    placeholder="Units Needed"
                    value={req.unitsNeeded}
                    onChange={(e) => handleChange(index, 'unitsNeeded', e.target.value)}
                  />
                  {errors.unitsNeeded && <p className="text-red-500 text-sm">{errors.unitsNeeded}</p>}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                ID: {req.requestId} | Lat: {req.latitude} | Lon: {req.longitude} | Posted:{' '}
                {new Date(req.datePosted).toLocaleString()}
              </div>
            </div>
          );
        })}

        <div className="flex gap-4">
          <button type="button" onClick={addRow} className="px-4 py-2 bg-yellow-500 text-white rounded">
            Add Another
          </button>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
            Submit Requests
          </button>
        </div>
      </form>

      {submitted.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Your Submitted Requests</h2>
          <table className="w-full table-auto text-sm bg-white border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Hospital</th>
                <th className="px-4 py-2">Blood Type</th>
                <th className="px-4 py-2">Urgency</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Units</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submitted.map((req) => (
                <tr key={req.requestId} className="border-t">
                  <td className="px-4 py-2">{req.requestId}</td>
                  <td className="px-4 py-2">{req.hospitalName}</td>
                  <td className="px-4 py-2">{req.bloodType}</td>
                  <td className="px-4 py-2">{req.urgencyLevel}</td>
                  <td className="px-4 py-2">{req.location}</td>
                  <td className="px-4 py-2">{req.unitsNeeded}</td>
                  <td className="px-4 py-2">{new Date(req.datePosted).toLocaleString()}</td>
                  <td className="px-4 py-2">
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDelete(req.requestId)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AddMultipleRequestsPage;