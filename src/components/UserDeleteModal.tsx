import { AlertTriangle, X } from 'lucide-react'
import type { User } from '../utils/userAPI'

interface UserDeleteModalProps {
  isOpen: boolean
  user: User | null
  onClose: () => void
  onConfirm: (userId: string | number) => Promise<void>
  isSubmitting?: boolean
}

export default function UserDeleteModal({
  isOpen,
  user,
  onClose,
  onConfirm,
  isSubmitting = false,
}: UserDeleteModalProps) {
  if (!isOpen || !user) return null

  const handleConfirm = async () => {
    try {
      await onConfirm(user.id)
      onClose()
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-900">Delete User</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-red-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-gray-700 font-medium">
              Apakah Anda yakin ingin menghapus user ini?
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Nama</p>
                  <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Email</p>
                  <p className="text-sm text-gray-700">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <span className="font-semibold">Peringatan:</span> Tindakan ini tidak dapat dibatalkan. 
              Data user akan dihapus secara permanen.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  )
}
