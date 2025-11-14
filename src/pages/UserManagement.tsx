import { useEffect, useState } from 'react'
/*
  Temporary: allow explicit any in this file while using fallback helpers.
  Plan: centralize normalization in API helpers and remove this directive.
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { getUsersWithFallback, updateUserStatus, getUserWithFallback } from '../utils/userAPI'
import type { User } from '../utils/userAPI'

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Per-row action loading (show spinner on the button that's performing an action)
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null)

  // Use SweetAlert2 to show a confirmation / (optional) reason input for suspension
  const handleSuspend = async (user: User) => {
    const result = await Swal.fire({
      title: `Suspend ${user.name}?`,
      input: 'textarea',
      inputLabel: 'Reason (optional)',
      inputPlaceholder: 'Why are you suspending this user? (optional)',
      showCancelButton: true,
      confirmButtonText: 'Suspend',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      reverseButtons: true,
      preConfirm: (value: any) => value ?? '',
    })

    if (!result.isConfirmed) return

    const reason = result.value || undefined
    try {
      setActionLoadingId(user.id)
      const resp = await updateUserStatus(user.id, 'suspended', reason)
      if (resp?.data?.user) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? resp.data.user : u)))
      }
      await Swal.fire('Suspended', `${user.name} has been suspended.`, 'success')
    } catch (err) {
      console.error('Failed to suspend user', err)
      setError(err instanceof Error ? err.message : 'Failed to suspend user')
      Swal.fire('Error', err instanceof Error ? err.message : 'Failed to suspend user', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleActivate = async (user: User) => {
    const confirmed = await Swal.fire({
      title: `Activate ${user.name}?`,
      text: 'This will restore access for the user.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Activate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#16a34a',
    })

    if (!confirmed.isConfirmed) return

    try {
      setActionLoadingId(user.id)
      const resp = await updateUserStatus(user.id, 'active')
      if (resp?.data?.user) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? resp.data.user : u)))
      }
      await Swal.fire('Activated', `${user.name} is now active.`, 'success')
    } catch (err) {
      console.error('Failed to activate user', err)
      setError(err instanceof Error ? err.message : 'Failed to activate user')
      Swal.fire('Error', err instanceof Error ? err.message : 'Failed to activate user', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleViewDetails = async (userId: string | number) => {
    try {
      setActionLoadingId(userId)
      const resp = await getUserWithFallback(userId)
      if (resp?.data?.user) {
        const u = resp.data.user as any
        const html = `
          <div class="text-left">
            <p><strong>Name:</strong> ${u.name || '—'}</p>
            <p><strong>Status:</strong> ${u.status || '—'}</p>
            <p><strong>Roles:</strong> ${(Array.isArray(u.roles) ? u.roles.map((r: any) => r.name).join(', ') : '—')}</p>
            <p><strong>Bookings:</strong> ${u.bookings_count ?? '—'}</p>
            <p><strong>Created:</strong> ${u.created_at ? new Date(u.created_at).toLocaleString() : '—'}</p>
          </div>
        `
        await Swal.fire({
          title: `User details: ${u.name || userId}`,
          html,
          width: '600px',
        })
      } else {
        Swal.fire('Not found', 'User details not available', 'info')
      }
    } catch (err) {
      console.error('Failed to fetch user details', err)
      Swal.fire('Error', err instanceof Error ? err.message : 'Failed to fetch user details', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  const perPage = 5

  // Use React Query to fetch users with pagination and filters
  const { data: uq, isLoading: qLoading, error: qError, refetch } = useQuery({
    queryKey: ['adminUsers', { page: currentPage, perPage, search: searchTerm, role: roleFilter }],
    queryFn: () => getUsersWithFallback(currentPage, perPage, searchTerm || undefined, roleFilter || undefined),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  useEffect(() => {
    const response = uq as any
    if (response?.data) {
      const normalizeUser = (u: any) => ({
        id: u.id,
        name: u.name || u.full_name || u.username || 'Unknown',
        email: u.email || u.email_address || (u.contact && u.contact.email) || '',
        status: u.status,
        email_verified_at: u.email_verified_at,
        created_at: u.created_at,
        updated_at: u.updated_at,
      }) as User

      const items: User[] = (response.data.items || []).map(normalizeUser)
      const missingEmailCount = items.filter((x) => !x.email).length
      if (missingEmailCount > 0) {
        console.info(`[UserManagement] ${missingEmailCount}/${items.length} users missing email (expected for some backends). Showing roles/bookings instead.`)
      }

      setUsers(items)
      setTotalUsers(response.data.total ?? 0)
      setTotalPages(response.data.last_page ?? 1)
    }

    setLoading(qLoading)
    if (qError) {
      console.error('Failed to load users:', qError)
      setError((qError as any)?.message || 'Failed to load users')
    }
  }, [uq, qLoading, qError])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value)
    setCurrentPage(1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getAvatarColor = (index: number) => {
    const colors = ['bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500']
    return colors[index % colors.length]
  }

  const getAvatarInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()

  return (
    <div className="w-full">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">User Management</h2>
        <p className="text-gray-600 font-medium">Kelola pengguna platform Anda</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Search Bar + Role Filter */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau email..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh
          </button>

          <div className="mt-3 md:mt-0">
            <label className="sr-only" htmlFor="roleFilter">Role</label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={handleRoleChange}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
            >
              <option value="">All roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 lg:px-8 py-6 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              Users ({totalUsers} total)
            </h3>
            <span className="text-sm text-gray-500 font-medium">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-6 lg:px-8 py-16 text-center">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
              <p className="text-gray-500 font-semibold mt-4">Loading users...</p>
            </div>
          ) : users && users.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 lg:px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="hidden md:table-cell px-6 lg:px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Joined Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 lg:px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${getAvatarColor(index)} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                          {getAvatarInitials(user.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 lg:px-8 py-4">
                      {user.email ? (
                        <span className="text-sm text-gray-700">{user.email}</span>
                      ) : (
                        <span className="text-sm text-gray-400 italic">No email</span>
                      )}
                    </td>
                    <td className="px-6 lg:px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 lg:px-8 py-4">
                      {user.status === 'suspended' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleActivate(user)}
                            className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                            disabled={actionLoadingId === user.id}
                          >
                            {actionLoadingId === user.id ? (
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                              </svg>
                            ) : null}
                            <span>Activate</span>
                          </button>
                          <button
                            onClick={() => handleViewDetails(user.id)}
                            className="px-2 py-1 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Details
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSuspend(user)}
                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                            disabled={actionLoadingId === user.id}
                          >
                            {actionLoadingId === user.id ? (
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                              </svg>
                            ) : null}
                            <span>Suspend</span>
                          </button>
                          <button
                            onClick={() => handleViewDetails(user.id)}
                            className="px-2 py-1 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Details
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="hidden md:table-cell px-6 lg:px-8 py-4">
                      <span className="text-sm text-gray-600">{formatDate(user.created_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 lg:px-8 py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <Search size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-semibold">Tidak ada pengguna ditemukan</p>
              <p className="text-sm text-gray-400 mt-1">Coba ubah pencarian Anda</p>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {users.length > 0 && (
          <div className="px-6 lg:px-8 py-4 border-t border-gray-200 bg-linear-to-r from-gray-50 to-white flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, totalUsers)} of {totalUsers} users
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage > 3 ? currentPage - 2 + i : i + 1
                  if (page > totalPages) return null
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${page === currentPage
                        ? 'bg-orange-500 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
