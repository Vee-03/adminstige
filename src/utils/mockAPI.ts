// Mock API untuk development saat backend belum ready
// Ini hanya untuk testing, akan diganti dengan API real nanti

const MOCK_DELAY = 300 // ms

export const mockDestinations = [
  {
    uuid: '019a7722-3511-710b-9b3f-e77a2b5100b9',
    name: 'Taman Nasional Bromo',
    description: 'Pemandangan gunung vulkanik yang spektakuler dengan lautan pasir',
    location: 'Jawa Timur',
    price: 100000,
    rating: 4.9,
    categories: ['Alam', 'Adventure'],
    image_urls: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500'],
    owner_id: '019a7722-3511-710b-9b3f-e77a2b5100b9',
    created_at: '2024-01-15T00:00:00.000000Z',
    updated_at: '2024-01-15T00:00:00.000000Z',
  },
  {
    uuid: '019a7723-3511-710b-9b3f-e77a2b5100b9',
    name: 'Candi Borobudur',
    description: 'Candi Buddha terbesar di dunia dengan arsitektur megah',
    location: 'Yogyakarta',
    price: 75000,
    rating: 4.8,
    categories: ['Budaya', 'Sejarah'],
    image_urls: ['https://images.unsplash.com/photo-1537225228614-b4fad34a0b60?w=500'],
    owner_id: '019a7722-3511-710b-9b3f-e77a2b5100b9',
    created_at: '2024-01-20T00:00:00.000000Z',
    updated_at: '2024-01-20T00:00:00.000000Z',
  },
  {
    uuid: '019a7724-3511-710b-9b3f-e77a2b5100b9',
    name: 'Pantai Kuta',
    description: 'Pantai pasir putih dengan ombak indah',
    location: 'Bali',
    price: 50000,
    rating: 4.7,
    categories: ['Pantai', 'Relaksasi'],
    image_urls: ['https://images.unsplash.com/photo-1506704720897-c6b0b8ef6dba?w=500'],
    owner_id: '019a7722-3511-710b-9b3f-e77a2b5100b9',
    created_at: '2024-01-25T00:00:00.000000Z',
    updated_at: '2024-01-25T00:00:00.000000Z',
  },
]

export const mockBookings = [
  {
    uuid: '019a7881-020a-7068-af15-506b5e02e719',
    user_id: 1,
    destination_uuid: '019a7722-3511-710b-9b3f-e77a2b5100b9',
    date: '2025-02-15',
    quantity: 2,
    brand: 'Premium Package',
    category: 'Adventure',
    merchant_name: 'Bromo Tours',
    total_price: 500000,
    cancellation_status: 'pending' as const,
    cancellation_requested_at: '2025-01-14T08:30:00.000000Z',
    cancellation_approved_at: null,
    cancellation_rejected_at: null,
    cancellation_reason: 'Family emergency',
    admin_notes: null,
    created_at: '2025-01-10T10:00:00.000000Z',
    updated_at: '2025-01-14T08:30:00.000000Z',
    user: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      created_at: '2024-12-01T00:00:00.000000Z',
    },
    destination: {
      uuid: '019a7722-3511-710b-9b3f-e77a2b5100b9',
      name: 'Taman Nasional Bromo',
      location: 'Jawa Timur',
    },
    checkout_data: {
      uuid: '019a7881-020b-7068-af15-506b5e02e720',
      payment_status: 'paid' as const,
      payment_method: 'credit_card',
      total_amount: 500000,
      paid_at: '2025-01-10T11:00:00.000000Z',
    },
  },
  {
    uuid: '019a7882-020a-7068-af15-506b5e02e720',
    user_id: 2,
    destination_uuid: '019a7723-3511-710b-9b3f-e77a2b5100b9',
    date: '2025-03-20',
    quantity: 1,
    brand: 'Standard Package',
    category: 'Budaya',
    merchant_name: 'Borobudur Cultural Tours',
    total_price: 300000,
    cancellation_status: 'approved' as const,
    cancellation_requested_at: '2025-01-12T14:00:00.000000Z',
    cancellation_approved_at: '2025-01-13T09:15:00.000000Z',
    cancellation_rejected_at: null,
    cancellation_reason: 'Schedule conflict',
    admin_notes: 'Approved - customer rescheduled for later date',
    created_at: '2025-01-08T15:30:00.000000Z',
    updated_at: '2025-01-13T09:15:00.000000Z',
    user: {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      created_at: '2024-12-05T00:00:00.000000Z',
    },
    destination: {
      uuid: '019a7723-3511-710b-9b3f-e77a2b5100b9',
      name: 'Candi Borobudur',
      location: 'Yogyakarta',
    },
    checkout_data: {
      uuid: '019a7882-020b-7068-af15-506b5e02e721',
      payment_status: 'unpaid' as const,
    },
  },
]

