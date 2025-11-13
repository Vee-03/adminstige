import { apiCall, API_ENDPOINTS, ApiError } from './api'
import type { ApiResponse } from './api'

// User Interfaces
export interface User {
  id: string | number
  name: string
  email: string
  email_verified_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface UserListResponse {
  items: User[]
  current_page: number
  total: number
  per_page: number
  last_page: number
}

export interface UserDetailResponse {
  user: User
}

// Get all users with pagination and search
export async function getUsers(
  page = 1,
  perPage = 5,
  search?: string,
  sortBy = 'created_at',
  sortOrder = 'desc'
): Promise<ApiResponse<UserListResponse>> {
  let endpoint = `${API_ENDPOINTS.ADMIN_USERS}?page=${page}&per_page=${perPage}&sort_by=${sortBy}&sort_order=${sortOrder}`

  if (search) {
    endpoint += `&search=${encodeURIComponent(search)}`
  }

  return apiCall(endpoint)
}

// Get single user details
export async function getUser(userId: string | number): Promise<ApiResponse<UserDetailResponse>> {
  return apiCall(`${API_ENDPOINTS.ADMIN_USERS}/${userId}`)
}

// Helper function to check if error is network error
function isNetworkError(error: any): boolean {
  if (error instanceof ApiError && error.status === 0) {
    return true
  }
  return false
}

// Mock users for fallback
const mockUsers: User[] = [
  {
    id: '019a7715-bfcc-709c-91d5-92fe878c9d83',
    name: 'John Doe',
    email: 'john@example.com',
    created_at: '2025-11-12T08:01:45.000000Z',
  },
  {
    id: '019a7716-bfcc-709c-91d5-92fe878c9d84',
    name: 'Jane Smith',
    email: 'jane@example.com',
    created_at: '2025-11-12T08:02:30.000000Z',
  },
  {
    id: '019a7717-bfcc-709c-91d5-92fe878c9d85',
    name: 'John Smith',
    email: 'johnsmith@example.com',
    created_at: '2025-11-12T08:03:15.000000Z',
  },
  {
    id: '019a7718-bfcc-709c-91d5-92fe878c9d86',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    created_at: '2025-11-12T08:04:00.000000Z',
  },
  {
    id: '019a7719-bfcc-709c-91d5-92fe878c9d87',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    created_at: '2025-11-12T08:04:45.000000Z',
  },
  {
    id: '019a771a-bfcc-709c-91d5-92fe878c9d88',
    name: 'Carol Davis',
    email: 'carol@example.com',
    created_at: '2025-11-12T08:05:30.000000Z',
  },
  {
    id: '019a771b-bfcc-709c-91d5-92fe878c9d89',
    name: 'David Miller',
    email: 'david@example.com',
    created_at: '2025-11-12T08:06:15.000000Z',
  },
]

// Get mock users with pagination and search
async function getMockUsers(
  page = 1,
  perPage = 5,
  search?: string
): Promise<ApiResponse<UserListResponse>> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  let filtered = [...mockUsers]

  // Apply search filter
  if (search) {
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )
  }

  // Apply pagination
  const start = (page - 1) * perPage
  const items = filtered.slice(start, start + perPage)

  return {
    status: 200,
    message: 'Users retrieved successfully.',
    data: {
      items,
      current_page: page,
      total: filtered.length,
      per_page: perPage,
      last_page: Math.ceil(filtered.length / perPage),
    },
  }
}

// Helper function to try API with mock fallback
async function tryApiWithMockFallback<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  mockCall: () => Promise<ApiResponse<T>>,
  isLikelyNetworkError: (error: any) => boolean
): Promise<ApiResponse<T>> {
  try {
    return await apiCall()
  } catch (error) {
    if (isLikelyNetworkError(error)) {
      console.log('User API not available, using mock data')
      return await mockCall()
    }
    throw error
  }
}

// Get all users with fallback
export async function getUsersWithFallback(
  page = 1,
  perPage = 5,
  search?: string,
  sortBy = 'created_at',
  sortOrder = 'desc'
): Promise<ApiResponse<UserListResponse>> {
  return tryApiWithMockFallback(
    () => getUsers(page, perPage, search, sortBy, sortOrder),
    () => getMockUsers(page, perPage, search),
    isNetworkError
  )
}

// Get single user with fallback
export async function getUserWithFallback(userId: string | number): Promise<ApiResponse<UserDetailResponse>> {
  try {
    return await getUser(userId)
  } catch (error) {
    if (isNetworkError(error)) {
      console.log('User API not available, using mock data')
      const mockUser = mockUsers.find((u) => u.id === userId)
      if (mockUser) {
        return {
          status: 200,
          message: 'User retrieved successfully.',
          data: { user: mockUser },
        }
      }
      throw new Error('User not found')
    }
    throw error
  }
}
