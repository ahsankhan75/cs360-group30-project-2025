import { useState, useEffect } from 'react'
import { useAdminAuthContext } from '../../hooks/useAdminAuthContext'
import AdminSidebar from '../../components/Admin/AdminSidebar'
import { Navigate } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'

const AdminDashboard = () => {
  const { adminUser } = useAdminAuthContext()
  const [stats, setStats] = useState({
    userCount: 0,
    hospitalCount: 0,
    reviewCount: 0,
    bloodRequestCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!adminUser) return

      setLoading(true)
      try {
        // In a full implementation, this would fetch data from a /api/admin/dashboard endpoint
        // For now, we'll use mock data
        setTimeout(() => {
          setStats({
            userCount: 142,
            hospitalCount: 28,
            reviewCount: 456,
            bloodRequestCount: 73
          })
          setLoading(false)
        }, 1000)
      } catch (err) {
        setError('Failed to load dashboard data')
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [adminUser])

  if (!adminUser) {
    return <Navigate to="/admin/login" />
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {loading ? (
            <LoadingSpinner message="Loading dashboard data..." />
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-500 text-white shadow rounded-lg p-6">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-medium">Total Users</h3>
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div className="text-4xl font-bold">{stats.userCount}</div>
                    <div className="mt-4">
                      <a href="/admin/users" className="text-sm hover:underline">View All Users</a>
                    </div>
                  </div>
                </div>

                <div className="bg-green-500 text-white shadow rounded-lg p-6">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-medium">Hospitals</h3>
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                    </div>
                    <div className="text-4xl font-bold">{stats.hospitalCount}</div>
                    <div className="mt-4">
                      <a href="/admin/hospitals" className="text-sm hover:underline">Manage Hospitals</a>
                    </div>
                  </div>
                </div>

                <div className="bg-red-500 text-white shadow rounded-lg p-6">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-medium">Blood Requests</h3>
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                      </svg>
                    </div>
                    <div className="text-4xl font-bold">{stats.bloodRequestCount}</div>
                    <div className="mt-4">
                      <a href="/admin/blood-requests" className="text-sm hover:underline">Manage Requests</a>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-500 text-white shadow rounded-lg p-6">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-medium">Reviews</h3>
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                      </svg>
                    </div>
                    <div className="text-4xl font-bold">{stats.reviewCount}</div>
                    <div className="mt-4">
                      <a href="/admin/reviews" className="text-sm hover:underline">Manage Reviews</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Recent Blood Requests</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <th className="px-4 py-2">Hospital</th>
                          <th className="px-4 py-2">Blood Type</th>
                          <th className="px-4 py-2">Urgency</th>
                          <th className="px-4 py-2">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-3">Bahawalpur Regional Medical Center</td>
                          <td className="px-4 py-3">A-</td>
                          <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Medium</span></td>
                          <td className="px-4 py-3">4/10/2025</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3">Peshawar</td>
                          <td className="px-4 py-3">A-</td>
                          <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Medium</span></td>
                          <td className="px-4 py-3">4/10/2025</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Recent Reviews</h3>
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">Larkana Central Clinic</h4>
                        <div className="flex text-yellow-400">
                          <span>★★★★</span><span className="text-gray-300">★</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">By: Uzair Khattak</p>
                      <p className="text-sm mt-2">My review for larkana 1</p>
                      <p className="text-xs text-gray-500 mt-1">4/20/2026</p>
                    </div>
                    <div className="border-b pb-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">Sukkur Central Medical Center</h4>
                        <div className="flex text-yellow-400">
                          <span>★★★★★</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">By: Salman Khan</p>
                      <p className="text-sm mt-2">Nice</p>
                      <p className="text-xs text-gray-500 mt-1">4/20/2026</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
