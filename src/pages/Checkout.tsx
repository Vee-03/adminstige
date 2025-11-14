import { useState, useCallback } from "react";
import { Eye, Search } from "lucide-react";
import CheckoutDetails from "./CheckoutDetails";
import { getAdminCheckouts } from "../utils/api";
import type { CheckoutItem } from "../types/checkout";
import { useQuery } from "@tanstack/react-query";

/*
  Allow some `any` usages in this file for rapid normalization handling.
  These are guarded at runtime and will be cleaned up later by moving
  normalization into typed API helpers.
*/
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function Checkout() {
  // Local mirroring replaced by using React Query's data/loading/error directly
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCheckout, setSelectedCheckout] = useState<CheckoutItem | null>(
    null
  );
  // pollingRef removed (unused) after migrating to React Query
  // Normalization helper: fetch from API and normalize to UI CheckoutItem shape
  const fetchAndNormalize = useCallback(async () => {
    const res = await getAdminCheckouts({ page: 1, perPage: 100 });
    const items = (res?.data?.items || []) as any[];
    const mapped: CheckoutItem[] = items.map((it) => {
      const anyIt = it as any;
      // Try to read total_price directly, otherwise compute from bookings (quantity * destination.price)
      const directPrice = anyIt.total_price;
      let total = Number(directPrice);
      if (!Number.isFinite(total) || total === 0) {
        const bookings = Array.isArray(anyIt.bookings) ? anyIt.bookings : [];
        total = bookings.reduce((sum: number, b: any) => {
          const price = Number(b?.destination?.price ?? b?.price ?? 0);
          const qty = Number(b?.quantity ?? 1);
          return (
            sum +
            (Number.isFinite(price)
              ? price * (Number.isFinite(qty) ? qty : 1)
              : 0)
          );
        }, 0);
      }

      // user_name: prefer explicit user_name, then nested user.name
      const userName =
        anyIt.user_name || anyIt.user?.name || anyIt.user?.full_name || "";

      // destination_name: prefer explicit, otherwise the first booking's destination name
      let destName = anyIt.destination_name || "";
      if (!destName) {
        const firstBooking =
          Array.isArray(anyIt.bookings) && anyIt.bookings.length > 0
            ? anyIt.bookings[0]
            : null;
        destName =
          firstBooking?.destination?.name ||
          firstBooking?.destination_name ||
          "";
      }

      // payment_status is numeric (0/1) in the API sample: 1 -> paid
      const status = Number(anyIt.payment_status) === 1 ? "paid" : "unpaid";

      return {
        id: it.uuid,
        user_name: userName,
        destination_name: destName,
        total_price: Number.isFinite(total) ? total : 0,
        status: status as "paid" | "unpaid",
        created_at: it.created_at,
      };
    });

    return mapped;
  }, []);

  // Use React Query to fetch and cache the checkouts; keep polling disabled (manual refresh available)
  const {
    data,
    isLoading: qLoading,
    error: qError,
    refetch,
  } = useQuery({
    queryKey: ["adminCheckouts", { page: 1, perPage: 100 }],
    queryFn: fetchAndNormalize,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const filtered = (data || []).filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      (c.user_name || "").toLowerCase().includes(term) ||
      (c.destination_name || "").toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: "paid" | "unpaid") => {
    let className = "";
    switch (status) {
      case "paid":
        className = "bg-green-100 text-green-800";
        break;
      case "unpaid":
        className = "bg-red-100 text-red-800";
        break;
    }
    return (
      <span
        className={`px-3 py-1 rounded-lg text-xs font-semibold ${className}`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  if (selectedCheckout) {
    return (
      <CheckoutDetails
        checkout={selectedCheckout}
        onBack={() => setSelectedCheckout(null)}
      />
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          Checkout Management
        </h2>
        <p className="text-gray-600 font-medium">
          Kelola data transaksi checkout pengguna
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari user atau destinasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={qLoading}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {qLoading ? (
          <div className="px-6 py-16 text-center text-gray-500 font-semibold">
            Memuat data checkout...
          </div>
        ) : qError ? (
          <div className="px-6 py-16 text-center text-red-500 font-semibold">
            {(qError as any)?.message || "Gagal mengambil data checkout"}
          </div>
        ) : filtered.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-linear-to-r from-orange-50 to-orange-100 border-b-2 border-orange-200">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                  Destination
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                  Total Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">
                  Created At
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-800">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-orange-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {c.user_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {c.destination_name}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-orange-600">
                    Rp {c.total_price.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(c.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(c.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setSelectedCheckout(c)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded transition"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-16 text-center text-gray-500 font-semibold">
            Tidak ada data checkout ditemukan
          </div>
        )}
      </div>
    </div>
  );
}
