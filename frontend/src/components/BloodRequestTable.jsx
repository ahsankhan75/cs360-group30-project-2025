import React, { useState, useEffect } from 'react';
import BloodRequestRow from './ BloodRequestRow';
import StarRating from '../components/Reviews/StarRating';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { toast } from 'react-toastify';

const BloodRequestTable = ({ data, onRowClick, onAccept }) => {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const navigate = useNavigate();
  const { user, refreshUserToken } = useAuthContext();
  const [acceptingRequestId, setAcceptingRequestId] = useState(null);

  // Reset page to 1 when data changes (e.g., when filters are applied)
  useEffect(() => {
    setPage(1);
  }, [data]);

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

      let responseData = await res.json();

      // If token is expired, try to refresh and retry request
      if (res.status === 401 && responseData.code === 'TOKEN_EXPIRED') {
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

          responseData = await res.json();
        } else {
          // Refresh failed, redirect to login
          navigate('/login');
          return;
        }
      }

      if (res.ok) {
        // Call the onAccept callback with the updated request
        if (onAccept) {
          onAccept(requestId, {
            userAccepted: true,
            hospitalApproved: 'pending'
        });
        }
        toast.success('Blood donation request accepted! Waiting for hospital approval.');
      } else {
        toast.error(responseData.error || 'Failed to accept request');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setAcceptingRequestId(null);
    }
  };

  return (
    <div className="w-full max-w-[98vw] mx-auto">
      {/* Table layout for large screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[1400px] table-auto text-md text-left">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              {columns.map(({ key, label }) => (
                <th
                  key={key}
                  className="px-8 py-4 font-medium text-sm text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
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
              <th className="px-8 py-4 font-medium text-sm text-gray-600 uppercase tracking-wider text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginatedData.map((req) => (
              <BloodRequestRow
                key={req.requestId}
                request={req}
                onAccept={(e) => handleAcceptRequest(e, req.requestId)}
              />
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
                <div className="flex flex-col items-end">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                    req.urgencyLevel === 'Urgent' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {req.urgencyLevel}
                  </span>
                  <span className="mt-1 text-sm font-medium text-gray-900">{req.bloodType}</span>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {req.location}
                </div>
                <div className="flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(req.datePosted).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={(e) => handleAcceptRequest(e, req.requestId)}
                disabled={req.userAccepted || acceptingRequestId === req.requestId}
                className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${req.userAccepted ? 'bg-gray-100 text-gray-500 cursor-not-allowed' :
                  acceptingRequestId === req.requestId ? 'bg-gray-300 text-gray-700 cursor-not-allowed' :
                    'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                {req.userAccepted ? 'Accepted' :
                  acceptingRequestId === req.requestId ? 'Processing...' :
                    'Accept Request'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pageNum
                  ? 'z-10 bg-teal-50 border-teal-500 text-teal-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                {pageNum}
                  </button>
                ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default BloodRequestTable;