// Simulate API delay
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Mock getDestinations
export async function getMockDestinations(page = 1, perPage = 15, search?: string) {
  await delay(MOCK_DELAY)

  let filtered = [...mockDestinations]

  if (search) {
    filtered = filtered.filter(
      (d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.location.toLowerCase().includes(search.toLowerCase())
    )
  }

  const start = (page - 1) * perPage
  const items = filtered.slice(start, start + perPage)

  return {
    status: 200,
    message: 'Success',
    data: {
      items,
      current_page: page,
      total: filtered.length,
      per_page: perPage,
      last_page: Math.ceil(filtered.length / perPage),
    },
  }
}

// Mock createDestination
export async function createMockDestination(data: any) {
  await delay(MOCK_DELAY)

  const newDestination = {
    uuid: 'mock-' + Date.now(),
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  mockDestinations.push(newDestination)

  return {
    status: 201,
    message: 'Destination created',
    data: newDestination,
  }
}

// Mock updateDestination
export async function updateMockDestination(uuid: string, data: any) {
  await delay(MOCK_DELAY)

  const index = mockDestinations.findIndex((d) => d.uuid === uuid)
  if (index === -1) {
    throw new Error('Destination not found')
  }

  const updated = {
    ...mockDestinations[index],
    ...data,
    uuid,
    updated_at: new Date().toISOString(),
  }

  mockDestinations[index] = updated

  return {
    status: 200,
    message: 'Destination updated',
    data: updated,
  }
}

// Mock deleteDestination
export async function deleteMockDestination(uuid: string) {
  await delay(MOCK_DELAY)

  const index = mockDestinations.findIndex((d) => d.uuid === uuid)
  if (index === -1) {
    throw new Error('Destination not found')
  }

  mockDestinations.splice(index, 1)

  return {
    status: 200,
    message: 'Destination deleted',
    data: {},
  }
}

// Mock Booking Functions

// Mock getBookings
export async function getMockBookings(page = 1, perPage = 15, filters?: any) {
  await delay(MOCK_DELAY)

  let filtered = [...mockBookings]

  // Apply filters
  if (filters?.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(
      (b) =>
        b.user?.name.toLowerCase().includes(search) ||
        b.destination?.name.toLowerCase().includes(search) ||
        b.uuid.toLowerCase().includes(search)
    )
  }

  if (filters?.status) {
    filtered = filtered.filter((b) => b.cancellation_status === filters.status)
  }

  if (filters?.cancellation_status) {
    filtered = filtered.filter((b) => b.cancellation_status === filters.cancellation_status)
  }

  if (filters?.payment_status) {
    filtered = filtered.filter((b) => b.checkout_data?.payment_status === filters.payment_status)
  }

  const start = (page - 1) * perPage
  const items = filtered.slice(start, start + perPage)

  return {
    status: 200,
    message: 'Bookings retrieved successfully.',
    data: {
      items,
      current_page: page,
      total: filtered.length,
      per_page: perPage,
      last_page: Math.ceil(filtered.length / perPage),
    },
  }
}

// Mock getBooking
export async function getMockBooking(uuid: string) {
  await delay(MOCK_DELAY)

  const booking = mockBookings.find((b) => b.uuid === uuid)
  if (!booking) {
    throw new Error('Booking not found')
  }

  return {
    status: 200,
    message: 'Info.',
    data: {
      booking,
    },
  }
}

// Mock getPendingCancellations
export async function getMockPendingCancellations(page = 1, perPage = 15) {
  await delay(MOCK_DELAY)

  const pending = mockBookings.filter((b) => b.cancellation_status === 'pending')
  const start = (page - 1) * perPage
  const items = pending.slice(start, start + perPage)

  return {
    status: 200,
    message: 'Pending cancellation requests retrieved successfully.',
    data: {
      data: items,
      current_page: page,
      total: pending.length,
      per_page: perPage,
      last_page: Math.ceil(pending.length / perPage),
    },
  }
}

// Mock updateCancellationStatus
export async function updateMockCancellationStatus(uuid: string, status: string, adminNotes?: string) {
  await delay(MOCK_DELAY)

  const index = mockBookings.findIndex((b) => b.uuid === uuid)
  if (index === -1) {
    throw new Error('Booking not found')
  }

  const booking = mockBookings[index]
  const now = new Date().toISOString()

  booking.cancellation_status = status as any
  booking.admin_notes = adminNotes || null
  if (status === 'approved') {
    booking.cancellation_approved_at = now as any
  } else if (status === 'rejected') {
    booking.cancellation_rejected_at = now as any
  }
  booking.updated_at = now

  return {
    status: 200,
    message: `Cancellation request ${status} successfully.`,
    data: booking,
  }
}

// Mock forceCancelBooking
export async function mockForceCancelBooking(uuid: string, reason: string) {
  await delay(MOCK_DELAY)

  const index = mockBookings.findIndex((b) => b.uuid === uuid)
  if (index === -1) {
    throw new Error('Booking not found')
  }

  const booking = mockBookings[index]
  const now = new Date().toISOString()

  booking.cancellation_status = 'approved'
  booking.cancellation_reason = reason
  booking.admin_notes = 'Admin force cancelled'
  booking.cancellation_requested_at = now
  booking.cancellation_approved_at = now
  booking.updated_at = now

  return {
    status: 200,
    message: 'Booking force cancelled successfully.',
    data: booking,
  }
}
