# NetworkError Troubleshooting Guide

## 🔴 Masalah: NetworkError when attempting to fetch resource

Ini adalah error yang terjadi saat frontend tidak bisa connect ke backend API.

## ✅ Solusi

### 1. **Backend API belum running** (Kemungkinan Terbesar!)

Backend API harus running di port 8000. Cek status:

```bash
# Windows - Check if port 8000 is in use
netstat -ano | findstr "8000"

# If nothing shows, backend is NOT running
```

**Fix:**

- Start backend API server sesuai dokumentasi backend
- Pastikan backend running di port 8000
- Verifikasi dengan membuka: `http://localhost:8000/api/v1/destinations`

### 2. **CORS Issue** (Cross-Origin Request Blocked)

Jika backend running tapi masih error CORS, backend perlu configure CORS.

**Backend harus allow:**

- Origin: `http://localhost:5173` (atau port Vite lain)
- Methods: GET, POST, PATCH, DELETE
- Headers: Content-Type, Authorization

Contoh CORS config (Laravel):

```php
'allowed_origins' => ['http://localhost:5173', 'http://localhost:5174'],
```

### 3. **Environment Variable Tidak Set**

Pastikan `.env.local` ada di root project:

```bash
VITE_API_URL=http://localhost:8000/api/v1
```

File sudah ada, tapi cek sekali:

```bash
cat .env.local
```

### 4. **Token Tidak Ada**

Login terlebih dahulu:

- Email: `admin@example.com`
- Password: `password`

Ini akan store token ke localStorage, kemudian semua API calls akan include token.

---

## 🧪 Development Mode: Mock Data

Sampai backend siap, frontend sudah setup **mock data fallback**:

```
✅ Jika API error (network/connection) → Pakai mock data
✅ Mock data include: 3 destinasi sample
✅ Create, Update, Delete berfungsi dengan mock data
✅ Data stored di memory (refresh page akan reset)
```

### Cara Kerja:

1. **Login dulu** (gunakan credentials di atas)
2. **Ke halaman Destinations**
3. Frontend akan coba:
   - Koneksi ke API di port 8000
   - Jika error → Fallback ke mock data
   - Jika success → Pakai data real dari API

### Cek Console Browser:

Buka DevTools (F12) → Console tab:

```javascript
// Cek jika mock data digunakan
// Will log: "API not available, using mock data"
```

---

## 🚀 Saat Backend Ready

Ketika backend API sudah fully running dan tested:

1. Backend tidak perlu mock lagi, hapus conditional fallback kalau mau
2. Destination CRUD akan 100% pakai real API
3. Data akan persist di database

---

## 📋 Testing Checklist

- [ ] Backend running di `http://localhost:8000`
- [ ] CORS configured di backend
- [ ] Frontend running di `http://localhost:5173`
- [ ] `.env.local` ada dengan `VITE_API_URL`
- [ ] Login berhasil (token tersimpan di localStorage)
- [ ] Destination list load (bisa mock atau real API)
- [ ] Create/Edit/Delete working
- [ ] Browser console tidak ada error merah

---

## 🔧 Debug Commands

```bash
# Check environment
echo $env:VITE_API_URL

# Check if backend responding
curl http://localhost:8000/api/v1/destinations -H "Authorization: Bearer YOUR_TOKEN"

# Check token in localStorage (buka DevTools Console)
localStorage.getItem('admin_token')

# Clear data jika ada issue
localStorage.clear()
```

---

## 📝 Notes

- **Mock data** hanya untuk development, akan reset saat refresh
- **Real API** akan persistent di database
- Nanti bisa hapus mock files (`mockAPI.ts`) saat production
