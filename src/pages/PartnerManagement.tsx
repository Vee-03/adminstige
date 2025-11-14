import { useEffect, useState } from 'react'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Search, ChevronLeft, ChevronRight, Mail, Calendar, Badge, Building2, Phone, X } from 'lucide-react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

interface Partner {
  id: string | number
  name: string
  email: string
  phone?: string
  company_name?: string
  status: 'active' | 'suspended' | 'inactive'
  businesses_count?: number
  created_at?: string
  updated_at?: string
  address?: string
  city?: string
  province?: string
  verified?: boolean
}

// Mock partner data - UI ONLY
const MOCK_PARTNERS: Partner[] = [
  {
    id: 1,
    name: 'PT Mitra Wisata Indonesia',
    email: 'contact@mitrawise.id',
    phone: '021-1234567',
    company_name: 'PT Mitra Wisata Indonesia',
    status: 'active',
    businesses_count: 5,
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-11-10T15:30:00Z',
    address: 'Jl. Sudirman No. 123',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    verified: true,
  },
  {
    id: 2,
    name: 'CV Destinasi Nusantara',
    email: 'info@destinasinusantara.com',
    phone: '0274-555666',
    company_name: 'CV Destinasi Nusantara',
    status: 'active',
    businesses_count: 3,
    created_at: '2024-04-20T08:15:00Z',
    updated_at: '2024-11-08T12:00:00Z',
    address: 'Jl. Malioboro No. 456',
    city: 'Yogyakarta',
    province: 'DI Yogyakarta',
    verified: true,
  },
  {
    id: 3,
    name: 'Bali Tourism Partners',
    email: 'support@balitourism.co.id',
    phone: '0361-777888',
    company_name: 'Bali Tourism Partners',
    status: 'suspended',
    businesses_count: 2,
    created_at: '2024-05-10T14:45:00Z',
    updated_at: '2024-11-01T09:20:00Z',
    address: 'Jl. Cendana No. 789',
    city: 'Denpasar',
    province: 'Bali',
    verified: false,
  },
  {
    id: 4,
    name: 'Surabaya Adventures Co.',
    email: 'hello@surabayaadventures.id',
    phone: '031-999000',
    company_name: 'Surabaya Adventures Co.',
    status: 'active',
    businesses_count: 4,
    created_at: '2024-06-05T11:30:00Z',
    updated_at: '2024-11-12T16:45:00Z',
    address: 'Jl. Tunjungan No. 321',
    city: 'Surabaya',
    province: 'Jawa Timur',
    verified: true,
  },
  {
    id: 5,
    name: 'Bandung Travel Solutions',
    email: 'contact@bandungtravelsolve.com',
    phone: '022-444555',
    company_name: 'Bandung Travel Solutions',
    status: 'active',
    businesses_count: 2,
    created_at: '2024-07-12T09:00:00Z',
    updated_at: '2024-11-09T13:15:00Z',
    address: 'Jl. Diponegoro No. 654',
    city: 'Bandung',
    province: 'Jawa Barat',
    verified: true,
  },
  {
    id: 6,
    name: 'Lombok Island Tourism',
    email: 'info@lombokisland.travel',
    phone: '0370-666777',
    company_name: 'Lombok Island Tourism',
    status: 'inactive',
    businesses_count: 1,
    created_at: '2024-08-20T10:30:00Z',
    updated_at: '2024-11-05T14:00:00Z',
    address: 'Jl. Pantai No. 987',
    city: 'Mataram',
    province: 'Nusa Tenggara Barat',
    verified: false,
  },
]

