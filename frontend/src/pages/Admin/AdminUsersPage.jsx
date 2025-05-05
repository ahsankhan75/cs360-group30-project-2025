import React, { useState, useEffect } from 'react';
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext';
import { toast } from 'react-toastify';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminHeader from '../../components/Admin/AdminHeader';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { admin } = useAdminAuthContext();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!admin) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${admin.token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [admin]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${admin.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Remove the deleted user from the state
      setUsers(users.filter(user => user._id !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Users Management" />

        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3 md:gap-4">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Manage Users</h1>

              <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 sm:gap-3">
                <div className="relative w-full sm:w-64 md:w-72">
                  <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>


              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-2 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-5">
                <p className="text-xs sm:text-sm md:text-base text-red-700">{error}</p>
              </div>
            )}

            <div className="bg-white shadow rounded-lg">
              {loading ? (
                <div className="text-center py-4 sm:py-6 md:py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 border-t-2 border-b-2 border-teal-600"></div>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-600">Loading users...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto responsive-table-container">
                    {filteredUsers.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-center text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-center text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredUsers.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                              <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 w-1/4">
                                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate" title={user.email}>
                                  {user.email}
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 w-1/4">
                                <div className="text-xs sm:text-sm text-gray-900 truncate" title={user.fullName || 'N/A'}>
                                  {user.fullName || 'N/A'}
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                                <div className="text-xs sm:text-sm text-gray-500">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-center">
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Active
                                </span>
                              </td>
                              <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-center text-xs sm:text-sm font-medium">
                                <button
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-4 sm:py-6 md:py-8 bg-gray-50 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto text-gray-400 mb-2 sm:mb-3 md:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No users found</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 md:mb-4">
                          {searchTerm ? 'Try adjusting your search' : 'No users found in the system'}
                        </p>
                      </div>
                    )}
                  </div>

                  {filteredUsers.length > 0 && (
                    <div className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm text-gray-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 p-2 sm:p-3 md:p-4">
                      <span>Showing {filteredUsers.length} of {users.length} users</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminUsersPage;
