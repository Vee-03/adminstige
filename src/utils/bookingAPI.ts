import { apiCall, API_ENDPOINTS, ApiError } from './api'
import type { ApiResponse } from './api'
import {
  getMockBookings,
  getMockBooking,
  getMockPendingCancellations,
  updateMockCancellationStatus,
  mockForceCancelBooking,
} from './mockAPI'

// Booking Interfaces berdasarkan Notion API Documentation
export interface User {
  id: number
  name: string
  email: string
  created_at?: string
}

export interface Destination {
  uuid: string
  name: string
  location: string
  description?: string
  price?: number
  categories?: string[]
  images?: string[]
  rating?: number
}

export interface CheckoutData {
  uuid: string
  booking_uuid?: string
  payment_status: 'paid' | 'unpaid'
  payment_method?: string
  total_amount?: number
  paid_at?: string
}

export interface Booking {
  uuid: string
  user_id: number
  destination_uuid: string
  date: string // YYYY-MM-DD format
  quantity: number
  brand?: string
  category?: string
  merchant_name?: string
  total_price: number
  cancellation_status: 'pending' | 'approved' | 'rejected' | null
  cancellation_requested_at?: string
  cancellation_approved_at?: string | null
  cancellation_rejected_at?: string | null
  cancellation_reason?: string
  admin_notes?: string | null
  created_at: string
  updated_at: string
  user?: User
  destination?: Destination
  checkout_data?: CheckoutData
}

export interface BookingListResponse {
  items: Booking[]
  current_page: number
  total: number
  per_page: number
  last_page: number
}

export interface BookingDetailsResponse {
  booking: Booking
}

export interface PendingCancellationsResponse {
  data: Booking[]
  current_page: number
  total: number
  per_page: number
  last_page: number
}

// Get all bookings with filters and pagination
export async function getBookings(
  page = 1,
  perPage = 15,
  filters?: {
    search?: string
    status?: string
    cancellation_status?: string
    payment_status?: string
    user_id?: number
    destination_uuid?: string
    date_from?: string
    date_to?: string
    sort_by?: string
    sort_order?: string
  }
): Promise<ApiResponse<BookingListResponse>> {
  let endpoint = `${API_ENDPOINTS.ADMIN_BOOKINGS}?page=${page}&per_page=${perPage}`

  if (filters) {
    if (filters.search) endpoint += `&search=${encodeURIComponent(filters.search)}`
    if (filters.status) endpoint += `&status=${filters.status}`
    if (filters.cancellation_status) endpoint += `&cancellation_status=${filters.cancellation_status}`
    if (filters.payment_status) endpoint += `&payment_status=${filters.payment_status}`
    if (filters.user_id) endpoint += `&user_id=${filters.user_id}`
    if (filters.destination_uuid) endpoint += `&destination_uuid=${filters.destination_uuid}`
    if (filters.date_from) endpoint += `&date_from=${filters.date_from}`
    if (filters.date_to) endpoint += `&date_to=${filters.date_to}`
    if (filters.sort_by) endpoint += `&sort_by=${filters.sort_by}`
    if (filters.sort_order) endpoint += `&sort_order=${filters.sort_order}`
  }

  return apiCall(endpoint)
}

// Get single booking details
export async function getBooking(uuid: string): Promise<ApiResponse<BookingDetailsResponse>> {
  return apiCall(API_ENDPOINTS.BOOKING_DETAIL(uuid))
}

// Get pending cancellation requests
export async function getPendingCancellations(
  page = 1,
  perPage = 15,
  sortBy?: string,
  sortOrder?: string
): Promise<ApiResponse<PendingCancellationsResponse>> {
  let endpoint = `${API_ENDPOINTS.CANCELLATIONS_PENDING}?page=${page}&per_page=${perPage}`

  if (sortBy) endpoint += `&sort_by=${sortBy}`
  if (sortOrder) endpoint += `&sort_order=${sortOrder}`

  return apiCall(endpoint)
}

// Approve or reject cancellation request
export async function updateCancellationStatus(
  uuid: string,
  status: 'approved' | 'rejected',
  adminNotes?: string
): Promise<ApiResponse<Booking>> {
  return apiCall(API_ENDPOINTS.APPROVE_CANCELLATION(uuid), {
    method: 'PATCH',
    body: JSON.stringify({
      cancellation_status: status,
      admin_notes: adminNotes,
    }),
  })
}

// Force cancel a booking
export async function forceCancelBooking(uuid: string, reason: string): Promise<ApiResponse<Booking>> {
  return apiCall(API_ENDPOINTS.FORCE_CANCEL(uuid), {
    method: 'POST',
    body: JSON.stringify({
      reason,
    }),
  })
}

// Admin login
export async function adminLogin(
  email: string,
  password: string
): Promise<ApiResponse<{ token: string; user?: any }>> {
  return apiCall(API_ENDPOINTS.ADMIN_LOGIN, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// Admin logout
export async function adminLogout(): Promise<ApiResponse<any>> {
  return apiCall(API_ENDPOINTS.ADMIN_LOGOUT, {
    method: 'POST',
  })
}

// Helper function to try API with mock fallback
async function tryApiWithMockFallback<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  mockCall: () => Promise<any>,
  isLikelyNetworkError: (error: any) => boolean
): Promise<ApiResponse<T>> {
  try {
    return await apiCall()
  } catch (error) {
    if (isLikelyNetworkError(error)) {
      console.log('API not available, using mock booking data')
      return await mockCall()
    }
    throw error
  }
}

// Check if error is likely a network/connection error
function isNetworkError(error: any): boolean {
  if (error instanceof ApiError && error.status === 0) {
    return true
  }
  return false
}

// Get all bookings with mock fallback
export async function getBookingsWithFallback(
  page = 1,
  perPage = 15,
  filters?: Parameters<typeof getBookings>[2]
): Promise<ApiResponse<BookingListResponse>> {
  return tryApiWithMockFallback(
    () => getBookings(page, perPage, filters),
    () => getMockBookings(page, perPage, filters),
    isNetworkError
  )
}

// Get single booking with mock fallback
export async function getBookingWithFallback(uuid: string): Promise<ApiResponse<BookingDetailsResponse>> {
  return tryApiWithMockFallback(
    () => getBooking(uuid),
    () => getMockBooking(uuid),
    isNetworkError
  )
}

// Get pending cancellations with mock fallback
export async function getPendingCancellationsWithFallback(
  page = 1,
  perPage = 15
): Promise<ApiResponse<PendingCancellationsResponse>> {
  return tryApiWithMockFallback(
    () => getPendingCancellations(page, perPage),
    () => getMockPendingCancellations(page, perPage),
    isNetworkError
  )
}

// Update cancellation status with mock fallback
export async function updateCancellationStatusWithFallback(
  uuid: string,
  status: 'approved' | 'rejected',
  adminNotes?: string
): Promise<ApiResponse<Booking>> {
  return tryApiWithMockFallback(
    () => updateCancellationStatus(uuid, status, adminNotes),
    () => updateMockCancellationStatus(uuid, status, adminNotes),
    isNetworkError
  )
}

// Force cancel booking with mock fallback
export async function forceCancelBookingWithFallback(
  uuid: string,
  reason: string
): Promise<ApiResponse<Booking>> {
  return tryApiWithMockFallback(
    () => forceCancelBooking(uuid, reason),
    () => mockForceCancelBooking(uuid, reason),
    isNetworkError
  )
}
