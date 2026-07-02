# MediaShrink

**MediaShrink** adalah aplikasi web tingkat lanjut untuk manipulasi gambar yang berfokus pada **Kompresi Spasial (Lossy)** dan **Kriptografi Steganografi (LSB)**. Dibangun menggunakan React + Vite dan dipadukan dengan layanan Supabase sebagai *Backend-as-a-Service* (BaaS), aplikasi ini murni dibangun menggunakan logika algoritma manual di sisi *Client* (tanpa *library* kompresi eksternal).

## ✨ Fitur Utama

### 1. Spatial Image Compression (Lossy)
Menggunakan algoritma interpolasi piksel **Nearest-Neighbor** yang murni ditulis dari nol menggunakan kanvas HTML5.
- Mengecilkan resolusi gambar dengan rasio persentase yang dinamis.
- Menghemat ukuran gambar secara ekstrem (berguna untuk optimasi beban web).
- Menghitung perkiraan (estimasi) ukuran file *output* secara *real-time* sebelum proses kompresi dilakukan.

### 2. Steganography (LSB - Least Significant Bit)
Menyembunyikan pesan rahasia (teks) ke dalam gambar dengan memanipulasi *bit* paling belakang dari setiap piksel RGB.
- **Encode**: Memasukkan pesan ke dalam gambar dan memastikannya tersimpan secara *lossless* dengan mengekspor *file* hasil menjadi `PNG`.
- **Decode**: Membaca kembali gambar tersebut untuk mengekstrak pesan rahasia yang tersembunyi.
- Menyediakan indikator visibilitas untuk mengukur seberapa banyak kapasitas piksel yang telah digunakan oleh pesan Anda.

### 3. Autentikasi & Riwayat (Supabase)
- Integrasi *Login/Register* menggunakan Supabase Auth.
- Sistem penyimpan Riwayat (*History*) kompresi yang melacak detail metrik (nama *file*, tipe *action*, ukuran sebelum, ukuran sesudah).
- Dasbor analitik sederhana untuk melacak total file yang diproses dan rasio efisiensi algoritma secara keseluruhan.

## 🛠️ Teknologi yang Digunakan
- **Frontend**: React.js (Vite), TailwindCSS, React Router.
- **Backend/DB**: Supabase (PostgreSQL, GoTrue Auth).
- **Processing**: Native HTML5 Canvas API (ImageData), Vanilla JavaScript (tanpa *library* kompresi).

## 🚀 Panduan Instalasi Lokal

1. **Kloning Repositori**
   ```bash
   git clone https://github.com/Nandzack25/Mediashrink.git
   cd Mediashrink
   ```

2. **Instalasi Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable**
   Buat file `.env` di *root directory* dan masukkan kredensial Supabase Anda:
   ```env
   VITE_SUPABASE_URL=URL_SUPABASE_ANDA
   VITE_SUPABASE_ANON_KEY=ANON_KEY_SUPABASE_ANDA
   ```

4. **Jalankan Server Development**
   ```bash
   npm run dev
   ```

## 📜 Arsitektur Algoritma Manual

Sebagai bagian dari proyek komputasi tingkat akademis, MediaShrink melarang penggunaan *library* pengolahan gambar otomatis (seperti `browser-image-compression`).
Seluruh proses berjalan di berkas utilitas:
- `src/utils/compression.js`: Berisi logika ekstraksi piksel mentah (*raw array*), perhitungan matriks dimensi (*scale x ratio*), perulangan kanvas baris/kolom, dan *rendering Blob*.
- `src/utils/stegano.js`: Membaca array *uint8clamped*, mengkonversi pesan string ke biner (ASCII ke bit 8-deret), menimpa bit ke-0 (LSB) RGB dari setiap piksel, dan melakukan *decoding* kebalikan.
