# SportsCourt — API Specification (Draft v1)

Status: **Draft untuk review**
Base URL: `http://localhost:8000/api/v1`
Format: JSON (`Accept: application/json`). Response mengikuti konvensi di [ARCHITECTURE.md §2.3](./ARCHITECTURE.md).

Legenda auth:
- **Public** — tanpa login.
- **Auth** — wajib session Sanctum (status user `active`).
- **Role** — dicek oleh middleware `role:*` **dan** Policy (ownership).

---

## 0. Konvensi Umum

### HTTP Status
| Code | Pemakaian |
|------|-----------|
| 200 | OK |
| 201 | Resource dibuat |
| 204 | Sukses tanpa body (logout, delete) |
| 401 | Belum login / session habis |
| 403 | Login tapi tidak berhak (role/ownership/akun suspended) |
| 404 | Resource tidak ada **atau** tidak boleh diketahui keberadaannya (resource privat milik user lain) |
| 409 | Konflik domain (slot bentrok, transisi status tidak valid) |
| 419 | CSRF token mismatch |
| 422 | Validasi gagal |
| 429 | Rate limit |

### Pagination & filter
- Query: `page` (≥1), `per_page` (1–50, default 12).
- Parameter filter divalidasi dengan Form Request; nilai tidak dikenal → 422.
- `sort` hanya menerima allowlist per endpoint.

### Error domain (`code`)
`BOOKING_SLOT_UNAVAILABLE`, `BOOKING_OUTSIDE_OPERATING_HOURS`, `BOOKING_IN_PAST`, `BOOKING_BEYOND_HORIZON`, `BOOKING_INVALID_TRANSITION`, `BOOKING_CANCEL_CUTOFF_PASSED`, `COURT_NOT_BOOKABLE`, `BLOCK_CONFLICTS_WITH_BOOKING`, `VENUE_INVALID_TRANSITION`, `VENUE_IMAGE_LIMIT`, `ACCOUNT_SUSPENDED`.

### Rate limiting
| Limiter | Batas |
|---------|-------|
| `login` | 5/menit per (email + IP) |
| `register` | 5/menit per IP |
| `booking-create` | 10/menit per user |
| `uploads` | 20/menit per user |
| `api` (default) | 60/menit per user/IP |

---

## 1. Auth & Profile

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/sanctum/csrf-cookie` *(tanpa prefix v1)* | Public | Inisialisasi cookie XSRF |
| POST | `/auth/register` | Public, throttle:register | Daftar customer/owner |
| POST | `/auth/login` | Public, throttle:login | |
| POST | `/auth/logout` | Auth | 204 |
| GET | `/auth/me` | Auth | User saat ini |
| PUT | `/auth/profile` | Auth | Update `name`, `phone` saja |
| PUT | `/auth/password` | Auth | Wajib `current_password` |

**POST `/auth/register`**
```json
{ "name": "Budi", "email": "budi@mail.com", "password": "********", "password_confirmation": "********", "account_type": "customer" }
```
- `account_type`: `in:customer,owner` (nilai `admin` → 422). Dipetakan ke `role` di server.
- `password`: `Password::min(8)->letters()->numbers()`, confirmed.
- Response 201: `{ data: UserResource }` dan user langsung login (session regenerate).

**POST `/auth/login`** → 200 `{ data: UserResource }`. Kredensial salah → 422 pesan generik "Email atau password salah". Akun suspended → 403 `ACCOUNT_SUSPENDED`.

**UserResource**
```json
{ "id": 1, "name": "Budi", "email": "budi@mail.com", "phone": null, "role": "customer", "status": "active", "created_at": "2026-11-21T09:00:00Z" }
```
Tidak pernah memuat `password`, `remember_token`.

---

## 2. Public — Sports, Venues, Courts, Availability

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| GET | `/sports` | Public | Kategori aktif |
| GET | `/venues` | Public | Hanya venue yang visible publik |
| GET | `/venues/{venue}` | Public | 404 jika tidak visible |
| GET | `/venues/{venue}/courts` | Public | Court aktif dari venue visible |
| GET | `/courts/{court}/availability` | Public | Slot per tanggal |

**GET `/venues`** — query:
| Param | Validasi |
|-------|----------|
| `q` | string, max 100 (cari di `name`) |
| `city` | string, max 100 |
| `sport` | slug sport yang ada |
| `min_price`, `max_price` | numeric ≥0, `max_price ≥ min_price` (berdasarkan court aktif) |
| `sort` | `in:newest,price_asc,price_desc,name` |
| `page`, `per_page` | lihat konvensi |

Item response (`VenueCardResource`):
```json
{ "id": 10, "slug": "gor-sehat-jaya", "name": "GOR Sehat Jaya", "city": "Bandung", "province": "Jawa Barat",
  "cover_image_url": "http://localhost:8000/storage/venues/abc.webp",
  "sports": [{ "id": 1, "name": "Badminton", "slug": "badminton" }],
  "starting_price": "50000.00" }
