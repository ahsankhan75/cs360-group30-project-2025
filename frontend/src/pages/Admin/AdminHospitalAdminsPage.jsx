import React, { useState, useEffect } from 'react';
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { toast } from 'react-toastify';

const AdminHospitalAdminsPage = () => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { adminUser } = useAdminAuthContext();
  console.log('Admin user:', adminUser); // Debugging line

  useEffect(() => {
    const fetchPendingAdmins = async () => {
      if (!adminUser) return;

      try {
        setLoading(true);
        console.log('Fetching pending hospital admins...'); // Debugging line
        const response = await fetch('/api/admin/hospital-admins/pending', {
          headers: {
            'Authorization': `Bearer ${adminUser.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pending hospital admins');
        }

        const data = await response.json();
        console.log('Pending admins:', data); // Debugging line
        setPendingAdmins(data);
      } catch (err) {
        console.error('Error fetching pending admins:', err);
        setError('Failed to load pending hospital admin requests');
        toast.error('Failed to load pending requests');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingAdmins();
  }, [adminUser]);

  const handleStatusUpdate = async (adminId, newStatus) => {
    if (!adminUser) return;

    try {
      const response = await fetch(`/api/admin/hospital-admins/${adminId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminUser.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${newStatus} hospital admin`);
      }

      // Update local state to remove the approved/rejected admin
      setPendingAdmins(pendingAdmins.filter(admin => admin._id !== adminId));
      
      // Show success message
      toast.success(`Hospital admin ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      console.error('Error updating admin status:', err);
      toast.error(err.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-800">Hospital Admin Requests</h1>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Pending Hospital Admin Requests
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Review and approve hospital administrator accounts
                  </p>
                </div>
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {pendingAdmins.length} Pending
                </span>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500"></div>
                  <span className="ml-3 text-gray-600">Loading requests...</span>
                </div>
              ) : error ? (
                <div className="m-4 p-4 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              ) : pendingAdmins.length === 0 ? (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No pending requests</h3>
                  <p className="mt-1 text-gray-500">There are no hospital admin requests waiting for approval.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name / Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hospital
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Request Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingAdmins.map((admin) => (
                        <tr key={admin._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{admin.fullName}</div>
                            <div className="text-sm text-gray-500">{admin.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{admin.hospitalName || "Not specified"}</div>
                            <div className="text-sm text-gray-500">{admin.hospitalId || "ID not provided"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStatusUpdate(admin._id, 'approved')}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(admin._id, 'rejected')}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminHospitalAdminsPage;