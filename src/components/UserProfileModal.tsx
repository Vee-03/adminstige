import { useState, useEffect } from 'react'
import { X, Mail, User as UserIcon, Calendar, AlertCircle } from 'lucide-react'
import type { User } from '../utils/userAPI'

interface UserProfileModalProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
  onSave: (userId: string | number, data: Partial<User>) => Promise<void>
  isSubmitting?: boolean
}

export default function UserProfileModal({
  isOpen,
  user,
  onClose,
  onSave,
  isSubmitting = false,
}: UserProfileModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      })
      setError(null)
      setSuccess(null)
    }
  }, [user, isOpen])

  if (!isOpen || !user) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      if (!formData.name?.trim()) {
        setError('Nama tidak boleh kosong')
        return
      }

      if (!formData.email?.trim()) {
        setError('Email tidak boleh kosong')
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Format email tidak valid')
        return
      }

      await onSave(user.id, formData)
      setSuccess('User berhasil diperbarui')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui user')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-bold text-gray-900">Edit User Profile</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">{success}</p>
            </div>
          )}

          {/* User ID (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">User ID</label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono">
              {user.id}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <UserIcon size={16} className="text-orange-500" />
              Nama
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Masukkan nama user"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Mail size={16} className="text-orange-500" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Masukkan email user"
            />
          </div>

          {/* Created Date (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-orange-500" />
              Tanggal Dibuat
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
              {formatDate(user.created_at)}
            </div>
          </div>

          {/* Updated Date (Read-only) */}
          {user.updated_at && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-orange-500" />
                Terakhir Diperbarui
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                {formatDate(user.updated_at)}
              </div>
            </div>
          )}

          {/* Email Verified Status */}
          {user.email_verified_at !== undefined && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Verified</label>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    user.email_verified_at ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                ></div>
                <span className="text-sm text-gray-600">
                  {user.email_verified_at ? 'Verified' : 'Not verified'}
                </span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
