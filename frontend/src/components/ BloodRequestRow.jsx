

import React, { useState } from 'react';

const BloodRequestRow = ({ request }) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <tr className="hover:bg-gray-50 transition text-md">
      <td className="px-6 py-5 w-[14%]">{request.hospitalName}</td>
      <td className="px-6 py-5 w-[14%]">{request.requestId}</td>
      <td className="px-6 py-5 w-[10%]">{request.bloodType}</td>
      <td className="px-6 py-5 w-[14%]">{request.urgencyLevel}</td>
      <td className="px-6 py-5 w-[12%]">{request.location}</td>
      <td className="px-6 py-5 w-[20%]">
        {new Date(request.datePosted).toLocaleDateString()}
        <br />
        <span className="text-sm text-gray-500">
          {new Date(request.datePosted).toLocaleTimeString()}
        </span>
      </td>
      <td className="px-6 py-5 w-[8%] text-center font-bold">{request.unitsNeeded}</td>
      <td className="px-6 py-5 w-[8%] text-center">
        <button
          onClick={() => setAccepted(true)}
          disabled={accepted}
          className={`px-4 py-2 rounded text-sm font-medium transition ${
            accepted
              ? 'bg-green-100 text-green-700 cursor-default'
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