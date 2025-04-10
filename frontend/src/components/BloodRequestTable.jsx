import React, { useState } from 'react';
import BloodRequestRow from './ BloodRequestRow';
import StarRating from '../components/Reviews/StarRating';

const BloodRequestTable = ({ data }) => {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Column definitions for consistent usage
  const columns = [
    { key: 'hospitalName', label: 'Hospital Name' },
    { key: 'hospitalRating', label: 'Rating' },
    { key: 'requestId', label: 'Request ID' },
    { key: 'bloodType', label: 'Blood Type' },
    { key: 'urgencyLevel', label: 'Urgency Level' },
    { key: 'location', label: 'Location' },
    { key: 'datePosted', label: 'Date Posted' },
    { key: 'unitsNeeded', label: 'Units Needed' }
  ];

  const handleSort = (key) => {
    if (sortConfig.key === key) {
      setSortConfig({ key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };

  const sortArrow = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const valA = sortConfig.key === 'hospitalRating' ? (a[sortConfig.key] || 0) : a[sortConfig.key];
    const valB = sortConfig.key === 'hospitalRating' ? (b[sortConfig.key] || 0) : b[sortConfig.key];

    if (typeof valA === 'number') {
      return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    }
    return sortConfig.direction === 'asc'
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const start = (page - 1) * perPage;
  const paginatedData = sortedData.slice(start, start + perPage);
  const totalPages = Math.ceil(data.length / perPage);

  return (
    <div className="w-full">
      {/* Table layout for large screens */}
      <div className="hidden md:block overflow-x-auto border rounded-lg">
        <table className="w-full table-auto text-md text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              {columns.map(({ key, label }) => (
                <th
                  key={key}
                  className="p-4 cursor-pointer"
                  onClick={() => handleSort(key)}
                >
                  {label} {sortArrow(key)}
                </th>
              ))}
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((req, index) => (
              <React.Fragment key={req.requestId}>
                <BloodRequestRow request={req} />
                {index < paginatedData.length - 1 && (
                  <tr>
                    <td colSpan="9">
                      <hr className="border-t border-gray-200 my-1" />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card layout for small screens */}
      <div className="block md:hidden space-y-4">
        {paginatedData.map((req) => (
          <div key={req.requestId} className="bg-white shadow rounded p-4 border">
            <div className="text-lg font-semibold mb-2">{req.hospitalName}</div>
            {/* Rating display for mobile */}
            <div className="flex items-center mb-2">
              <StarRating rating={req.hospitalRating || 0} />
              <span className="ml-2 text-sm text-gray-600">
                {req.hospitalRating ? req.hospitalRating.toFixed(1) : '-'}
              </span>
              {req.reviewCount > 0 && (
                <span className="ml-1 text-xs text-gray-500">
                  ({req.reviewCount})
                </span>
              )}
            </div>
            <div className="text-sm text-gray-700">
              <p><strong>ID:</strong> {req.requestId}</p>
              <p><strong>Blood Type:</strong> {req.bloodType}</p>
              <p><strong>Urgency:</strong> {req.urgencyLevel}</p>
              <p><strong>Location:</strong> {req.location}</p>
              <p><strong>Date:</strong> {new Date(req.datePosted).toLocaleString()}</p>
              <p><strong>Units:</strong> {req.unitsNeeded}</p>
            </div>
            <div className="mt-3 text-right">
              <button 
                className={`px-3 py-1 rounded ${
                  req.accepted ? 'bg-green-100 text-green-700' : 'bg-green-500 text-white hover:bg-green-600'
                } text-sm`}
                disabled={req.accepted}
              >
                {req.accepted ? 'Accepted' : 'Accept'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm p-4 bg-white border-t mt-2">
        <span>
          Showing {start + 1} to {Math.min(start + perPage, data.length)} of {data.length} entries
        </span>
        <div className="space-x-1">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            ‹
          </button>
          {totalPages <= 5 ? (
            [...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-1 rounded border ${
                  page === i + 1 ? 'bg-blue-100' : ''
                }`}
              >
                {i + 1}
              </button>
            ))
          ) : (
            <>
              {[...Array(Math.min(3, totalPages))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-1 rounded border ${
                    page === i + 1 ? 'bg-blue-100' : ''
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              {page > 3 && <span className="px-2">...</span>}
              {page > 3 && page < totalPages - 1 && (
                <button
                  onClick={() => setPage(page)}
                  className="px-4 py-1 rounded border bg-blue-100"
                >
                  {page}
                </button>
              )}
              {page < totalPages - 1 && <span className="px-2">...</span>}
              {page < totalPages && (
                <button
                  onClick={() => setPage(totalPages)}
                  className={`px-4 py-1 rounded border ${
                    page === totalPages ? 'bg-blue-100' : ''
                  }`}
                >
                  {totalPages}
                </button>
              )}
            </>
          )}
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
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