
import React, { useState } from 'react';

const BloodRequestItem = ({ request }) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
  };

  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="text-xl font-semibold">{request.hospitalName}</h2>
      <p className="text-gray-600">Request ID: {request.requestId}</p>
      <p className="text-gray-600">Blood Type: {request.bloodType}</p>
      <p className="text-gray-600">Urgency Level: {request.urgencyLevel}</p>
      <p className="text-gray-600">Location: {request.location}</p>
      <p className="text-gray-600">
        Date Posted: {new Date(request.datePosted).toLocaleString()}
      </p>
      <p className="text-gray-600">Units Needed: {request.unitsNeeded}</p>
      <div className="mt-2 flex justify-end">
        <button
          onClick={handleAccept}
          disabled={accepted}
          className={`px-4 py-2 rounded ${accepted
              ? 'bg-green-300 text-white'
              : 'bg-green-500 text-white hover:bg-green-600'
            }`}
        >
          {accepted ? 'Accepted' : 'Accept'}
        </button>
      </div>
      <hr className="mt-4" />
    </div>
  );
};

export default BloodRequestItem;