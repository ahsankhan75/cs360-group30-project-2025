import { useState, useEffect } from 'react'
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext'
import { toast } from 'react-toastify'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { adminUser } = useAdminAuthContext()

  useEffect(() => {
    const fetchUsers = async () => {
      if (!adminUser) return

      try {
        setLoading(true)
        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${adminUser.token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch users')
        }

        setUsers(data)
      } catch (err) {
        setError(err.message)
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [adminUser])

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminUser.token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user')
      }

      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId))
      toast.success('User deleted successfully')
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="bg-white shadow-md rounded-lg p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">User Management</h2>
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full sm:w-auto pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 absolute left-2 sm:left-3 top-2 sm:top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-4 sm:py-6 md:py-8">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-3 sm:p-4 rounded-md text-xs sm:text-sm text-red-800">
          {error}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto responsive-table-container">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 w-1/4">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate" title={user.email}>
                          {user.email}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 w-1/4">
                        <div className="text-xs sm:text-sm text-gray-900 truncate" title={user.fullName || '-'}>
                          {user.fullName || '-'}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                        {user.isAdmin ? (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        ) : (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-center text-xs sm:text-sm text-gray-500">
                      {searchTerm ? 'No users found matching your search' : 'No users found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </>
      )}
    </div>
  )
}

export default UserManagement
