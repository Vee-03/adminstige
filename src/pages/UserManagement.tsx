import { useState } from 'react'
import { Edit, Trash2, Plus, Search, X, User } from 'lucide-react'

interface UserProfile {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  status: 'active' | 'inactive' | 'suspended'
  role: 'user' | 'admin' | 'moderator'
  created_at: string
  last_login?: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+62812345678', address: 'Jakarta, Indonesia', status: 'active', role: 'user', created_at: '2024-01-15T00:00:00.000000Z', last_login: '2024-11-13T10:30:00.000000Z' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+62887654321', address: 'Bandung, Indonesia', status: 'active', role: 'user', created_at: '2024-02-20T00:00:00.000000Z', last_login: '2024-11-12T15:45:00.000000Z' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '+62811223344', address: 'Surabaya, Indonesia', status: 'suspended', role: 'user', created_at: '2024-03-10T00:00:00.000000Z' },
  ])
  
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<number | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<Omit<UserProfile, 'id'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    role: 'user',
    created_at: new Date().toISOString(),
  })

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
  
  const getAvatarInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase()

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓' },
      inactive: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '○' },
      suspended: { bg: 'bg-red-100', text: 'text-red-800', icon: '✕' },
    }
    const s = statusMap[status as keyof typeof statusMap] || statusMap.inactive
    return <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${s.bg} ${s.text}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
  }

  const handleOpenModal = (user?: UserProfile) => {
    if (user) {
      setIsEditing(true)
      setEditingId(user.id)
      const { id, ...userWithoutId } = user
      setFormData(userWithoutId)
    } else {
      setIsEditing(false)
      setEditingId(undefined)
      setFormData({ name: '', email: '', phone: '', address: '', status: 'active', role: 'user', created_at: new Date().toISOString() })
    }
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Silakan isi semua field yang wajib')
      return
    }

    if (isEditing && editingId) {
      setUsers(users.map(u => u.id === editingId ? { ...u, ...formData } : u))
    } else {
      setUsers([...users, { ...formData, id: Math.max(...users.map(u => u.id), 0) + 1 } as UserProfile])
    }
    setShowModal(false)
  }

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      setUsers(users.filter(u => u.id !== id))
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">User Management</h2>
        <p className="text-gray-600 font-medium">Kelola profil dan akses pengguna di platform sesuai API structure</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari user..." className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500" />
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition">
          <Plus size={20} />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {filteredUsers.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="hidden md:table-cell px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="hidden lg:table-cell px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="hidden lg:table-cell px-6 py-4 text-left text-sm font-semibold text-gray-700">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <tr key={user.id} className={`border-b hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">{getAvatarInitials(user.name)}</div><div><p className="text-sm font-semibold">{user.name}</p><p className="text-xs text-gray-500">{user.phone || 'N/A'}</p></div></div></td>
                  <td className="hidden md:table-cell px-6 py-4 text-sm">{user.email}</td>
                  <td className="hidden lg:table-cell px-6 py-4"><span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded">{user.role}</span></td>
                  <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-600">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                  <td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => handleOpenModal(user)} className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded"><Edit size={18} /></button><button onClick={() => handleDelete(user.id)} className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded"><Trash2 size={18} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-16 text-center"><User size={56} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500 font-semibold">Tidak ada user ditemukan</p></div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-orange-500 px-6 py-6 flex items-center justify-between text-white">
              <h3 className="text-2xl font-bold">{isEditing ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowModal(false)} className="hover:bg-orange-600 p-2 rounded"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-2">Full Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500" /></div>
                <div><label className="block text-sm font-semibold mb-2">Email *</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-2">Phone *</label><input type="tel" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500" /></div>
                <div><label className="block text-sm font-semibold mb-2">Address</label><input type="text" value={formData.address || ''} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-2">Role</label><select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as any})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"><option>user</option><option>admin</option><option>moderator</option></select></div>
                <div><label className="block text-sm font-semibold mb-2">Status</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"><option>active</option><option>inactive</option><option>suspended</option></select></div>
              </div>
              <div className="flex gap-4"><button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold">Cancel</button><button type="submit" className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold">{isEditing ? 'Update' : 'Create'} User</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
