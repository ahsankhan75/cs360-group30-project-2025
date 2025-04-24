import React, { useState } from 'react';
import BloodRequestRow from './ BloodRequestRow';
import StarRating from '../components/Reviews/StarRating';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { toast } from 'react-toastify';

const BloodRequestTable = ({ data, onRowClick }) => {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const navigate = useNavigate();
  const { user, refreshUserToken } = useAuthContext();
  const [acceptingRequestId, setAcceptingRequestId] = useState(null);

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

  // Handle row click (navigate to detail page)
  const handleRowClick = (requestId) => {
    console.log("Clicked request ID:", requestId);
    if (onRowClick) {
      onRowClick(requestId);
    } else {
      navigate(`/blood-requests/${requestId}`);
    }
  };

  // Handle accept request
  const handleAcceptRequest = async (e, requestId) => {
    e.stopPropagation(); // Prevent row click event

    // Check if user is logged in
    if (!user) {
      toast.error('You must be logged in to accept a blood donation request');
      navigate('/login');
      return;
    }

    // Prevent multiple clicks while processing
    if (acceptingRequestId) return;

    setAcceptingRequestId(requestId);

    try {
      // First attempt with current token
      let res = await fetch(`/api/blood-requests/${requestId}/accept`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      let data = await res.json();

      // If token is expired, try to refresh and retry request
      if (res.status === 401 && data.code === 'TOKEN_EXPIRED') {
        const newToken = await refreshUserToken();

        if (newToken) {
          // Retry the request with the new token
          res = await fetch(`/api/blood-requests/${requestId}/accept`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newToken}`
            }
          });

          data = await res.json();
        } else {
          // Refresh failed, redirect to login
          navigate('/login');
          return;
        }
      }

      if (res.ok) {
        // Update the request in the data array
        const updatedData = data.map(req => {
          if (req.requestId === requestId) {
            return { ...req, userAccepted: true, hospitalApproved: 'pending' };
          }
          return req;
        });
        toast.success('Blood donation request accepted! Waiting for hospital approval.');
      } else {
        toast.error(data.error || 'Failed to accept request');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setAcceptingRequestId(null);
    }
  };

  return (
    <div className="w-full">
      {/* Table layout for large screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-auto text-md text-left">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              {columns.map(({ key, label }) => (
                <th
                  key={key}
                  className="px-6 py-4 font-medium text-sm text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center">
                    <span>{label}</span>
                    {sortConfig.key === key && (
                      <span className="ml-1 text-teal-600">
                        {sortConfig.direction === 'asc' ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 font-medium text-sm text-gray-600 uppercase tracking-wider text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginatedData.map((req) => (
              <BloodRequestRow key={req.requestId} request={req} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Card layout for small screens */}
      <div className="block md:hidden space-y-4">
        {paginatedData.map((req) => (
          <div
            key={req.requestId}
            className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-4 cursor-pointer" onClick={() => handleRowClick(req.requestId)}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{req.hospitalName}</h3>
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
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    req.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                    req.urgencyLevel === 'Urgent' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {req.urgencyLevel}
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Blood Type:</span>
                  <span className="ml-1 font-medium text-gray-900">{req.bloodType}</span>
                </div>
                <div>
                  <span className="text-gray-500">Units Needed:</span>
                  <span className="ml-1 font-medium text-gray-900">{req.unitsNeeded}</span>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <span className="ml-1 font-medium text-gray-900">{req.location}</span>
                </div>
                <div>
                  <span className="text-gray-500">Request ID:</span>
                  <span className="ml-1 font-medium text-gray-900">{req.requestId}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Posted:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {new Date(req.datePosted).toLocaleDateString()} {new Date(req.datePosted).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  req.userAccepted && req.hospitalApproved === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                  req.userAccepted && req.hospitalApproved === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                  req.userAccepted ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                  acceptingRequestId === req.requestId ? 'bg-gray-300 text-gray-700 cursor-not-allowed' :
                  'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                }`}
                disabled={req.userAccepted || acceptingRequestId === req.requestId}
                onClick={(e) => handleAcceptRequest(e, req.requestId)}
              >
                {req.userAccepted && req.hospitalApproved === 'approved' ? 'Accepted' :
                 req.userAccepted && req.hospitalApproved === 'rejected' ? 'Rejected' :
                 req.userAccepted ? 'Pending Approval' :
                 acceptingRequestId === req.requestId ? 'Processing...' : 'Accept Request'
                }
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-700 mb-4 sm:mb-0">
            Showing <span className="font-medium">{start + 1}</span> to <span className="font-medium">{Math.min(start + perPage, data.length)}</span> of <span className="font-medium">{data.length}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {totalPages <= 5 ? (
              <div className="flex space-x-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded-md ${
                      page === i + 1
                        ? 'bg-teal-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex space-x-2">
                {page > 1 && (
                  <button
                    onClick={() => setPage(1)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    1
                  </button>
                )}

                {page > 3 && <span className="px-2 py-1 text-gray-500">...</span>}

                {page > 2 && (
                  <button
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    {page - 1}
                  </button>
                )}

                <button
                  className="px-3 py-1 bg-teal-600 text-white rounded-md"
                >
                  {page}
                </button>

                {page < totalPages - 1 && (
                  <button
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    {page + 1}
                  </button>
                )}

                {page < totalPages - 2 && <span className="px-2 py-1 text-gray-500">...</span>}

                {page < totalPages && (
                  <button
                    onClick={() => setPage(totalPages)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    {totalPages}
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodRequestTable;