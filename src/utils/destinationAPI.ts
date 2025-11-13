import { apiCall, API_ENDPOINTS, ApiError } from './api'
import type { ApiResponse } from './api'
import {
  getMockDestinations,
  createMockDestination,
  updateMockDestination,
  deleteMockDestination,
} from './mockAPI'

export interface Destination {
  uuid?: string
  name: string
  location: string
  description: string
  price: number
  rating: number
  categories: string[]
  image_urls: string[]
  owner_id: string
  created_at?: string
  updated_at?: string
}

export interface DestinationListResponse {
  items: Destination[]
  current_page: number
  total: number
  per_page: number
  last_page: number
}

// Helper function to try API, fallback to mock
async function tryApiWithMockFallback<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  mockCall: () => Promise<any>,
  isLikelyNetworkError: (error: any) => boolean
): Promise<ApiResponse<T>> {
  try {
    return await apiCall()
  } catch (error) {
    // If it's a network error and API is not available, use mock
    if (isLikelyNetworkError(error)) {
      console.log('API not available, using mock data')
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

// Get all destinations
export async function getDestinations(
  page = 1,
  perPage = 15,
  search?: string
): Promise<ApiResponse<DestinationListResponse>> {
  let endpoint = `${API_ENDPOINTS.DESTINATIONS}?page=${page}&per_page=${perPage}`
  if (search) {
    endpoint += `&search=${encodeURIComponent(search)}`
  }

  return tryApiWithMockFallback(
    () => apiCall(endpoint),
    () => getMockDestinations(page, perPage, search),
    isNetworkError
  )
}

// Get single destination
export async function getDestination(uuid: string): Promise<ApiResponse<{ destination: Destination }>> {
  return apiCall(API_ENDPOINTS.DESTINATION_DETAIL(uuid))
}

// Create destination
export async function createDestination(
  data: Omit<Destination, 'uuid' | 'created_at' | 'updated_at'>
): Promise<ApiResponse<Destination>> {
  return tryApiWithMockFallback(
    () =>
      apiCall(API_ENDPOINTS.CREATE_DESTINATION, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    () => createMockDestination(data),
    isNetworkError
  )
}

// Update destination
export async function updateDestination(
  uuid: string,
  data: Partial<Omit<Destination, 'uuid' | 'created_at' | 'updated_at'>>
): Promise<ApiResponse<Destination>> {
  return tryApiWithMockFallback(
    () =>
      apiCall(API_ENDPOINTS.UPDATE_DESTINATION(uuid), {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    () => updateMockDestination(uuid, data),
    isNetworkError
  )
}

// Delete destination
export async function deleteDestination(uuid: string): Promise<ApiResponse<any>> {
  return tryApiWithMockFallback(
    () =>
      apiCall(API_ENDPOINTS.DELETE_DESTINATION(uuid), {
        method: 'DELETE',
      }),
    () => deleteMockDestination(uuid),
    isNetworkError
  )
}
