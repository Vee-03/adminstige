# API Integration - Sesuai Notion Documentation

## 📋 Dokumentasi API (dari Notion)

BASE_URL: `http://127.0.0.1:8000/api/v1`

---

## ✅ Implementasi di Frontend

### 1. Destination API (`src/utils/destinationAPI.ts`)

| Endpoint               | Method | Frontend Function     | Mock Support |
| ---------------------- | ------ | --------------------- | ------------ |
| `/destinations`        | GET    | `getDestinations()`   | ✅           |
| `/destinations`        | POST   | `createDestination()` | ✅           |
| `/destinations/{uuid}` | GET    | `getDestination()`    | ✅           |
| `/destinations/{uuid}` | PATCH  | `updateDestination()` | ✅           |
| `/destinations/{uuid}` | DELETE | `deleteDestination()` | ✅           |

**Features:**

- Pagination support (page, per_page)
- Search support
- Mock data fallback jika API error
- Bearer token authentication

---

### 2. Booking API (`src/utils/bookingAPI.ts`) - NEW!

#### Endpoints Implemented:

| #   | Endpoint                                | Method | Fungsi                                        | Mock |
| --- | --------------------------------------- | ------ | --------------------------------------------- | ---- |
| 1   | `/admin/bookings`                       | GET    | `getBookings()` + `getBookingsWithFallback()` | ✅   |
| 2   | `/admin/bookings/{uuid}`                | GET    | `getBooking()` + `getBookingWithFallback()`   | ✅   |
| 3   | `/admin/bookings/cancellations/pending` | GET    | `getPendingCancellations()` + fallback        | ✅   |
| 4   | `/admin/bookings/{uuid}/cancellation`   | PATCH  | `updateCancellationStatus()` + fallback       | ✅   |
| 5   | `/admin/bookings/{uuid}/force-cancel`   | POST   | `forceCancelBooking()` + fallback             | ✅   |

#### Authentication

```typescript
// All endpoints require Bearer token
Authorization: Bearer {{admin_token}}
```

Token otomatis ditambahkan dari localStorage ke semua requests.

#### Response Format (sesuai Notion)

```json
{
  "status": 200,
  "message": "Success message",
  "data": {
    "items": [...],
    "current_page": 1,
    "total": 45,
    "per_page": 15,
    "last_page": 3
  }
}
```

---

## 🎯 TypeScript Interfaces

### Booking Model

```typescript
interface Booking {
  uuid: string;
  user_id: number;
  destination_uuid: string;
  date: string; // YYYY-MM-DD
  quantity: number;
  brand?: string;
  category?: string;
  merchant_name?: string;
  total_price: number;
  cancellation_status: "pending" | "approved" | "rejected" | null;
  cancellation_requested_at?: string;
  cancellation_approved_at?: string | null;
  cancellation_rejected_at?: string | null;
  cancellation_reason?: string;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  destination?: Destination;
  checkout_data?: CheckoutData;
}
```

### Pagination Response

```typescript
interface BookingListResponse {
  items: Booking[];
  current_page: number;
  total: number;
  per_page: number;
  last_page: number;
}
```

---

## 📡 Filter Queries (sesuai Notion)

### Get All Bookings - Supported Filters:

```typescript
getBookings(page, perPage, {
  search?: string                      // Search by user/destination/UUID
  status?: string                      // pending, confirmed, cancelled
  cancellation_status?: string         // pending, approved, rejected
  payment_status?: string              // paid, unpaid
  user_id?: number
  destination_uuid?: string
  date_from?: string                   // YYYY-MM-DD
  date_to?: string                     // YYYY-MM-DD
  sort_by?: string                     // created_at, date, quantity, total_price
  sort_order?: string                  // asc, desc
})
```

### Get Pending Cancellations - Supported Filters:

```typescript
getPendingCancellations(page, perPage, {
  sort_by?: string         // cancellation_requested_at, date, total_price
  sort_order?: string      // asc, desc
})
```

---

## 🔐 Authentication Flow

### 1. Login

```typescript
// POST /admin/login
const response = await adminLogin("admin@example.com", "password");
// Returns: { status: 200, data: { token: "..." } }
```

### 2. Store Token

```typescript
// Token automatically stored to localStorage
localStorage.getItem("admin_token");
```

### 3. Use Token

```typescript
// Automatically added to all subsequent API calls
// Authorization: Bearer {{admin_token}}
```

### 4. Logout

```typescript
// POST /admin/logout
await adminLogout();
// Token removed from localStorage
```

---

## 🛡️ Error Handling

### Network Error (API not available)

```
Status: 0
Message: "Tidak dapat terhubung ke server: http://localhost:8000/api/v1"
→ Fallback to mock data
```

### Validation Error

```json
{
  "status": 422,
  "message": "The given data was invalid.",
  "errors": {
    "cancellation_status": [
      "The cancellation status field must be either approved or rejected."
    ]
  }
}
```

### Authentication Error

```json
{
  "status": 401,
  "message": "Unauthenticated."
}
```

### Authorization Error (Not Admin)

```json
{
  "status": 403,
  "message": "Access denied. Not an admin account."
}
```