```

**GET `/venues/{venue}`** (`VenueDetailResource`): data kartu + `description`, `address`, `phone`, `timezone`, `facilities`, `images[]`, `operating_hours[]` (7 hari), `courts[]` (id, name, sport, price_per_hour, image_url).

**GET `/courts/{court}/availability?date=2026-11-25`**
- `date`: `date_format:Y-m-d`, antara hari ini (waktu lokal venue) s/d +`max_days_ahead`.
- Response:
```json
{ "data": {
    "court_id": 5, "date": "2026-11-25", "timezone": "Asia/Jakarta", "is_closed": false,
    "price_per_hour": "75000.00",
    "slots": [
      { "start_hour": 8, "label": "08:00–09:00", "start_at": "2026-11-25T01:00:00Z", "status": "available" },
      { "start_hour": 9, "label": "09:00–10:00", "start_at": "2026-11-25T02:00:00Z", "status": "booked" },
      { "start_hour": 10, "label": "10:00–11:00", "start_at": "2026-11-25T03:00:00Z", "status": "blocked" },
      { "start_hour": 7, "label": "07:00–08:00", "start_at": "...", "status": "past" }
    ] } }
```
- `status`: `available | booked | blocked | past`. **Tidak** membocorkan identitas pemesan atau alasan blokir.

---

## 3. Customer — Bookings & Dashboard

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| POST | `/bookings` | Auth, role:customer, throttle:booking-create | Buat booking |
| GET | `/bookings/my` | Auth, role:customer | Paginasi; filter `status`, `period=upcoming|past` |
| GET | `/bookings/{booking}` | Auth, Policy view | Customer pemilik / owner venue / admin; selain itu 404 |
| PATCH | `/bookings/{booking}/cancel` | Auth, role:customer, Policy | Body `{ "reason": "opsional, max 500" }` |
| GET | `/customer/dashboard` | Auth, role:customer | Ringkasan |

**POST `/bookings`**
```json
{ "court_id": 5, "date": "2026-11-25", "start_hour": 19, "duration_hours": 2, "notes": "Bawa raket sendiri" }
```
| Field | Validasi format (Form Request) |
|-------|-------------------------------|
| `court_id` | required, integer, exists (court tidak soft-deleted) |
| `date` | required, `Y-m-d` |
| `start_hour` | required, integer 0–23 |
| `duration_hours` | required, integer 1–4 |
| `notes` | nullable, string, max 500 |

Validasi bisnis (BookingService, di dalam transaksi + lock): BR-002/003 court & venue bookable, BR-004 operating hours, BR-006 tidak di masa lalu, horizon (P-03), tidak overlap blok, BR-007 tidak overlap booking yang menahan slot. Field lain di body (`price`, `status`, `user_id`) **diabaikan**.

Response 201 (`BookingResource`):
```json
{ "data": {
    "id": 101, "code": "SC-7F3K9Q2M", "status": "pending",
    "start_at": "2026-11-25T12:00:00Z", "end_at": "2026-11-25T14:00:00Z",
    "local": { "date": "2026-11-25", "start": "19:00", "end": "21:00", "timezone": "Asia/Jakarta" },
    "duration_hours": 2, "price_per_hour": "75000.00", "total_price": "150000.00",
    "expires_at": "2026-11-21T11:05:00Z", "notes": "Bawa raket sendiri",
    "court": { "id": 5, "name": "Court A", "sport": "Badminton" },
    "venue": { "id": 10, "name": "GOR Sehat Jaya", "slug": "gor-sehat-jaya" },
    "can_cancel": true,
    "created_at": "2026-11-21T09:05:00Z" } }
