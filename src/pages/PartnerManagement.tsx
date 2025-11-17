import { useEffect, useState } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  Badge,
  Building2,
  Phone,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useQuery } from "@tanstack/react-query";
import {
  getUsersWithFallback,
  updateUserStatus,
  getUserWithFallback,
  createUserWithFallback,
  deleteUserWithFallback,
} from "../utils/userAPI";

// Defensive helper: try multiple common locations for phone numbers in API responses
function extractPhone(raw: any): string | undefined {
  if (!raw) return undefined;
  // common top-level keys
  if (raw.phone) return String(raw.phone);
  if (raw.phone_number) return String(raw.phone_number);
  // nested personal_data
  if (raw.personal_data) {
    if (raw.personal_data.phone_number)
      return String(raw.personal_data.phone_number);
    if (raw.personal_data.phone) return String(raw.personal_data.phone);
  }
  // meta/contact or profile shapes
  if (raw.meta?.phone) return String(raw.meta.phone);
  if (raw.meta?.contact?.phone) return String(raw.meta.contact.phone);
  if (raw.profile?.phone) return String(raw.profile.phone);
  if (raw.attributes?.phone) return String(raw.attributes.phone);
  return undefined;
}

interface Partner {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  status: "active" | "suspended" | "inactive";
  businesses_count?: number;
  created_at?: string;
  updated_at?: string;
  address?: string;
  city?: string;
  province?: string;
  verified?: boolean;
}

// We'll fetch partners from the users endpoint with role=partner