### Not Found

```json
{
  "status": 404,
  "message": "Booking not found."
}
```

---

## 📝 Mock Data

### Default Mock Bookings:

- 2 bookings preload dengan full relations (user, destination, checkout_data)
- Status: 1 pending, 1 approved
- Payment: 1 paid, 1 unpaid

### Mock Functions Available:

```typescript
import {
  getMockBookings,
  getMockBooking,
  getMockPendingCancellations,
  updateMockCancellationStatus,
  mockForceCancelBooking,
} from "./mockAPI";
```

---

## 🧪 Testing Examples

### Example 1: Get All Bookings

```typescript
const response = await getBookingsWithFallback(1, 15, {
  cancellation_status: "pending",
});
// Returns: { status: 200, data: { items: [...], current_page: 1, ... } }
```

### Example 2: Update Cancellation Status

```typescript
const response = await updateCancellationStatusWithFallback(
  "019a7881-020a-7068-af15-506b5e02e719",
  "approved",
  "Approved due to valid emergency reason"
);
// Returns: { status: 200, data: { ...booking } }
```

### Example 3: Force Cancel Booking

```typescript
const response = await forceCancelBookingWithFallback(
  "019a7881-020a-7068-af15-506b5e02e719",
  "Customer no-show"
);
// Returns: { status: 200, data: { ...booking } }
```

---

## 📁 File Structure

```
src/
├── utils/
│   ├── api.ts                  ✅ Base API wrapper (updated with auth endpoints)
│   ├── destinationAPI.ts       ✅ Destination CRUD + mock fallback
│   ├── bookingAPI.ts           ✨ NEW - Booking operations + mock fallback
│   ├── mockAPI.ts              ✅ Mock data + booking functions (updated)
│   └── ...
├── pages/
│   ├── AdminLogin.tsx          ✅ Login with token storage
│   ├── Destination.tsx         ✅ Destination CRUD using API
│   ├── Booking.tsx (future)    ⏳ To be created
│   └── ...
└── ...
```

---

## ✨ Features Ready

✅ **Authentication**

- Login/Logout endpoints ready
- Token storage in localStorage
- Auto-include in all requests

✅ **Destination Management**

- Full CRUD
- Pagination
- Search
- Mock fallback

✅ **Booking Management**

- Get all bookings with filters
- Get single booking
- View pending cancellations
- Approve/reject cancellations
- Force cancel bookings
- Mock fallback for all

✅ **Error Handling**

- Network error detection
- Clear error messages
- Fallback to mock data

✅ **Type Safety**

- Full TypeScript interfaces
- Based on Notion API schema
- Consistent response structure

---

## 🚀 Next Steps

### Phase 1: Current (Testing with Mock)

- ✅ API structure ready
- ✅ Mock data available
- ✅ Fallback logic implemented
- ✅ TypeScript interfaces defined

### Phase 2: Backend Integration (When API Ready)

- [ ] Verify all endpoints respond correctly
- [ ] Test with real data
- [ ] Check pagination works
- [ ] Verify error responses match

### Phase 3: UI Components (Booking Page)

- [ ] Create Booking list page
- [ ] Create Booking details view
- [ ] Create Cancellation management UI
- [ ] Add loading/error states

### Phase 4: Production

- [ ] Remove mock files
- [ ] Update API base URL for production
- [ ] Final testing & deployment

---

## 📚 Database Schema Reference (from Notion)

### Bookings Table Columns:

| Column                    | Type      | Nullable | Notes                          |
| ------------------------- | --------- | -------- | ------------------------------ |
| uuid                      | UUID      | No       | Primary key                    |
| user_id                   | integer   | No       | FK to users                    |
| destination_uuid          | UUID      | No       | FK to destinations             |
| date                      | date      | No       | Booking date                   |
| quantity                  | integer   | No       | Number of people               |
| brand                     | string    | Yes      | Package name                   |
| category                  | string    | Yes      | Category                       |
| merchant_name             | string    | Yes      | Merchant name                  |
| total_price               | decimal   | Yes      | Total price                    |
| cancellation_status       | enum      | Yes      | pending/approved/rejected/null |
| cancellation_requested_at | timestamp | Yes      | Request time                   |
| cancellation_approved_at  | timestamp | Yes      | Approval time                  |
| cancellation_rejected_at  | timestamp | Yes      | Rejection time                 |
| cancellation_reason       | text      | Yes      | User's reason                  |
| admin_notes               | text      | Yes      | Admin notes                    |
| created_at                | timestamp | No       | Created                        |
| updated_at                | timestamp | No       | Updated                        |

---

## ✅ Checklist Integrasi

- [x] API endpoints defined with correct paths
- [x] Authentication flow implemented
- [x] Booking API service created
- [x] Mock data prepared
- [x] Fallback logic added
- [x] TypeScript interfaces defined
- [x] Error handling implemented
- [x] Bearer token support added
- [x] Response format matches Notion
- [x] Filter queries supported

**Status: ✅ READY FOR BOOKING PAGE DEVELOPMENT**

---

_Last Updated: November 13, 2025_
_Source: Notion API Documentation_