```
Error: 409 `BOOKING_SLOT_UNAVAILABLE`, 422 untuk aturan bisnis lain (dengan `code`).

**GET `/customer/dashboard`** → `{ upcoming_count, pending_count, upcoming: BookingResource[] (maks 5), recent: BookingResource[] (maks 5) }`.

---

## 4. Owner

Semua endpoint: **Auth + role:owner**. Resource selalu di-scope ke venue milik user login; resource milik owner lain → **404**.

### 4.1 Venues & Images
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/owner/venues` | Venue milik sendiri (semua status) |
| POST | `/owner/venues` | Buat venue → `pending_verification`, auto-buat 7 baris operating hours default |
| GET | `/owner/venues/{venue}` | Detail + `status`, `status_reason` |
| PUT | `/owner/venues/{venue}` | Update. Jika `rejected` → kembali `pending_verification` (P-05). Tidak bisa saat `suspended` |
| PATCH | `/owner/venues/{venue}/toggle-active` | Aktif/nonaktif |
| DELETE | `/owner/venues/{venue}` | Soft delete; ditolak (409) jika ada booking aktif mendatang |
| POST | `/owner/venues/{venue}/images` | `multipart/form-data`, field `image`; maks 5 per venue |
| DELETE | `/owner/venues/{venue}/images/{image}` | |

**POST/PUT venue body:** `name` (max 150), `description` (max 5000), `address`, `city`, `province`, `phone` (regex nomor Indonesia), `timezone` (allowlist), `facilities[]` (allowlist). Field `owner_id`, `status`, `verified_*` diabaikan.

**Upload image:** `required|file|image|mimes:jpg,jpeg,png,webp|max:2048|dimensions:max_width=4000,max_height=4000`. Disimpan via `store('venues', 'public')` (nama random).

### 4.2 Operating Hours
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/owner/venues/{venue}/operating-hours` | 7 baris |
| PUT | `/owner/venues/{venue}/operating-hours` | Replace 7 hari sekaligus |

```json
{ "days": [ { "day_of_week": 1, "is_closed": false, "open_hour": 8, "close_hour": 22 }, { "day_of_week": 7, "is_closed": true } ] }
```
Validasi: tepat 7 item, `day_of_week` unik 1–7, `close_hour > open_hour`. Perubahan tidak membatalkan booking yang sudah ada (dicatat sebagai keterbatasan MVP).

### 4.3 Courts
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/owner/venues/{venue}/courts` | |
| POST | `/owner/venues/{venue}/courts` | `venue` dari URL + policy; **bukan** dari body |
| PUT | `/owner/courts/{court}` | |
| PATCH | `/owner/courts/{court}/toggle-active` | |
| POST | `/owner/courts/{court}/image` | 1 gambar, aturan sama dengan venue |
| DELETE | `/owner/courts/{court}` | Soft delete; 409 jika ada booking aktif mendatang |

> Perubahan dari PRD: `POST /owner/courts` → `POST /owner/venues/{venue}/courts` agar venue ownership tervalidasi dari route (nested resource), bukan dari `venue_id` di body.

