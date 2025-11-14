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

// Helper to coerce/normalize a single destination item (top-level so it can be reused)
function normalizeDestination(item: any): Destination {
  return {
    uuid: item?.uuid,
    name: item?.name,
    location: item?.location,
    description: item?.description || '',
    price: typeof item?.price === 'string' ? Number(item.price) : item?.price ?? 0,
    rating: typeof item?.rating === 'string' ? Number(item.rating) : item?.rating ?? 0,
    categories: Array.isArray(item?.categories) ? item.categories : [],
    image_urls: Array.isArray(item?.image_urls) ? item.image_urls : [],
    owner_id: item?.owner_id || item?.owner?.id || '',
    created_at: item?.created_at,
    updated_at: item?.updated_at,
  }
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

  // Call API and normalize different backend shapes. Some backends return
  // { status, message, data: [ ... ], meta: { pagination: { ... } } }
  // while others return { status, message, data: { items: [...], ... } }
  const rawResponse = await tryApiWithMockFallback(
    () => apiCall(endpoint),
    () => getMockDestinations(page, perPage, search),
    isNetworkError
  )



  // If backend returned an array in data (legacy shape), normalize accordingly
  const maybeArray = rawResponse.data as any
  if (Array.isArray(maybeArray)) {
    const items = maybeArray.map(normalizeDestination)
    // try to read pagination from top-level meta or rawResponse.meta
    const pagination = (rawResponse as any).meta?.pagination || (rawResponse as any).pagination || null
    const current_page = pagination?.current_page ?? page
    const per_page = pagination?.per_page ?? perPage
    const total = pagination?.total ?? items.length
    const last_page = pagination?.last_page ?? 1

    return {
      status: rawResponse.status,
      message: rawResponse.message,
      data: {
        items,
        current_page,
        total,
        per_page,
        last_page,
      },
    }
  }

  // Otherwise expect the data to be an object with items
  const dataObj = (rawResponse.data || {}) as any
  const itemsRaw = Array.isArray(dataObj.items) ? dataObj.items : []
  const items = itemsRaw.map(normalizeDestination)
  // try to find pagination in multiple places
  const pagination = dataObj.meta?.pagination || (rawResponse as any).meta?.pagination || dataObj.pagination || null
  const current_page = pagination?.current_page ?? (dataObj.current_page ?? page)
  const per_page = pagination?.per_page ?? (dataObj.per_page ?? perPage)
  const total = pagination?.total ?? (dataObj.total ?? items.length)
  const last_page = pagination?.last_page ?? (dataObj.last_page ?? 1)

  return {
    status: rawResponse.status,
    message: rawResponse.message,
    data: {
      items,
      current_page,
      total,
      per_page,
      last_page,
    },
  }
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
    // Wrap real API call to normalize response shape: { data: { message, destination } }
    async () => {
      // Prepare payload: backend expects owner_id as integer in this API.
      // If owner_id is present but not numeric, omit it to avoid validation errors.
      const payload: any = { ...data }
      if (payload.owner_id !== undefined && payload.owner_id !== null) {
        // allow numeric values or numeric strings
        if (typeof payload.owner_id === 'string') {
          const asNum = Number(payload.owner_id)
          if (!Number.isFinite(asNum) || String(asNum) === 'NaN') {
            // not numeric -> drop owner_id
            delete payload.owner_id
          } else {
            payload.owner_id = asNum
          }
        }
      }

      const resp: any = await apiCall(API_ENDPOINTS.CREATE_DESTINATION, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      // Extract destination from different possible shapes
      const destRaw = resp?.data?.destination ?? resp?.data
      const dest = normalizeDestination(destRaw)
      return {
        status: resp.status,
        message: resp.message,
        data: dest,
      } as ApiResponse<Destination>
    },
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
    async () => {
      // For update, same owner_id handling as create: only send numeric owner_id
      const payload: any = { ...data }
      if (payload.owner_id !== undefined && payload.owner_id !== null) {
        if (typeof payload.owner_id === 'string') {
          const asNum = Number(payload.owner_id)
          if (!Number.isFinite(asNum) || String(asNum) === 'NaN') {
            delete payload.owner_id
          } else {
            payload.owner_id = asNum
          }
        }
      }

      const resp: any = await apiCall(API_ENDPOINTS.UPDATE_DESTINATION(uuid), {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      const destRaw = resp?.data?.destination ?? resp?.data
      const dest = normalizeDestination(destRaw)
      return {
        status: resp.status,
        message: resp.message,
        data: dest,
      } as ApiResponse<Destination>
    },
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
