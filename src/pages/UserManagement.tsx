import { useState } from 'react'
import { Edit, Trash2, Plus, Search, X, User, CheckCircle, XCircle } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  status: 'active' | 'inactive' | 'suspended'
  role: 'user' | 'admin' | 'moderator'
  joined_date: string
  last_login: string
  avatar?: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+62812345678',
      address: 'Jakarta, Indonesia',
      status: 'active',
      role: 'user',
      joined_date: '2024-01-15',
      last_login: '2024-11-13',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+62887654321',
      address: 'Bandung, Indonesia',
      status: 'active',
      role: 'user',
      joined_date: '2024-02-20',
      last_login: '2024-11-12',
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '+62811223344',
      address: 'Surabaya, Indonesia',
      status: 'suspended',
      role: 'user',
      joined_date: '2024-03-10',
      last_login: '2024-10-28',
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    role: 'user',
    joined_date: new Date().toISOString().split('T')[0],
    last_login: new Date().toISOString().split('T')[0],
  })

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (user?: UserProfile) => {
    if (user) {
      setIsEditing(true)
      setEditingId(user.id)
      setFormData(user)
    } else {
      setIsEditing(false)
      setEditingId(undefined)
      setFormData({
        id: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'active',
        role: 'user',
        joined_date: new Date().toISOString().split('T')[0],
        last_login: new Date().toISOString().split('T')[0],
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.phone) {
      alert('Silakan isi semua field yang wajib')
      return
    }

    if (isEditing && editingId) {
      setUsers(
        users.map((user) =>
          user.id === editingId ? { ...formData, id: editingId } : user
        )
      )
    } else {
      setUsers([
        ...users,
        {
          ...formData,
          id: Date.now().toString(),
        },
      ])
    }

    handleCloseModal()
  }

  const handleDelete = (id?: string) => {
    if (!id) return
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      setUsers(users.filter((user) => user.id !== id))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
            <CheckCircle size={14} className="mr-1.5" />
            Active
          </span>
        )
      case 'inactive':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
            <XCircle size={14} className="mr-1.5" />
            Inactive
          </span>
        )
      case 'suspended':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <XCircle size={14} className="mr-1.5" />
            Suspended
          </span>
        )
      default:
        return null
    }
  }

  const getRoleBadge = (role: string) => {
    const roleStyles: { [key: string]: string } = {
      user: 'bg-blue-100 text-blue-800 border border-blue-300',
      admin: 'bg-purple-100 text-purple-800 border border-purple-300',
      moderator: 'bg-orange-100 text-orange-800 border border-orange-300',
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${roleStyles[role] || roleStyles['user']}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
  }

  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="w-full">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">User Management</h2>
        <p className="text-gray-600 font-medium">Kelola profil dan akses pengguna di platform</p>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama atau email..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200">
                  <th className="px-6 lg:px-8 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                  <th className="hidden md:table-cell px-6 lg:px-8 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="hidden lg:table-cell px-6 lg:px-8 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 lg:px-8 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 lg:px-8 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr key={user.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {getAvatarInitials(user.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 lg:px-8 py-4">
                      <span className="text-sm text-gray-700">{user.email}</span>
                    </td>
                    <td className="hidden lg:table-cell px-6 lg:px-8 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 lg:px-8 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 lg:px-8 py-16 text-center">
            <User size={56} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-semibold">Tidak ada user ditemukan</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-6 flex items-center justify-between text-white">
              <h3 className="text-2xl font-bold">{isEditing ? 'Edit User Profile' : 'Add New User'}</h3>
              <button onClick={handleCloseModal} className="hover:bg-white/20 p-2 rounded-lg transition">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="e.g. john@example.com"
                  />
                </div>
              </div>

              {/* Phone and Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="e.g. +6281234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="e.g. Jakarta, Indonesia"
                  />
                </div>
              </div>

              {/* Role and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' | 'moderator' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Joined Date</label>
                  <input
                    type="date"
                    value={formData.joined_date}
                    onChange={(e) => setFormData({ ...formData, joined_date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Login</label>
                  <input
                    type="date"
                    value={formData.last_login}
                    onChange={(e) => setFormData({ ...formData, last_login: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
                >
                  {isEditing ? 'Update' : 'Create'} User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