Body: `name` (max 100), `sport_id` (exists & active), `description` (nullable, max 2000), `price_per_hour` (numeric, >0, max 99999999.99, 2 desimal).

### 4.4 Court Blocks
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/owner/courts/{court}/blocks?from=&to=` | |
| POST | `/owner/courts/{court}/blocks` | `{ date, start_hour, end_hour, reason }` (waktu lokal venue) |
| DELETE | `/owner/blocks/{block}` | |

POST: lock court, 409 `BLOCK_CONFLICTS_WITH_BOOKING` jika overlap booking aktif (P-06).

### 4.5 Bookings
| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/owner/bookings` | Filter: `venue_id` (milik sendiri), `court_id`, `status`, `date_from`, `date_to` |
| PATCH | `/owner/bookings/{booking}/confirm` | Hanya `pending` & belum expired |
| PATCH | `/owner/bookings/{booking}/reject` | `{ reason?: string }` |
| PATCH | `/owner/bookings/{booking}/cancel` | Hanya `confirmed`, sebelum `start_at`, `{ reason: required }` |
| GET | `/owner/dashboard` | `venues_count`, `courts_count`, `pending_bookings`, `confirmed_upcoming`, `recent_bookings[]` |

Response booking untuk owner menyertakan `customer: { name, phone }` (minimum data yang dibutuhkan owner), tanpa email jika tidak diperlukan.

---

## 5. Admin

Semua endpoint: **Auth + role:admin**.

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| GET | `/admin/dashboard` | `users_count`, `owners_count`, `venues_by_status`, `courts_count`, `bookings_by_status`, `pending_venues[]` |
| GET | `/admin/users` | Filter `role`, `status`, `q` |
| PATCH | `/admin/users/{user}/suspend` | Tidak bisa suspend diri sendiri / admin lain |
| PATCH | `/admin/users/{user}/activate` | |
| GET | `/admin/venues` | Filter `status`, `q`, `city` |
| GET | `/admin/venues/{venue}` | |
| PATCH | `/admin/venues/{venue}/approve` | `pending_verification → approved` |
| PATCH | `/admin/venues/{venue}/reject` | `{ reason: required }` |
| PATCH | `/admin/venues/{venue}/suspend` | `{ reason: required }`, `approved → suspended` |
| PATCH | `/admin/venues/{venue}/reactivate` | `suspended → approved` |
| GET | `/admin/sports` | |
| POST | `/admin/sports` | `{ name }`, slug server-side |
| PUT | `/admin/sports/{sport}` | |
| PATCH | `/admin/sports/{sport}/toggle-active` | Tidak ada hard delete |
| GET | `/admin/bookings` | Read-only monitoring, filter `status`, `venue_id`, `date_from`, `date_to` |
| GET | `/admin/bookings/{booking}` | Termasuk status history |

---

## 6. Matriks Otorisasi Ringkas

| Resource / Aksi | Customer | Owner | Admin |
|-----------------|----------|-------|-------|
| Lihat venue publik | ✓ | ✓ | ✓ |
| CRUD venue/court/blocks/hours | ✗ | ✓ milik sendiri | ✗ (verifikasi/suspend saja) |
| Buat booking | ✓ | ✗ | ✗ |
| Lihat booking | milik sendiri | venue sendiri | semua (read-only) |
| Cancel booking | milik sendiri (aturan D-04) | confirmed di venue sendiri (alasan wajib) | ✗ |
| Confirm/reject booking | ✗ | venue sendiri | ✗ |
| Verifikasi venue, kelola user & sports | ✗ | ✗ | ✓ |

> Catatan: PRD menulis Admin "Ya" untuk manage venue/court/pricing. Draft ini membatasi admin pada verifikasi/suspend agar tidak ada dua pihak yang mengedit data operasional owner. **Mohon konfirmasi.**
