# Design

SportsCourt memakai papan skor lapangan sebagai sistem visual.

## Warna

- Enamel `#10241c` untuk header dan papan angka.
- Kertas `#f3f0e6` untuk latar halaman yang dibaca di siang hari.
- Panel `#fffdf8` untuk kartu dan tabel.
- Tinta `#14241c`, tinta lembut `#3d5348`.
- Lampu `#e0a11a` untuk angka dan aksi sekunder.
- Terbuka `#0f6a42` untuk aksi utama dan status siap.
- Terisi `#9d342c` hanya untuk status gagal, ditolak, atau batal.

## Huruf

- Judul: Big Shoulders Display, disimpan di `frontend/src/assets/fonts`.
- Isi: Source Sans 3, di folder yang sama.

## Komponen

Tombol, badge, dan field ada di `frontend/src/components/ui`. Angka dashboard ada di papan enamel. Status memakai badge berwarna. Kalau venue belum punya foto, yang tampil adalah garis lapangan, bukan foto orang.
