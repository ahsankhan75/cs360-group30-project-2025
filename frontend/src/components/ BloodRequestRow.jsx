
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BloodRequestRow = ({ request }) => {
  const [accepted, setAccepted] = useState(request.accepted); 
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/requests/${request.requestId}`);
  };

  const handleAccept = async (e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/blood-requests/${request.requestId}/accept`, {
        method: 'PATCH'
      });
      if (res.ok) setAccepted(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <tr
      onClick={handleRowClick}
      className="cursor-pointer transition duration-200 hover:bg-gray-300"
    >
      <td className="p-4">{request.hospitalName}</td>
      <td className="p-4">{request.requestId}</td>
      <td className="p-4">{request.bloodType}</td>
      <td className="p-4">{request.urgencyLevel}</td>
      <td className="p-4">{request.location}</td>
      <td className="p-4">
        {new Date(request.datePosted).toLocaleDateString()}
        <br />
        <span className="text-sm text-gray-500">
          {new Date(request.datePosted).toLocaleTimeString()}
        </span>
      </td>
      <td className="p-4 text-center">{request.unitsNeeded}</td>
      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleAccept}
          disabled={accepted}
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            accepted
              ? 'bg-green-100 text-green-700'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {accepted ? 'Accepted' : 'Accept'}
        </button>
      </td>
    </tr>
  );
};

export default BloodRequestRow;