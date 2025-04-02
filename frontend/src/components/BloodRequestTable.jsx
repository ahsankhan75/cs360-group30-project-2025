

import BloodRequestRow from '/Users/salmanajmal/Desktop/SE/cs360-group30-project-2025-hospitalFilter/frontend/src/components/ BloodRequestRow.jsx';


import React, { useState } from 'react';


const BloodRequestTable = ({ data }) => {
  const [page, setPage] = useState(1);
  const perPage = 10;

  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paginatedData = data.slice(start, end);
  const totalPages = Math.ceil(data.length / perPage);

  return (
    <div className="w-full overflow-x-auto border rounded-lg">
      <table className="w-full table-auto text-md text-left">
        <thead className="bg-gray-100 text-gray-700 font-semibold">
          <tr>
            <th className="p-4">Hospital Name</th>
            <th className="p-4">Request ID</th>
            <th className="p-4">Blood Type</th>
            <th className="p-4">Urgency Level</th>
            <th className="p-4">Location</th>
            <th className="p-4">Date Posted</th>
            <th className="p-4">Units Needed</th>
            <th className="p-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((req, index) => (
            <React.Fragment key={req.requestId}>
              <BloodRequestRow request={req} />
              {index < paginatedData.length - 1 && (
                <tr>
                  <td colSpan="8">
                    <hr className="border-t border-gray-200 my-1" />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm p-4 bg-white border-t">
        <span>
          Showing {start + 1} to {Math.min(end, data.length)} of {data.length} entries
        </span>
        <div className="space-x-1">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            ‹
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-1 rounded border font-medium ${
                page === i + 1 ? 'bg-blue-100' : ''
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default BloodRequestTable;