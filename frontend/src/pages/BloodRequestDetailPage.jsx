// src/pages/BloodRequestDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const BloodRequestDetailPage = () => {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blood-requests/${requestId}`)
      .then(res => res.json())
      .then(data => {
        setRequest(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [requestId]);

  if (loading) {
    return <div className="p-8">Loading request details...</div>;
  }

  if (!request) {
    return <div className="p-8">Request not found.</div>;
  }

  // Format your date, etc.
  const dateStr = new Date(request.datePosted).toLocaleDateString();

  return (
    <div className="p-8 max-w-screen-xl mx-auto">
      <h1 className="text-3xl font-bold text-teal-500 mb-4">Blood Donation Requests</h1>
      <div className="text-md text-gray-600 mb-4">Hospital Information</div>

<div className="bg-orange-100 shadow-lg rounded p-6 mb-6">        <h2 className="text-2xl font-semibold mb-2">{request.hospitalName}</h2>
        <p className="text-gray-700 mb-2">
          <strong>Blood Type Required:</strong> {request.bloodType}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Units Needed:</strong> {request.unitsNeeded}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Urgency Level:</strong> {request.urgencyLevel}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Date Posted:</strong> {dateStr}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>City:</strong> {request.location}
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Request ID:</strong> {request.requestId}
        </p>
        {/* If your data has contact info: */}
        <p className="text-gray-700 mb-2">
          <strong>Contact Number:</strong> {request.contactNumber || '+92xxxxxxx'}
        </p>
        <p className="text-gray-700 mb-4">
          <strong>Email Address:</strong> {request.email || 'donations@example.com'}
        </p>

        {/* Accept Button */}
        <button className="px-4 py-2 bg-green-500 text-white font-medium rounded hover:bg-green-600">
          Accept
        </button>
      </div>

      {/* Footer (Optional) */}
      <footer className="text-center text-gray-500 text-sm mt-10">
        EMCON <br />
        Smart healthcare navigation for everyone!
      </footer>
    </div>
  );
};

export default BloodRequestDetailPage;