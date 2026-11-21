# Design

SportsCourt memakai papan skor lapangan sebagai sistem visual.

## Warna

- Enamel `#10241c` untuk header dan papan angka.
- Kertas `#e7eeeb`, hijau muda dingin dari enamel, untuk latar halaman. Bukan krem.
- Panel `#dbe3df` untuk kartu dan tabel.
- Tinta `#14241c`, tinta lembut `#1c3128`.
- Lampu `#e0a11a` untuk angka dan aksi sekunder.
- Terbuka `#0f6a42` untuk aksi utama dan status siap.
- Terisi `#9d342c` hanya untuk status gagal, ditolak, atau batal.

## Huruf

- Judul: Big Shoulders Display, disimpan di `frontend/src/assets/fonts`.
- Isi: Source Sans 3, di folder yang sama.

## Komponen

Tombol, badge, dan field ada di `frontend/src/components/ui`. Komponen itu tetap dasar Tailwind yang sudah ada. Angka dashboard, jam slot, dan ringkasan booking memakai papan enamel dengan digit tabular. Status memakai badge berwarna. Kalau venue belum punya foto, yang tampil adalah garis lapangan, bukan foto orang.

Garis lapangan juga jadi struktur halaman: garis tepi di latar, gambar lapangan di beranda, dan pemisah bagian. Beranda tidak menaruh judul dan kotak cari di tengah. Daftar venue menonjolkan satu venue, lalu baris yang lebih rapat.
