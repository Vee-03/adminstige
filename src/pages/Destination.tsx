import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  MapPin,
  X,
  Image as ImageIcon,
  AlertCircle,
  Loader,
} from "lucide-react";
import {
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
} from "../utils/destinationAPI";
import type { Destination as DestinationType } from "../utils/destinationAPI";

export default function DestinationPage() {
  const [destinations, setDestinations] = useState<DestinationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredDestinations, setFilteredDestinations] = useState<
    DestinationType[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const [formData, setFormData] = useState<
    Omit<DestinationType, "uuid" | "created_at" | "updated_at">
  >({
    name: "",
    location: "",
    description: "",
    price: 0,
    rating: 0,
    categories: [],
    image_urls: [],
    owner_id: "",
  });

  const [newCategory, setNewCategory] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  const {
    data: dq,
    isLoading: qLoading,
    error: qError,
    refetch,
  } = useQuery<DestinationType[], Error>({
    queryKey: ["destinations", { perPage: 100 }],
    queryFn: () => getDestinations(1, 100).then((r) => r.data.items || []),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (dq) {
      setDestinations(dq as DestinationType[]);
      setFilteredDestinations(dq as DestinationType[]);
    }
    setLoading(qLoading);
    if (qError) {
      const errorMessage =
        qError instanceof Error
          ? qError.message
          : String(qError) || "Gagal mengambil data destinasi";
      setError(errorMessage);
      console.error("Fetch destinations error:", qError);
    }
  }, [dq, qLoading, qError]);

  useEffect(() => {
    const filtered = destinations.filter(
      (dest) =>
        dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDestinations(filtered);
  }, [searchTerm, destinations]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleOpenModal = (destination?: DestinationType) => {
    setSubmitError(null);
    if (destination) {
      setIsEditing(true);
      setEditingUuid(destination.uuid || null);
      // PERBAIKAN: Jangan sertakan owner_id saat edit
      // Biarkan backend menggunakan owner_id yang sudah ada
      setFormData({
        name: destination.name,
        location: destination.location,
        description: destination.description,
        price: destination.price,
        rating: destination.rating,
        categories: destination.categories,
        image_urls: destination.image_urls,
        owner_id: destination.owner_id || "", // Kosongkan untuk update (omit on submit)
      });
    } else {
      setIsEditing(false);
      setEditingUuid(null);
      setFormData({
        name: "",
        location: "",
        description: "",
        price: 0,
        rating: 0,
        categories: [],
        image_urls: [],
        owner_id: "019a7722-3511-710b-9b3f-e77a2b5100b9", // Default untuk create
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewCategory("");
    setNewImageUrl("");
    setSubmitError(null);
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setFormData({
        ...formData,
        categories: [...formData.categories, newCategory],
      });
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (index: number) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((_, i) => i !== index),
    });
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData({
        ...formData,
        image_urls: [...formData.image_urls, newImageUrl],
      });
      setNewImageUrl("");
    }
  };

  const handleRemoveImageUrl = (index: number) => {
    setFormData({
      ...formData,
      image_urls: formData.image_urls.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.name || !formData.location || !formData.description) {
      setSubmitError("Silakan isi semua field yang wajib");
      return;
    }

    try {
      setSubmitting(true);

      // Konversi price dan rating ke number
      const basePayload: Partial<
        Omit<DestinationType, "uuid" | "created_at" | "updated_at">
      > = {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        price:
          typeof formData.price === "string"
            ? Number(formData.price)
            : formData.price,
        rating:
          typeof formData.rating === "string"
            ? Number(formData.rating)
            : formData.rating,
        categories: formData.categories,
        image_urls: formData.image_urls,
      };

      if (isEditing && editingUuid) {
        // PERBAIKAN: Untuk UPDATE, jangan kirim owner_id sama sekali
        // Backend akan gunakan owner_id yang sudah ada
        const updated = await updateDestination(editingUuid, basePayload);
        setDestinations(
          destinations.map((dest) =>
            dest.uuid === editingUuid ? updated.data : dest
          )
        );
      } else {
        // PERBAIKAN: Untuk CREATE, pastikan owner_id ada dan valid
        const createPayload = {
          ...basePayload,
          owner_id: formData.owner_id || "019a7722-3511-710b-9b3f-e77a2b5100b9",
        } as Omit<DestinationType, "uuid" | "created_at" | "updated_at">;
        const created = await createDestination(createPayload);
        setDestinations([...destinations, created.data]);
      }

      handleCloseModal();
      // Refresh data setelah submit
      refetch();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menyimpan destinasi";
      setSubmitError(errorMessage);
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (uuid: string | undefined) => {
    if (!uuid) return;

    if (!confirm("Apakah Anda yakin ingin menghapus destination ini?")) {
      return;
    }

    try {
      setDeleteLoading(uuid);
      await deleteDestination(uuid);
      setDestinations(destinations.filter((dest) => dest.uuid !== uuid));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menghapus destinasi";
      setError(errorMessage);
      console.error("Delete error:", err);
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Destinations</h2>
        <p className="text-gray-600">Manage your tour destinations</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-800 font-semibold">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
          >
            <Plus size={20} />
            Add Destination
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader
              className="animate-spin mx-auto mb-4 text-orange-500"
              size={32}
            />
            <p className="text-gray-600">Loading destinations...</p>
          </div>
        </div>
      )}

      {!loading && filteredDestinations.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 font-semibold mb-2">
            No destinations found
          </p>
          <p className="text-gray-500 text-sm">
            {searchTerm
              ? "Try adjusting your search"
              : 'Create your first destination by clicking "Add Destination"'}
          </p>
        </div>
      )}

      {!loading && filteredDestinations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination) => (
            <div
              key={destination.uuid}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="h-48 bg-linear-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                {destination.image_urls && destination.image_urls.length > 0 ? (
                  <img
                    src={destination.image_urls[0]}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon size={48} className="text-white opacity-60" />
                    <span className="text-white text-sm opacity-60 font-medium">
                      No Image
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {destination.name}
                </h3>

                <div className="flex items-center gap-2 mb-3 text-gray-600">
                  <MapPin size={18} className="text-orange-500" />
                  <span className="text-sm">{destination.location}</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {destination.description}
                </p>

                {destination.categories.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {destination.categories.map((category, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-lg font-bold text-orange-600">
                      {formatCurrency(destination.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="text-lg font-bold text-yellow-500">
                      {destination.rating}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleOpenModal(destination)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-semibold"
                  >
                    <Edit size={18} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(destination.uuid)}
                    disabled={deleteLoading === destination.uuid}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition font-semibold"
                  >
                    {deleteLoading === destination.uuid ? (
                      <Loader size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-linear-to-r from-orange-500 to-orange-600 px-8 py-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">
                {isEditing ? "Edit Destination" : "Add New Destination"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle
                    className="text-red-600 shrink-0 mt-0.5"
                    size={20}
                  />
                  <p className="text-red-700">{submitError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Destination Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  placeholder="e.g., Taman Nasional Bromo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    placeholder="e.g., Jawa Timur"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (IDR)
                  </label>
                  <input
                    type="number"
                    value={formData.price === 0 ? "" : formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    placeholder="100000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  placeholder="Describe this destination..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rating: {formData.rating || "0"}/5
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rating: Number(e.target.value),
                      })
                    }
                    className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <span className="text-2xl font-bold text-orange-500 min-w-fit">
                    {formData.rating || "0"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categories
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddCategory())
                    }
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    placeholder="Add category..."
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
                        className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full"
                      >
                        <span className="text-sm font-semibold">
                          {category}
                        </span>
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image URLs
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddImageUrl())
                    }
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
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
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1 truncate">
                          <p className="text-sm text-gray-600 truncate">
                            {url}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrl(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg font-semibold transition"
                >
                  {submitting ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      {isEditing ? "Update Destination" : "Create Destination"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
