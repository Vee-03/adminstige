import { apiCall, API_ENDPOINTS, ApiError } from './api'
import type { ApiResponse } from './api'

// Checkout Interfaces
export interface User {
  id: string
  name: string
  email?: string
  email_verified_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface Destination {
  uuid: string
  name: string
  location: string
  description?: string
  price?: string | number
  rating?: string | number
  categories?: string[]
  image_urls?: string[]
  owner_id?: string
  created_at?: string
  updated_at?: string
}

export interface CheckoutData {
  uuid?: string
  booking_uuid?: string
  payment_status: number | string
  payment_method?: string
  total_amount?: number | string
  paid_at?: string | null
}

export interface Booking {
  uuid: string
  user_id: string
  order_id: string
  destination_uuid: string
  quantity: number
  brand?: string
  category?: string
  merchant_name?: string
  date: string
  cancellation_status: string | null
  cancellation_requested_at?: string | null
  cancellation_approved_at?: string | null
  cancellation_rejected_at?: string | null
  cancellation_reason?: string | null
  admin_notes?: string | null
  created_at?: string
  updated_at?: string
  destination?: Destination
  user?: User
  checkout_data?: CheckoutData
}

export interface Checkout {
  uuid: string
  order_id: string
  user_id: string
  payment_status: number
  payment_token?: string
  payment_url?: string
  created_at: string
  updated_at: string
  user?: User
  bookings?: Booking[]
}

export interface CheckoutListResponse {
  items: Checkout[]
  current_page: number
  total: number
  per_page: number
  last_page: number
}

export interface CheckoutDetailResponse {
  checkout: Checkout
}

// Get all checkouts with filters and pagination
export async function getCheckouts(
  page = 1,
  perPage = 15,
  filters?: {
    search?: string
    payment_status?: string
    user_id?: string
    date_from?: string
    date_to?: string
    sort_by?: string
    sort_order?: string
  }
): Promise<ApiResponse<CheckoutListResponse>> {
  let endpoint = `${API_ENDPOINTS.ADMIN_CHECKOUTS}?page=${page}&per_page=${perPage}`

  if (filters) {
    if (filters.search) endpoint += `&search=${encodeURIComponent(filters.search)}`
    if (filters.payment_status) endpoint += `&payment_status=${filters.payment_status}`
    if (filters.user_id) endpoint += `&user_id=${filters.user_id}`
    if (filters.date_from) endpoint += `&date_from=${filters.date_from}`
    if (filters.date_to) endpoint += `&date_to=${filters.date_to}`
    if (filters.sort_by) endpoint += `&sort_by=${filters.sort_by}`
    if (filters.sort_order) endpoint += `&sort_order=${filters.sort_order}`
  }

  return apiCall(endpoint)
}

// Get checkout detail by order ID
export async function getCheckoutDetail(orderId: string): Promise<ApiResponse<CheckoutDetailResponse>> {
  return apiCall(API_ENDPOINTS.CHECKOUT_DETAIL(orderId))
}

// Helper function to check if error is network error
function isNetworkError(error: any): boolean {
  if (error instanceof ApiError && error.status === 0) {
    return true
  }
  return false
}

// Helper function to try API with fallback (will use fallback when backend ready)
async function tryApiWithMockFallback<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  mockCall: () => Promise<any>,
  isLikelyNetworkError: (error: any) => boolean
): Promise<ApiResponse<T>> {
  try {
    return await apiCall()
  } catch (error) {
    if (isLikelyNetworkError(error)) {
      console.log('Checkout API not available, using fallback')
      return await mockCall()
    }
    throw error
  }
}

// Get all checkouts with fallback
export async function getCheckoutsWithFallback(
  page = 1,
  perPage = 15,
  filters?: Parameters<typeof getCheckouts>[2]
): Promise<ApiResponse<CheckoutListResponse>> {
  return tryApiWithMockFallback(
    () => getCheckouts(page, perPage, filters),
    async () => ({
      status: 200,
      message: 'Checkouts retrieved successfully.',
      data: {
        items: [],
        current_page: page,
        total: 0,
        per_page: perPage,
        last_page: 0,
      },
    }),
    isNetworkError
  )
}

// Get checkout detail with fallback
export async function getCheckoutDetailWithFallback(
  orderId: string
): Promise<ApiResponse<CheckoutDetailResponse>> {
  return tryApiWithMockFallback(
    () => getCheckoutDetail(orderId),
    async () => ({
      status: 200,
      message: 'Info.',
      data: {
        checkout: {
          uuid: '',
          order_id: orderId,
          user_id: '',
          payment_status: 0,
          created_at: '',
          updated_at: '',
        },
      },
    }),
    isNetworkError
  )
}
