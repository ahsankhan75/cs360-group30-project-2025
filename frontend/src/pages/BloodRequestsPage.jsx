

import React, { useEffect, useState } from 'react';
import BloodRequestList from '../components/BloodRequestList';

const BloodRequestsPage = () => {
  const [bloodRequests, setBloodRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blood-requests')
      .then((res) => res.json())
      .then((data) => {
        setBloodRequests(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching blood requests:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Blood Requests</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <BloodRequestList requests={bloodRequests} />
      )}
    </div>
  );
};

export default BloodRequestsPage;