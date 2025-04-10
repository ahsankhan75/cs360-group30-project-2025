import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProfileIcon from '../components/profile-icon';
import StarRating from '../components/Reviews/StarRating';
import { formatDistanceToNow } from 'date-fns';

const BloodDonationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hospitals, setHospitals] = useState({});
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/blood-requests');
        const data = await response.json();
        
        if (response.ok) {
          setRequests(data);
          // Extract unique hospital names
          const uniqueHospitalNames = [...new Set(data.map(req => req.hospitalName))];
          fetchHospitalDetails(uniqueHospitalNames);
        } else {
          setError('Failed to fetch blood donation requests');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Fetch hospital details including ratings
  const fetchHospitalDetails = async (hospitalNames) => {
    try {
      const response = await fetch('/api/hospitals/names');
      const allHospitals = await response.json();
      
      if (response.ok) {
        // Create a map of hospital name to hospital details
        const hospitalMap = {};
        allHospitals.forEach(hospital => {
          hospitalMap[hospital.name] = hospital;
        });
        
        setHospitals(hospitalMap);
      }
    } catch (err) {
      console.error('Error fetching hospital details:', err);
    }
  };

  const getHospitalRating = (hospitalName) => {
    if (hospitals[hospitalName]) {
      return hospitals[hospitalName].ratings || 0;
    }
    return 0;
  };

  const getHospitalId = (hospitalName) => {
    return hospitals[hospitalName]?._id || '';
  };

  // Apply filters to requests
  const filteredRequests = requests.filter(request => {
    let matchesBloodType = true;
    let matchesLocation = true;
    let matchesUrgency = true;
    
    if (bloodTypeFilter) {
      matchesBloodType = request.bloodType === bloodTypeFilter;
    }
    
    if (locationFilter) {
      matchesLocation = request.location.toLowerCase().includes(locationFilter.toLowerCase());
    }
    
    if (urgencyFilter) {
      matchesUrgency = request.urgencyLevel === urgencyFilter;
    }
    
    return matchesBloodType && matchesLocation && matchesUrgency;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 font-medium">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="relative z-50">
        <ProfileIcon />
      </div>
      
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <h1 className="text-3xl font-bold text-teal-600">Blood Donation Requests</h1>
          <Link 
            to="/add-request" 
            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
          >
            Add New Request
          </Link>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="font-semibold mb-3">Filter Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Blood Type</label>
              <select 
                value={bloodTypeFilter} 
                onChange={(e) => setBloodTypeFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Blood Types</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Location</label>
              <input 
                type="text" 
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Filter by location..."
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1">Urgency Level</label>
              <select 
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Urgency Levels</option>
                {['Normal', 'Urgent', 'Critical'].map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <Link 
                to={`/blood-requests/${request.requestId}`} 
                key={request.requestId}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">
                      {request.bloodType}
                    </div>
                    <div className={`px-3 py-1 rounded-full font-medium ${
                      request.urgencyLevel === 'Critical' 
                        ? 'bg-red-100 text-red-800' 
                        : request.urgencyLevel === 'Urgent' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {request.urgencyLevel}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold mt-3">{request.hospitalName}</h2>
                  
                  <div className="mt-2 flex items-center">
                    <StarRating rating={getHospitalRating(request.hospitalName)} />
                    <span className="ml-2 text-sm text-gray-600">
                      {getHospitalRating(request.hospitalName).toFixed(1)}
                    </span>
                    <span className="ml-1 text-xs text-gray-500">
                      ({hospitals[request.hospitalName]?.reviewCount || 0})
                    </span>
                    <Link 
                      to={`/reviews?hospital=${getHospitalId(request.hospitalName)}`} 
                      onClick={(e) => e.stopPropagation()}
                      className="ml-auto text-xs text-teal-600 hover:underline"
                    >
                      View Reviews
                    </Link>
                  </div>
                  
                  <div className="mt-3 text-gray-600">
                    <p><span className="font-medium">Location:</span> {request.location}</p>
                    <p><span className="font-medium">Units Needed:</span> {request.unitsNeeded}</p>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-500">
                    Posted {formatDistanceToNow(new Date(request.datePosted), { addSuffix: true })}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
              No blood donation requests found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloodDonationRequests;
