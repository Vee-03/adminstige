import { useState } from 'react'
import { Edit, Trash2, Plus, Search, MapPin, X, Image } from 'lucide-react'

interface Destination {
  id?: string
  name: string
  location: string
  description: string
  price: number
  rating: number
  categories: string[]
  image_urls: string[]
  owner_id: string
}

export default function DestinationPage() {
  const [destinations, setDestinations] = useState<Destination[]>([
    {
      id: '1',
      name: 'Garut',
      location: 'Indonesia',
      description: 'Garut van java',
      price: 100000,
      rating: 4.9,
      categories: ['Fun', 'Nature'],
      image_urls: ['https://google.com'],
      owner_id: '019a7722-3511-710b-9b3f-e77a2b5100b9',
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<Destination>({
    name: '',
    location: '',
    description: '',
    price: 0,
    rating: 0,
    categories: [],
    image_urls: [],
    owner_id: '019a7722-3511-710b-9b3f-e77a2b5100b9',
  })
  const [newCategory, setNewCategory] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const filteredDestinations = destinations.filter(
    (dest) =>
      dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (destination?: Destination) => {
    if (destination) {
      setIsEditing(true)
      setEditingId(destination.id)
      setFormData(destination)
    } else {
      setIsEditing(false)
      setEditingId(undefined)
      setFormData({
        name: '',
        location: '',
        description: '',
        price: 0,
        rating: 0,
        categories: [],
        image_urls: [],
        owner_id: '019a7722-3511-710b-9b3f-e77a2b5100b9',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setNewCategory('')
    setNewImageUrl('')
  }

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setFormData({
        ...formData,
        categories: [...formData.categories, newCategory],
      })
      setNewCategory('')
    }
  }

  const handleRemoveCategory = (index: number) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((_, i) => i !== index),
    })
  }

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData({
        ...formData,
        image_urls: [...formData.image_urls, newImageUrl],
      })
      setNewImageUrl('')
    }
  }

  const handleRemoveImageUrl = (index: number) => {
    setFormData({
      ...formData,
      image_urls: formData.image_urls.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.location || !formData.description) {
      alert('Silakan isi semua field yang wajib')
      return
    }

    if (isEditing && editingId) {
      setDestinations(
        destinations.map((dest) =>
          dest.id === editingId ? { ...formData, id: editingId } : dest
        )
      )
    } else {
      setDestinations([
        ...destinations,
        {
          ...formData,
          id: Date.now().toString(),
        },
      ])
    }

    handleCloseModal()
  }

  const handleDelete = (id: string | undefined) => {
    if (confirm('Apakah Anda yakin ingin menghapus destination ini?')) {
      setDestinations(destinations.filter((dest) => dest.id !== id))
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Destinations</h2>
        <p className="text-gray-600">Manage your tour destinations</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
        >
          <Plus size={20} />
          Add Destination
        </button>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.map((destination) => (
          <div
            key={destination.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {/* Image */}
            <div className="h-48 bg-linear-to-br from-orange-400 to-orange-500 flex items-center justify-center">
              {destination.image_urls && destination.image_urls.length > 0 ? (
                <img src={destination.image_urls[0]} alt={destination.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Image size={48} className="text-white opacity-60" />
                  <span className="text-white text-sm opacity-60 font-medium">No Image</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{destination.name}</h3>

              <div className="flex items-center gap-2 mb-3 text-gray-600">
                <MapPin size={18} className="text-orange-500" />
                <span className="text-sm">{destination.location}</span>
              </div>

              <p className="text-gray-600 text-sm mb-4">{destination.description}</p>

              {/* Categories */}
              {destination.categories.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {destination.categories.map((category, idx) => (
                      <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(destination.price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="text-lg font-bold text-yellow-500">{destination.rating}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleOpenModal(destination)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-semibold"
                >
                  <Edit size={18} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(destination.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-semibold"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDestinations.length === 0 && (
        <div className="text-center py-12">
          <MapPin size={56} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-semibold">Tidak ada destination ditemukan</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-linear-to-r from-orange-500 to-orange-600 px-6 py-6 flex items-center justify-between text-white">
              <h3 className="text-2xl font-bold">{isEditing ? 'Edit Destination' : 'Add New Destination'}</h3>
              <button onClick={handleCloseModal} className="hover:bg-white/20 p-2 rounded-lg transition">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Name and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Destination Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="e.g. Garut"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="e.g. Indonesia"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 resize-none"
                  rows={4}
                  placeholder="Describe this destination..."
                />
              </div>

              {/* Price and Rating */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (IDR)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rating (0-5)
                  </label>
                  <input
                    type="number"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="4.5"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categories
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="e.g. Nature"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
                  >
                    Add
                  </button>
                </div>
                {formData.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.categories.map((category, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full"
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(idx)}
                          className="hover:text-orange-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Image URLs */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image URLs
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
                  >
                    Add
                  </button>
                </div>
                {formData.image_urls.length > 0 && (
                  <div className="space-y-2">
                    {formData.image_urls.map((url, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-100 rounded-lg"
                      >
                        <span className="text-sm text-gray-700 truncate">{url}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrl(idx)}
                          className="p-1 hover:bg-red-100 text-red-600 rounded transition"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Owner ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Owner ID
                </label>
                <input
                  type="text"
                  value={formData.owner_id}
                  onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="Owner ID"
                />
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
                  {isEditing ? 'Update' : 'Create'} Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
