// adminstige/src/assets/api/api.ts

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const API_ENDPOINTS = {
  // Auth endpoints
  ADMIN_LOGIN: "/admin/login",
  ADMIN_LOGOUT: "/admin/logout",

  // Destinations endpoints
  DESTINATIONS: "/admin/destinations",
  DESTINATION_DETAIL: (uuid: string) => `/admin/destinations/${uuid}`,
  CREATE_DESTINATION: "/admin/destinations",
  UPDATE_DESTINATION: (uuid: string) => `/admin/destinations/${uuid}`,
  DELETE_DESTINATION: (uuid: string) => `/admin/destinations/${uuid}`,

  // Bookings endpoints (must use /admin/bookings, not /bookings)
  ADMIN_BOOKINGS: "/admin/bookings",
  BOOKING_DETAIL: (uuid: string) => `/admin/bookings/${uuid}`,
  CANCELLATIONS_PENDING: "/admin/bookings/cancellations/pending",
  APPROVE_CANCELLATION: (uuid: string) =>
    `/admin/bookings/${uuid}/cancellation`,
  FORCE_CANCEL: (uuid: string) => `/admin/bookings/${uuid}/force-cancel`,

  // Checkouts endpoints
  ADMIN_CHECKOUTS: "/admin/checkouts",
  CHECKOUT_DETAIL: (uuid: string) => `/admin/checkouts/${uuid}`,

  // Users endpoints
  ADMIN_USERS: "/admin/users",
  // Admin dashboard
  ADMIN_DASHBOARD: "/admin/dashboard",
  DELETE_USER: (uuid: string) => `/admin/users/${uuid}`,
} as const;

// Common API Response Interface
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Error handling
export class ApiError extends Error {
  status: number;
  data?: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Fetch wrapper with token support
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Add Bearer token if available
  const token = localStorage.getItem("admin_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    console.warn(
      "[apiCall] No admin token found in localStorage (key: admin_token). Requests will be unauthenticated."
    );
  }

  // Support option to use credentials (cookie-based auth) via a non-standard flag
  const useCredentials = (options as any)?.useCredentials === true;

  try {
    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };
    if (useCredentials) {
      (fetchOptions as any).credentials = "include";
    }

    const response = await fetch(url, fetchOptions);

    // If no content (204), return a generic shape
    if (response.status === 204) {
      return {
        status: 204,
        message: "No content",
        data: null as unknown as T,
      };
    }

    // Read raw text first to avoid JSON.parse errors on non-JSON responses
    const text = await response.text();

    // try to parse JSON, but don't fail if it's not valid JSON
    let parsed: any = null;
    let isJson = false;
    try {
      parsed = text ? JSON.parse(text) : null;
      isJson = true;
    } catch (e) {
      isJson = false;
    }

    if (!response.ok) {
      const errData = isJson ? parsed : { raw: text };
      const message = isJson
        ? parsed?.message || response.statusText
        : text || response.statusText;
      // If backend indicates unauthenticated, remove stored token to prompt re-login
      const unauthenticatedDetected =
        response.status === 401 ||
        (isJson &&
          typeof parsed?.message === "string" &&
          parsed.message.toLowerCase().includes("unauthenticated"));
      if (unauthenticatedDetected) {
        console.warn(
          "[apiCall] Server returned unauthenticated. Removing stored admin_token."
        );
        localStorage.removeItem("admin_token");
      }
      if (!isJson) {
        // Log raw non-JSON error (commonly a server HTML error page)
        // Keep it concise so logs don't explode
        console.error(`[apiCall] Non-JSON error response from ${url}`, {
          status: response.status,
          snippet: (text || "").slice(0, 200),
        });
      }
      throw new ApiError(response.status, message, errData);
    }

    if (isJson) {
      return parsed as ApiResponse<T>;
    }

    // If response is OK but not JSON, log a short snippet and return fallback shape
    console.warn(`[apiCall] Non-JSON OK response from ${url}`, {
      status: response.status,
      snippet: (text || "").slice(0, 200),
    });

    return {
      status: response.status,
      message: response.statusText || "OK",
      data: text as unknown as T,
    };
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new ApiError(
        0,
        `Tidak dapat terhubung ke server: ${API_BASE_URL}. Pastikan backend sudah running.`,
        { originalError: error }
      );
    }

    throw new ApiError(
      0,
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat melakukan request",
      { originalError: error }
    );
  }
}