export default function PartnerManagement() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPartners, setTotalPartners] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<
    string | number | null
  >(null);
  const [selectedPartnerDetail, setSelectedPartnerDetail] =
    useState<Partner | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    location: "",
  });

  const itemsPerPage = 10;

  const {
    data: uq,
    isLoading: qLoading,
    error: qError,
    refetch,
  } = useQuery({
    queryKey: [
      "adminUsers",
      {
        page: currentPage,
        perPage: itemsPerPage,
        role: "partner",
        search: searchTerm,
        status: statusFilter,
      },
    ],
    queryFn: () =>
      getUsersWithFallback(
        currentPage,
        itemsPerPage,
        searchTerm || undefined,
        "partner"
      ),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    setLoading(qLoading);

    if (uq?.data) {
      const items = uq.data.items || [];
      const mapped: Partner[] = items.map((u: any) => ({
        id: u.id,
        name: u.name || "",
        email: u.email || "",
        company_name:
          u.personal_data?.company_name || u.company_name || u.name || "",
        status: (u.status as any) || "active",
        businesses_count: u.businesses_count ?? 0,
        created_at: u.created_at,
        updated_at: u.updated_at,
        address: u.personal_data?.address || "",
        city: u.personal_data?.location || "",
        province: u.personal_data?.province || "",
        verified:
          !!u.verified ||
          (Array.isArray(u.roles) &&
            u.roles.some((r: any) => r.name === "partner")),
      }));

      setPartners(mapped);
      setTotalPartners(uq.data.total ?? 0);
      setTotalPages(uq.data.last_page ?? 1);

      // Fetch details for each partner to enrich phone/location data
      // Use Promise.allSettled to prevent one failure from blocking others
      const detailPromises = mapped.map((p) =>
        getUserWithFallback(p.id).catch((err) => {
          console.warn(`Failed to fetch details for partner ${p.id}:`, err);
          return null;
        })
      );

      Promise.allSettled(detailPromises).then((results) => {
        const enriched = mapped.map((p, idx) => {
          const result = results[idx];
          if (result?.status === "fulfilled" && result.value?.data?.user) {
            const detail = result.value.data.user as any;
            return {
              ...p,
              phone: extractPhone(detail) || p.phone,
              city:
                detail.personal_data?.location ||
                detail.personal_data?.city ||
                p.city ||
                "",
              address: detail.personal_data?.address || p.address || "",
              province: detail.personal_data?.province || p.province || "",
            };
          }
          return p;
        });
        setPartners(enriched);
      });
    }

    if (qError) console.error("Failed to load partners:", qError);
  }, [uq, qLoading, qError]);

  const handleSuspend = async (partner: Partner) => {
    const result = await Swal.fire({
      title: `Suspend ${partner.company_name || partner.name}?`,
      input: "textarea",
      inputLabel: "Reason (optional)",
      inputPlaceholder: "Why are you suspending this partner?",
      showCancelButton: true,
      confirmButtonText: "Suspend",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
      preConfirm: (value: any) => value ?? "",
    });

    if (!result.isConfirmed) return;

    const reason = result.value || undefined;
    try {
      setActionLoadingId(partner.id);
      const resp = await updateUserStatus(partner.id, "suspended", reason);
      if (resp?.data?.user) {
        const u = resp.data.user as any;
        const mapped: Partner = {
          id: u.id,
          name: u.name || "",
          email: u.email || "",
          phone: extractPhone(u),
          company_name:
            u.personal_data?.company_name || u.company_name || u.name || "",
          status: (u.status as any) || "suspended",
          businesses_count: u.businesses_count ?? 0,
          created_at: u.created_at,
          updated_at: u.updated_at,
          address: u.personal_data?.address || "",
          city: u.personal_data?.location || "",
          province: u.personal_data?.province || "",
          verified:
            !!u.verified ||
            (Array.isArray(u.roles) &&
              u.roles.some((r: any) => r.name === "partner")),
        };
        setPartners((prev) =>
          prev.map((p) => (p.id === partner.id ? mapped : p))
        );
      }
      Swal.fire(
        "Success",
        `${partner.company_name || partner.name} suspended`,
        "success"
      );
    } catch (err) {
      Swal.fire(
        "Error",
        err instanceof Error ? err.message : "Failed to suspend partner",
        "error"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleActivate = async (partner: Partner) => {
    const result = await Swal.fire({
      title: `Activate ${partner.company_name || partner.name}?`,
      showCancelButton: true,
      confirmButtonText: "Activate",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#10b981",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setActionLoadingId(partner.id);
      const resp = await updateUserStatus(partner.id, "active");
      if (resp?.data?.user) {
        const u = resp.data.user as any;
        const mapped: Partner = {
          id: u.id,
          name: u.name || "",
          email: u.email || "",
          phone: extractPhone(u),
          company_name:
            u.personal_data?.company_name || u.company_name || u.name || "",
          status: (u.status as any) || "active",
          businesses_count: u.businesses_count ?? 0,
          created_at: u.created_at,
          updated_at: u.updated_at,
          address: u.personal_data?.address || "",
          city: u.personal_data?.location || "",
          province: u.personal_data?.province || "",
          verified:
            !!u.verified ||
            (Array.isArray(u.roles) &&
              u.roles.some((r: any) => r.name === "partner")),
        };
        setPartners((prev) =>
          prev.map((p) => (p.id === partner.id ? mapped : p))
        );
      }
      Swal.fire(
        "Success",
        `${partner.company_name || partner.name} activated`,
        "success"
      );
    } catch (err) {
      Swal.fire(
        "Error",
        err instanceof Error ? err.message : "Failed to activate partner",
        "error"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePartner = async (partner: Partner) => {
    const ask = await Swal.fire({
      title: `Hapus ${partner.company_name || partner.name}?`,
      text: "Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });

    if (!ask.isConfirmed) return;

    try {
      setActionLoadingId(partner.id);
      await deleteUserWithFallback(partner.id);
      setPartners((prev) => prev.filter((p) => p.id !== partner.id));
      setTotalPartners((prev) => Math.max(0, prev - 1));
      Swal.fire("Dihapus", "Mitra berhasil dihapus.", "success");
    } catch (err) {
      Swal.fire(
        "Error",
        err instanceof Error ? err.message : "Gagal menghapus mitra",
        "error"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleViewDetails = async (partnerId: string | number) => {
    try {
      setActionLoadingId(partnerId);
      const resp = await getUserWithFallback(partnerId);
      if (!resp?.data?.user) {
        Swal.fire("Not found", "Partner details not available", "info");
        return;
      }
      const u = resp.data.user as any;
      const mapped: Partner = {
        id: u.id,
        name: u.name || "",
        email: u.email || "",
        phone: extractPhone(u),
        company_name:
          u.personal_data?.company_name || u.company_name || u.name || "",
        status: (u.status as any) || "active",
        businesses_count: u.businesses_count ?? 0,
        created_at: u.created_at,
        updated_at: u.updated_at,
        address: u.personal_data?.address || "",
        city: u.personal_data?.location || "",
        province: u.personal_data?.province || "",
        verified:
          !!u.verified ||
          (Array.isArray(u.roles) &&
            u.roles.some((r: any) => r.name === "partner")),
      };
      setSelectedPartnerDetail(mapped);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Failed to fetch partner details", err);
      Swal.fire(
        "Error",
        err instanceof Error ? err.message : "Failed to fetch partner details",
        "error"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Create partner
  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoadingId("create");
    try {
      const payload = {
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        role: "partner",
        phone_number: createForm.phone_number || undefined,
        location: createForm.location || undefined,
      };
      const resp = await createUserWithFallback(payload as any);
      if (resp && (resp.status === 201 || resp.status === 200)) {
        Swal.fire("Success", resp.message || "Partner created", "success");
        setShowCreateModal(false);
        setCreateForm({
          name: "",
          email: "",
          password: "",
          phone_number: "",
          location: "",
        });
        // refresh partner list
        if (typeof refetch === "function") await refetch();
      } else {
        Swal.fire(
          "Error",
          resp?.message || "Failed to create partner",
          "error"
        );
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err instanceof Error ? err.message : "Failed to create partner",
        "error"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Aktif";
      case "suspended":
        return "Suspended";
      case "inactive":
        return "Tidak Aktif";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Mitra</h1>
        <p className="text-gray-600 mt-1">
          Kelola akun mitra dan bisnis mereka
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 w-full">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari nama mitra, email, atau perusahaan..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
          <div className="ml-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Buat Mitra
            </button>
          </div>
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Nama Perusahaan
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Bisnis
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {partners.map((partner) => (
                  <tr
                    key={partner.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {partner.company_name?.charAt(0).toUpperCase() ||
                            partner.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {partner.company_name || partner.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {partner.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {partner.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          partner.status
                        )}`}
                      >
                        {getStatusLabel(partner.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {partner.businesses_count || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(partner.id)}
                          disabled={actionLoadingId === partner.id}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                        >
                          {actionLoadingId === partner.id
                            ? "Loading..."
                            : "Lihat"}
                        </button>

                        {partner.status === "active" ? (
                          <button
                            onClick={() => handleSuspend(partner)}
                            disabled={actionLoadingId === partner.id}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            {actionLoadingId === partner.id
                              ? "Loading..."
                              : "Suspend"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(partner)}
                            disabled={actionLoadingId === partner.id}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 font-semibold rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                          >
                            {actionLoadingId === partner.id
                              ? "Loading..."
                              : "Aktifkan"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePartner(partner)}
                          disabled={actionLoadingId === partner.id}
                          className="px-3 py-1 text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          Hapus
                        </button>
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
              Halaman {currentPage} dari {totalPages} · Total {totalPartners}{" "}
              mitra
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Partner Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Buat Mitra Baru
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Tambahkan mitra bisnis baru ke sistem
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleCreatePartner} className="p-8 space-y-6">
              {/* Section 1: Informasi Dasar */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold">1</span>
                  </div>
                  Informasi Dasar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <input
                    required
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, name: e.target.value }))
                    }
                    placeholder="Nama Mitra / PIC"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    required
                    type="email"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, email: e.target.value }))
                    }
                    placeholder="Email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Section 2: Keamanan */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold">2</span>
                  </div>
                  Keamanan Akun
                </h3>
                <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <input
                    required
                    type="password"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, password: e.target.value }))
                    }
                    placeholder="Password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Section 3: Kontak & Lokasi */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  Kontak & Lokasi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <input
                    type="text"
                    value={createForm.phone_number}
                    onChange={(e) =>
                      setCreateForm((s) => ({
                        ...s,
                        phone_number: e.target.value,
                      }))
                    }
                    placeholder="Nomor Telepon (opsional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={createForm.location}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, location: e.target.value }))
                    }
                    placeholder="Lokasi (opsional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-md"
                >
                  Buat Mitra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partner Detail Modal */}
      {showDetailModal && selectedPartnerDetail && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {selectedPartnerDetail.company_name
                    ?.charAt(0)
                    .toUpperCase() ||
                    selectedPartnerDetail.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedPartnerDetail.company_name ||
                      selectedPartnerDetail.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedPartnerDetail.name}
                  </p>
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
                <span className="text-sm font-semibold text-gray-700 w-24">
                  Status:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    selectedPartnerDetail.status
                  )}`}
                >
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
                  <p className="text-gray-900 font-medium break-all">
                    {selectedPartnerDetail.email}
                  </p>
                </div>

                {/* Phone */}
                {selectedPartnerDetail.phone && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Phone size={16} className="text-purple-500" />
                      Telepon
                    </label>
                    <p className="text-gray-900 font-medium">
                      {selectedPartnerDetail.phone}
                    </p>
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
                      <p className="text-gray-900">
                        {selectedPartnerDetail.address}
                      </p>
                    </div>
                  )}
                  {selectedPartnerDetail.city && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 font-semibold">Kota</p>
                        <p className="text-gray-900">
                          {selectedPartnerDetail.city}
                        </p>
                      </div>
                      {selectedPartnerDetail.province && (
                        <div>
                          <p className="text-gray-600 font-semibold">
                            Provinsi
                          </p>
                          <p className="text-gray-900">
                            {selectedPartnerDetail.province}
                          </p>
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
                    <p className="text-xs text-gray-600 font-semibold uppercase">
                      Total Bisnis Terdaftar
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {selectedPartnerDetail.businesses_count}
                    </p>
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
                      ? new Date(
                          selectedPartnerDetail.created_at
                        ).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
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
                      {new Date(
                        selectedPartnerDetail.updated_at
                      ).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
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
  );
}
