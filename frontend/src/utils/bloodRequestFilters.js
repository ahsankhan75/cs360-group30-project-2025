// Utility functions for blood request filtering

// Haversine formula to calculate distance between two points
export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => deg * (Math.PI / 180);
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// City coordinates lookup for fallback
export const cityCoordinates = {
  'Lahore': { lat: 31.5204, lon: 74.3587 },
  'Karachi': { lat: 24.8607, lon: 67.0011 },
  'Islamabad': { lat: 33.6844, lon: 73.0479 },
  'Rawalpindi': { lat: 33.5651, lon: 73.0169 },
  'Faisalabad': { lat: 31.4504, lon: 73.135 },
  'Multan': { lat: 30.1575, lon: 71.5249 },
  'Peshawar': { lat: 34.0151, lon: 71.5249 },
  'Quetta': { lat: 30.1798, lon: 66.975 },
  'Sialkot': { lat: 32.4945, lon: 74.5229 },
  'Gujranwala': { lat: 32.1877, lon: 74.1945 },
  'Bahawalpur': { lat: 29.3956, lon: 71.6836 },
  'Hyderabad': { lat: 25.396, lon: 68.3578 },
  'Sukkur': { lat: 27.7052, lon: 68.8574 },
  'Abbottabad': { lat: 34.1463, lon: 73.2117 },
  'Mardan': { lat: 34.1982, lon: 72.0459 }
};

// Get coordinates for a city name
export const getCityCoordinates = (locationName) => {
  if (!locationName) return null;
  
  // Direct match
  if (cityCoordinates[locationName]) {
    return cityCoordinates[locationName];
  }
  
  // Partial match
  const cityName = Object.keys(cityCoordinates).find(city => 
    locationName.toLowerCase().includes(city.toLowerCase())
  );
  
  return cityName ? cityCoordinates[cityName] : null;
};

// Filter requests by various criteria
export const filterRequests = (requests, filters) => {
  const { 
    search = '', 
    bloodType = '', 
    urgency = '',
    nearMe = false, 
    userLocation = null, 
    maxDistance = 50,  // default 50km radius
    dateRange = null
  } = filters;
  
  return requests.filter(req => {
    // Text search
    if (search && !req.hospitalName.toLowerCase().includes(search.toLowerCase()) &&
        !req.location.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    // Blood type filter
    if (bloodType && req.bloodType !== bloodType) {
      return false;
    }
    
    // Urgency level filter
    if (urgency && req.urgencyLevel !== urgency) {
      return false;
    }
    
    // Date range filter
    if (dateRange && dateRange.from && dateRange.to) {
      const reqDate = new Date(req.datePosted);
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      if (reqDate < from || reqDate > to) {
        return false;
      }
    }
    
    // Location-based filter (near me)
    if (nearMe && userLocation) {
      let requestLat = req.latitude;
      let requestLon = req.longitude;
      
      // If the request doesn't have coordinates, try to extract them from location
      if (!requestLat || !requestLon) {
        const cityCoords = getCityCoordinates(req.location);
        if (cityCoords) {
          requestLat = cityCoords.lat;
          requestLon = cityCoords.lon;
        } else {
          // If we can't determine location, exclude from near-me results
          return false;
        }
      }
      
      // Calculate distance
      const distance = getDistanceFromLatLonInKm(
        userLocation.latitude, 
        userLocation.longitude, 
        requestLat, 
        requestLon
      );
      
      if (distance > maxDistance) {
        return false;
      }
    }
    
    // If all filters pass, include this request
    return true;
  });
};