export default function PartnerManagement() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPartners, setTotalPartners] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null)
  const [selectedPartnerDetail, setSelectedPartnerDetail] = useState<Partner | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const itemsPerPage = 10

  // Load and filter mock data
  useEffect(() => {
    setLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      let filtered = [...MOCK_PARTNERS]

      // Apply search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase()
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.email.toLowerCase().includes(searchLower) ||
            (p.company_name && p.company_name.toLowerCase().includes(searchLower))
        )
      }

      // Apply status filter
      if (statusFilter && statusFilter !== 'all') {
        filtered = filtered.filter((p) => p.status === statusFilter)
      }

      const total = filtered.length
      const pages = Math.ceil(total / itemsPerPage)
      const start = (currentPage - 1) * itemsPerPage
      const paginatedData = filtered.slice(start, start + itemsPerPage)

      setPartners(paginatedData)
      setTotalPartners(total)
      setTotalPages(pages || 1)
      setLoading(false)
    }, 300)
  }, [searchTerm, statusFilter, currentPage])

  const handleSuspend = async (partner: Partner) => {
    const result = await Swal.fire({
      title: `Suspend ${partner.company_name || partner.name}?`,
      input: 'textarea',
      inputLabel: 'Reason (optional)',
      inputPlaceholder: 'Why are you suspending this partner?',
      showCancelButton: true,
      confirmButtonText: 'Suspend',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      reverseButtons: true,
      preConfirm: (value: any) => value ?? '',
    })

    if (!result.isConfirmed) return

    try {
      setActionLoadingId(partner.id)
      // Mock update - UI only
      setPartners((prev) =>
        prev.map((p) =>
          p.id === partner.id ? { ...p, status: 'suspended' as const } : p
        )
      )
      Swal.fire('Success', `${partner.company_name || partner.name} suspended`, 'success')
    } catch (err) {
      Swal.fire('Error', err instanceof Error ? err.message : 'Failed to suspend partner', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleActivate = async (partner: Partner) => {
    const result = await Swal.fire({
      title: `Activate ${partner.company_name || partner.name}?`,
      showCancelButton: true,
      confirmButtonText: 'Activate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      reverseButtons: true,
    })

    if (!result.isConfirmed) return

    try {
      setActionLoadingId(partner.id)
      // Mock update - UI only
      setPartners((prev) =>
        prev.map((p) =>
          p.id === partner.id ? { ...p, status: 'active' as const } : p
        )
      )
      Swal.fire('Success', `${partner.company_name || partner.name} activated`, 'success')
    } catch (err) {
      Swal.fire('Error', err instanceof Error ? err.message : 'Failed to activate partner', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleViewDetails = async (partnerId: string | number) => {
    try {
      setActionLoadingId(partnerId)
      const partner = partners.find((p) => p.id === partnerId)
      if (partner) {
        setSelectedPartnerDetail(partner)
        setShowDetailModal(true)
      } else {
        Swal.fire('Not found', 'Partner details not available', 'info')
      }
    } catch (err) {
      console.error('Failed to fetch partner details', err)
      Swal.fire('Error', err instanceof Error ? err.message : 'Failed to fetch partner details', 'error')
    } finally {
      setActionLoadingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif'
      case 'suspended':
        return 'Suspended'
      case 'inactive':
        return 'Tidak Aktif'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Mitra</h1>
        <p className="text-gray-600 mt-1">Kelola akun mitra dan bisnis mereka</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cari nama mitra, email, atau perusahaan..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Tidak ada mitra ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nama Perusahaan</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Kota</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bisnis</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {partner.company_name?.charAt(0).toUpperCase() || partner.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{partner.company_name || partner.name}</p>
                          <p className="text-sm text-gray-500">{partner.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{partner.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{partner.city || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(partner.status)}`}>
                        {getStatusLabel(partner.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{partner.businesses_count || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(partner.id)}
                          disabled={actionLoadingId === partner.id}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                        >
                          {actionLoadingId === partner.id ? 'Loading...' : 'Lihat'}
                        </button>

                        {partner.status === 'active' ? (
                          <button
                            onClick={() => handleSuspend(partner)}
                            disabled={actionLoadingId === partner.id}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            {actionLoadingId === partner.id ? 'Loading...' : 'Suspend'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(partner)}
                            disabled={actionLoadingId === partner.id}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 font-semibold rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                          >
                            {actionLoadingId === partner.id ? 'Loading...' : 'Aktifkan'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Halaman {currentPage} dari {totalPages} · Total {totalPartners} mitra
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Partner Detail Modal */}
      {showDetailModal && selectedPartnerDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selectedPartnerDetail.company_name?.charAt(0).toUpperCase() || selectedPartnerDetail.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedPartnerDetail.company_name || selectedPartnerDetail.name}</h2>
                  <p className="text-sm text-gray-600">{selectedPartnerDetail.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700 w-24">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedPartnerDetail.status)}`}>
                  {getStatusLabel(selectedPartnerDetail.status)}
                </span>
                {selectedPartnerDetail.verified && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold flex items-center gap-1">
                    ✓ Terverifikasi
                  </span>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail size={16} className="text-purple-500" />
                    Email
                  </label>
                  <p className="text-gray-900 font-medium break-all">{selectedPartnerDetail.email}</p>
                </div>

                {/* Phone */}
                {selectedPartnerDetail.phone && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone size={16} className="text-purple-500" />
                      Telepon
                    </label>
                    <p className="text-gray-900 font-medium">{selectedPartnerDetail.phone}</p>
                  </div>
                )}
              </div>

              {/* Company & Location Info */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 size={18} className="text-purple-600" />
                  Informasi Perusahaan
                </h3>
                <div className="space-y-3 text-sm">
                  {selectedPartnerDetail.address && (
                    <div>
                      <p className="text-gray-600 font-semibold">Alamat</p>
                      <p className="text-gray-900">{selectedPartnerDetail.address}</p>
                    </div>
                  )}
                  {selectedPartnerDetail.city && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 font-semibold">Kota</p>
                        <p className="text-gray-900">{selectedPartnerDetail.city}</p>
                      </div>
                      {selectedPartnerDetail.province && (
                        <div>
                          <p className="text-gray-600 font-semibold">Provinsi</p>
                          <p className="text-gray-900">{selectedPartnerDetail.province}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Section */}
              {selectedPartnerDetail.businesses_count !== undefined && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Badge size={18} className="text-purple-600" />
                    Statistik
                  </h3>
                  <div className="bg-white p-4 rounded-lg border border-purple-200">
                    <p className="text-xs text-gray-600 font-semibold uppercase">Total Bisnis Terdaftar</p>
                    <p className="text-3xl font-bold text-purple-600">{selectedPartnerDetail.businesses_count}</p>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-6">
                {/* Created At */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-purple-500" />
                    Terdaftar
                  </label>
                  <p className="text-gray-900">
                    {selectedPartnerDetail.created_at
                      ? new Date(selectedPartnerDetail.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </p>
                </div>

                {/* Updated At */}
                {selectedPartnerDetail.updated_at && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar size={16} className="text-purple-500" />
                      Diperbarui
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedPartnerDetail.updated_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
