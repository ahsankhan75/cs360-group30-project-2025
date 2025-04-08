// import BloodRequestRow from '/Users/salmanajmal/Desktop/SE/New/cs360-group30-project-2025-hospitalFilter/frontend/src/components/ BloodRequestRow.jsx';

// import React, { useState } from 'react';


// const BloodRequestTable = ({ data }) => {
//   const [page, setPage] = useState(1);
//   const perPage = 10;

//   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

//   const handleSort = (key) => {
//     if (sortConfig.key === key) {
//       setSortConfig({ key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
//     } else {
//       setSortConfig({ key, direction: 'asc' });
//     }
//   };

//   // Sort data before pagination
//   const sortedData = [...data].sort((a, b) => {
//     if (!sortConfig.key) return 0;
//     const valA = a[sortConfig.key];
//     const valB = b[sortConfig.key];

//     if (typeof valA === 'number') {
//       return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
//     }

//     return sortConfig.direction === 'asc'
//       ? String(valA).localeCompare(String(valB))
//       : String(valB).localeCompare(String(valA));
//   });

//   const start = (page - 1) * perPage;
//   const end = start + perPage;
//   const paginatedData = sortedData.slice(start, end);
//   const totalPages = Math.ceil(data.length / perPage);

//   const sortArrow = (key) => {
//     if (sortConfig.key !== key) return '';
//     return sortConfig.direction === 'asc' ? '↑' : '↓';
//   };

//   return (
//     <div className="w-full overflow-x-auto border rounded-lg">
//       <table className="w-full table-auto text-md text-left">
//         <thead className="bg-gray-100 text-gray-700 font-semibold">
//           <tr>
//             <th className="p-4 cursor-pointer" onClick={() => handleSort('hospitalName')}>
//               Hospital Name {sortArrow('hospitalName')}
//             </th>
//             <th className="p-4 cursor-pointer" onClick={() => handleSort('requestId')}>
//               Request ID {sortArrow('requestId')}
//             </th>
//             <th className="p-4 cursor-pointer" onClick={() => handleSort('bloodType')}>
//               Blood Type {sortArrow('bloodType')}
//             </th>
//             <th className="p-4 cursor-pointer" onClick={() => handleSort('urgencyLevel')}>
//               Urgency Level {sortArrow('urgencyLevel')}
//             </th>
//             <th className="p-4 cursor-pointer" onClick={() => handleSort('location')}>
//               Location {sortArrow('location')}
//             </th>
//             <th className="p-4 cursor-pointer" onClick={() => handleSort('datePosted')}>
//               Date Posted {sortArrow('datePosted')}
//             </th>
//             <th className="p-4 cursor-pointer" onClick={() => handleSort('unitsNeeded')}>
//               Units Needed {sortArrow('unitsNeeded')}
//             </th>
//             <th className="p-4 text-center">Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {paginatedData.map((req, index) => (
//             <React.Fragment key={req.requestId}>
//               <BloodRequestRow request={req} />
//               {index < paginatedData.length - 1 && (
//                 <tr>
//                   <td colSpan="8">
//                     <hr className="border-t border-gray-200 my-1" />
//                   </td>
//                 </tr>
//               )}
//             </React.Fragment>
//           ))}
//         </tbody>
//       </table>

//       {/* Pagination */}
//       <div className="flex justify-between items-center text-sm p-4 bg-white border-t">
//         <span>
//           Showing {start + 1} to {Math.min(end, data.length)} of {data.length} entries
//         </span>
//         <div className="space-x-1">
//           <button
//             onClick={() => setPage(p => Math.max(p - 1, 1))}
//             disabled={page === 1}
//             className="px-3 py-1 border rounded disabled:opacity-40"
//           >
//             ‹
//           </button>
//           {[...Array(totalPages)].map((_, i) => (
//             <button
//               key={i}
//               onClick={() => setPage(i + 1)}
//               className={`px-4 py-1 rounded border font-medium ${
//                 page === i + 1 ? 'bg-blue-100' : ''
//               }`}
//             >
//               {i + 1}
//             </button>
//           ))}
//           <button
//             onClick={() => setPage(p => Math.min(p + 1, totalPages))}
//             disabled={page === totalPages}
//             className="px-3 py-1 border rounded disabled:opacity-40"
//           >
//             ›
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BloodRequestTable;

import React, { useState } from 'react';
import BloodRequestRow from './BloodRequestRow';


const BloodRequestTable = ({ data }) => {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];

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
              {['hospitalName', 'requestId', 'bloodType', 'urgencyLevel', 'location', 'datePosted', 'unitsNeeded'].map((key) => (
                <th
                  key={key}
                  className="p-4 cursor-pointer"
                  onClick={() => handleSort(key)}
                >
                  {key.replace(/([A-Z])/g, ' $1')} {sortArrow(key)}
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
                    <td colSpan="8">
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
            <div className="text-sm text-gray-700">
              <p><strong>ID:</strong> {req.requestId}</p>
              <p><strong>Blood Type:</strong> {req.bloodType}</p>
              <p><strong>Urgency:</strong> {req.urgencyLevel}</p>
              <p><strong>Location:</strong> {req.location}</p>
              <p><strong>Date:</strong> {new Date(req.datePosted).toLocaleString()}</p>
              <p><strong>Units:</strong> {req.unitsNeeded}</p>
            </div>
            <div className="mt-3 text-right">
              <button className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600 text-sm">
                Accept
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