# SportsCourt — Decision Log

Dokumen ini mencatat keputusan produk dan teknis yang sudah disetujui. Setiap perubahan keputusan wajib dicatat di sini.

Status: **Phase 1 — Requirement & Planning**
Tanggal: 2026-11-21

---

## A. Open Decisions dari PRD Section 17 (FINAL — disetujui user)

| ID | Topik | Keputusan | Dampak teknis |
|----|-------|-----------|---------------|
| D-01 | Booking approval | Semua booking wajib disetujui owner. Tidak ada auto-confirm. | Booking selalu dibuat `pending`. |
| D-02 | Slot duration | Slot tetap kelipatan 1 jam, mulai di jam bulat. Minimal 1 jam, maksimal 4 jam per booking. | Request booking memakai `date + start_hour + duration_hours`. Jam operasional disimpan sebagai jam bulat. |
| D-03 | Pending expiration | `expires_at = min(created_at + BOOKING_PENDING_TTL_MINUTES, start_at)`. Default TTL 120 menit, dikonfigurasi via `.env`. | Kolom `bookings.expires_at`; scheduled command `bookings:expire-pending`; query slot juga mengecek `expires_at > now()` sehingga tidak bergantung pada scheduler. |
| D-04 | Cancellation policy | Customer: booking `pending` boleh dibatalkan kapan saja sebelum `start_at`; booking `confirmed` paling lambat `BOOKING_CANCEL_CUTOFF_HOURS` (default 24) jam sebelum `start_at`. Owner boleh membatalkan booking `confirmed` sebelum `start_at` dengan alasan wajib. | Validasi transisi di `BookingService`; alasan disimpan di `booking_status_histories.reason`. |
| D-05 | Owner onboarding | Akun owner langsung aktif setelah registrasi dan bisa membuat venue. Yang diverifikasi admin adalah **venue**. Admin dapat men-suspend akun owner. | `users.status` (`active`/`suspended`). Venue milik owner suspended tidak tampil publik. |
| D-06 | Court sport category | Satu court = satu kategori olahraga. | FK `courts.sport_id`. Tidak ada tabel pivot. |
| D-07 | Reviews | Ditunda ke post-MVP. | Tabel `reviews` tidak dibuat. |
| D-08 | Repository | Monorepo di `ProjectUAS/` dengan folder `frontend/`, `backend/`, `docs/`. | Satu `.gitignore` root + `.gitignore` per app. |

---

## B. Keputusan Turunan (FINAL — disetujui user pada 2026-11-21)

Keputusan berikut melengkapi detail teknis yang belum diatur eksplisit oleh PRD dan telah disetujui untuk implementasi.

| ID | Topik | Keputusan | Alasan |
|----|-------|--------|--------|
| P-01 | Timezone | Database menyimpan `DATETIME` dalam **UTC** (`APP_TIMEZONE=UTC`). Setiap venue punya kolom `timezone` (`Asia/Jakarta`, `Asia/Makassar`, `Asia/Jayapura`), default `Asia/Jakarta`. Jam operasional dan tampilan slot memakai waktu lokal venue. | Indonesia punya 3 zona waktu (BR-013). Menyimpan UTC menghindari bug "booking masa lalu" lintas zona. |
| P-02 | Jam operasional | Jam bulat (`open_hour` 0–23, `close_hour` 1–24), `close_hour > open_hour`. Tidak mendukung operasional melewati tengah malam (misal 20:00–02:00) di MVP. | Konsisten dengan slot 1 jam (D-02) dan menyederhanakan perhitungan availability. |
| P-03 | Booking horizon | Booking hanya bisa dibuat untuk hari ini s/d `BOOKING_MAX_DAYS_AHEAD` hari ke depan (default 30). | Mencegah booking spekulatif jangka panjang dan membatasi query availability. |
| P-04 | Satu booking = satu hari | Booking tidak boleh melewati tengah malam (`start_hour + duration_hours <= close_hour <= 24`). | Konsekuensi langsung dari P-02. |
| P-05 | Edit venue setelah approved | Edit venue `approved` **tidak** memicu verifikasi ulang (admin tetap bisa suspend). Edit venue `rejected` otomatis mengubah status ke `pending_verification` (resubmit). | Menghindari friksi owner di MVP; admin tetap punya kontrol via suspend. |
| P-06 | Blokir vs booking aktif | Owner tidak bisa membuat blokir jadwal yang overlap dengan booking aktif (`pending` belum expired / `confirmed`). Owner harus reject/cancel booking terlebih dahulu. | Mencegah booking confirmed "hilang" diam-diam. |
| P-07 | Peran admin pada booking | Admin **read-only** (monitoring) untuk booking. Admin mengelola user (suspend/activate), venue (approve/reject/suspend/reactivate), dan kategori olahraga. | Sesuai tabel permission PRD ("Monitoring"). |
| P-08 | Foto | Venue: maksimal 5 foto (`venue_images`). Court: 1 foto opsional (`courts.image_path`). Format JPG/PNG/WebP, maks 2 MB. SVG ditolak. | Cukup untuk MVP; SVG berisiko XSS. |
| P-09 | Fasilitas venue | Kolom JSON `facilities` berisi array key dari allowlist di config (contoh: `parking`, `toilet`, `shower`, `canteen`, `musholla`, `wifi`, `locker`). | Tidak perlu tabel tambahan; tervalidasi server-side. |
| P-10 | Role | Kolom enum `users.role` (`customer`, `owner`, `admin`) + Laravel Policies. Tanpa package permission tambahan. Akun admin dibuat via artisan command interaktif (`php artisan app:create-admin`), bukan hardcoded di seeder. | Tiga role statis tidak membutuhkan dependency RBAC. |
| P-11 | Alasan reject/cancel | Reject booking oleh owner: alasan opsional. Cancel oleh owner: alasan wajib. Cancel oleh customer: alasan opsional. Reject venue oleh admin: alasan wajib. | Sesuai D-04 dan FR-005. |
| P-12 | Database lokal | XAMPP menggunakan **10.4.32-MariaDB** (`InnoDB`). Laravel memakai driver `mariadb` dengan `'engine' => 'InnoDB'`. Runtime PHP 8.5.0 (Herd Lite) memiliki `pdo_mysql`, `fileinfo`, `mbstring`, `openssl`, `bcmath` (ekstensi `gd` dan `intl` tidak aktif: validasi `dimensions` Laravel memakai `getimagesize()` native PHP tanpa `gd`, hindari library manipulasi gambar berbasis `gd` kecuali `gd` diaktifkan). | Terverifikasi di Phase 2; perilaku locking InnoDB setara untuk `SELECT ... FOR UPDATE`. |
| P-13 | Admin & data operasional | Admin **tidak** mengedit venue/court/harga/jadwal owner; admin hanya approve/reject/suspend/reactivate venue. (PRD menulis admin "Ya" untuk manage venue/court.) | Menghindari dua pihak mengedit data operasional yang sama; mengurangi permukaan otorisasi. |
| P-14 | Venue suspended & booking aktif | Booking mendatang pada venue yang di-suspend **tidak** otomatis dibatalkan; venue hanya disembunyikan dan tidak menerima booking baru. | Menghindari pembatalan massal tanpa notifikasi (notifikasi di luar scope MVP). |
| P-15 | Endpoint court | `POST /owner/courts` diubah menjadi `POST /owner/venues/{venue}/courts`. | Ownership venue tervalidasi dari route, bukan dari `venue_id` di body (mencegah BOLA). |
