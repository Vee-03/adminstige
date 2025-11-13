// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const API_ENDPOINTS = {
  // Auth endpoints
  ADMIN_LOGIN: '/admin/login',
  ADMIN_LOGOUT: '/admin/logout',
  
  // Destinations endpoints
  DESTINATIONS: '/destinations',
  DESTINATION_DETAIL: (uuid: string) => `/destinations/${uuid}`,
  CREATE_DESTINATION: '/destinations',
  UPDATE_DESTINATION: (uuid: string) => `/destinations/${uuid}`,
  DELETE_DESTINATION: (uuid: string) => `/destinations/${uuid}`,
  
  // Bookings endpoints (must use /admin/bookings, not /bookings)
  ADMIN_BOOKINGS: '/admin/bookings',
  BOOKING_DETAIL: (uuid: string) => `/admin/bookings/${uuid}`,
  CANCELLATIONS_PENDING: '/admin/bookings/cancellations/pending',
  APPROVE_CANCELLATION: (uuid: string) => `/admin/bookings/${uuid}/cancellation`,
  FORCE_CANCEL: (uuid: string) => `/admin/bookings/${uuid}/force-cancel`,
  
  // Checkouts endpoints
  ADMIN_CHECKOUTS: '/admin/checkouts',
  CHECKOUT_DETAIL: (orderId: string) => `/admin/checkouts/${orderId}`,
  
  // Users endpoints
  ADMIN_USERS: '/admin/users',
}

// Common API Response Interface
export interface ApiResponse<T> {
  status: number
  message: string
  data: T
}

// Error handling
export class ApiError extends Error {
  status: number
  data?: any

  constructor(status: number, message: string, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// Fetch wrapper with token support
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  // Add Bearer token if available
  const token = localStorage.getItem('admin_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(response.status, data.message || 'API Error', data)
    }

    return data
  } catch (error) {
    // If it's already an ApiError, rethrow it
    if (error instanceof ApiError) {
      throw error
    }

    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiError(
        0,
        `Tidak dapat terhubung ke server: ${API_BASE_URL}. Pastikan backend sudah running.`,
        { originalError: error }
      )
    }

    // Handle other errors
    throw new ApiError(
      0,
      error instanceof Error ? error.message : 'Terjadi kesalahan saat melakukan request',
      { originalError: error }
    )
  }
}