// -----------------------
// Admin Checkouts API
// -----------------------

export type PaymentStatus = "paid" | "unpaid";

export interface CheckoutItem {
  uuid: string;
  user_name: string;
  destination_name: string;
  total_price: number;
  payment_status: PaymentStatus | null;
  created_at: string;
}

export interface GetCheckoutsResponse {
  items: CheckoutItem[];
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
  };
}

// -----------------------
// Admin Dashboard API
// -----------------------

export interface RevenueStats {
  total: number;
  period_days: number;
  growth_percentage: number;
  transactions_count: number;
}

export interface BookingsStats {
  total: number;
  paid: number;
  unpaid: number;
  pending_cancellations: number;
}

export interface UsersStats {
  total: number;
  new_users: number;
  admins: number;
  regular_users: number;
}

export interface MostBookedDestination {
  uuid: string;
  name: string;
  location: string;
  price: string;
  bookings_count: number;
}

export interface DestinationsStats {
  total: number;
  most_booked: MostBookedDestination[];
}

export interface CancellationsStats {
  pending: number;
  approved: number;
  rejected: number;
}

export interface RecentTransaction {
  order_id: string;
  user: {
    id: string;
    name: string;
    email?: string;
  };
  total_amount: number;
  created_at: string;
}

export interface DashboardStats {
  revenue: RevenueStats;
  bookings: BookingsStats;
  users: UsersStats;
  destinations: DestinationsStats;
  cancellations: CancellationsStats;
  recent_transactions: RecentTransaction[];
}

export interface GetDashboardResponse {
  stats: DashboardStats;
}

// GET: /admin/checkouts
export async function getAdminCheckouts(params?: {
  page?: number;
  perPage?: number;
  search?: string;
  payment_status?: PaymentStatus;
}): Promise<ApiResponse<GetCheckoutsResponse>> {
  const qs = new URLSearchParams();
  if (params?.page) qs.append("page", String(params.page));
  if (params?.perPage) qs.append("per_page", String(params.perPage));
  if (params?.search) qs.append("q", params.search);
  if (params?.payment_status)
    qs.append("payment_status", params.payment_status);

  const endpoint = `${API_ENDPOINTS.ADMIN_CHECKOUTS}${
    qs.toString() ? `?${qs.toString()}` : ""
  }`;
  return apiCall<GetCheckoutsResponse>(endpoint, { method: "GET" });
}

// GET: /admin/dashboard
export async function getAdminDashboard(): Promise<
  ApiResponse<GetDashboardResponse>
> {
  return apiCall<GetDashboardResponse>(API_ENDPOINTS.ADMIN_DASHBOARD, {
    method: "GET",
  });
}

// GET: /admin/checkouts/{uuid}
export async function getAdminCheckout(
  uuid: string
): Promise<ApiResponse<{ checkout: CheckoutItem }>> {
  return apiCall<{ checkout: CheckoutItem }>(
    API_ENDPOINTS.CHECKOUT_DETAIL(uuid),
    { method: "GET" }
  );
}

// PUT: /admin/checkouts/{uuid}
export async function updateCheckoutPaymentStatus(
  uuid: string,
  payment_status: PaymentStatus
): Promise<ApiResponse<{ checkout: CheckoutItem }>> {
  return apiCall<{ checkout: CheckoutItem }>(
    API_ENDPOINTS.CHECKOUT_DETAIL(uuid),
    {
      method: "PUT",
      body: JSON.stringify({ payment_status }),
    }
  );
}
