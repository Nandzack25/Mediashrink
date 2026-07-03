# MediaShrink

**MediaShrink** adalah aplikasi web multimedia tingkat lanjut yang berfokus pada **Kompresi Spasial-Temporal** (Gambar, Audio, Video) dan **Kriptografi Steganografi (LSB)**. Dibangun menggunakan React + Vite dengan layanan Supabase sebagai *Backend-as-a-Service* (BaaS). 

Poin teknis paling krusial dari proyek akademis ini adalah: **Semua logika algoritma kompresi ditulis murni secara mandiri (From Scratch) menggunakan perulangan matematika dan manipulasi biner (Vanilla JavaScript)**, TANPA menggunakan satupun *library* kompresi eksternal (seperti `browser-image-compression` atau `FFmpeg`).

## ✨ Fitur Utama & Algoritma Internal

### 1. Spatial Image Compression (Lossy) - Output `.jpg`
Menggunakan algoritma interpolasi raster piksel murni yang ditulis dari nol menggunakan kanvas HTML5.
- Membaca matriks RGB pada `ImageData`.
- Mengecilkan dimensi koordinat secara spasial (Nearest-Neighbor).
- Sangat ringan dan cepat.

### 2. Manual Audio Compression - Output `.wav`
Alih-alih menggunakan konverter, kami memanipulasi *Digital Signal Processing* secara manual:
- **Downmixing & PCM Decimation**: Menurunkan *Sample Rate* (misalnya 44.1kHz ke 8kHz) dengan membuang sekian titik sampel per detik secara perulangan manual.
- **Bit-Depth Reduction**: Menurunkan kalkulasi gelombang desimal presisi-tinggi 32-bit (Float) menjadi angka bulat 16-bit.
- **WAV Header Injection**: Kami menulis dan merakit biner *Header* `RIFF`, `WAVE`, dan ukuran *chunk* secara manual (Byte-per-Byte) menggunakan `DataView` JavaScript agar file biner mentah bisa diputar di *media player*.

### 3. Spatio-Temporal Video Compression - Output `.webm`
Format keluaran `WEBM` (VP8) dipilih untuk menghindari pelanggaran paten H.264 (MP4) serta mematuhi hukum enkoding murni *browser*.
- **Spatial Subsampling**: Mengekstrak *frame* video secara diam-diam dan melukisnya kembali dengan rasio kanvas yang lebih kecil.
- **Temporal Subsampling (Frame Dropping)**: Secara agresif mencegat pemutaran (*requestAnimationFrame*) dan hanya melukis ulang *frame* pada interval jeda tertentu, secara paksa menurunkan FPS (misal: 60fps menjadi 15fps) sebelum dimasukkan ke dalam `MediaRecorder`.

### 4. Steganography (LSB - Least Significant Bit) - Output `.png`
Menyembunyikan teks/pesan rahasia ke dalam gambar (Kriptografi).
- **Encode**: Mengkonversi *string* ke biner ASCII 8-bit, lalu menimpa bit paling akhir (LSB) dari susunan piksel RGBA untuk menyimpan pesan rahasia tanpa merusak visual gambar secara kasatmata. Wajib diekspor ke `.png` (Lossless).
- **Decode**: Membaca kembali LSB dari piksel untuk memanen pesan tersembunyi.

### 5. Autentikasi & Riwayat (Supabase)
- Integrasi *Login/Register* aman via Supabase Auth.
- Sistem *Dashboard* & Riwayat (*History*) yang melacak rasio efisiensi setiap file kompresi yang berhasil dilakukan.

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

## 📜 Pertahanan Akademis (Academic Defense)
Proyek ini dibangun untuk menantang batas komputasi sisi *Client* (*Browser*). Membedah *file audio* byte-per-byte dan merender *frame video* di atas kanvas secara perulangan memakan daya RAM dan komputasi yang tinggi. Hal ini membuktikan bahwa pengolahan sinyal digital (DSP) dan manipulasi piksel dapat dieksekusi secara manual tanpa bantuan *library* C++ pihak ketiga, memenuhi syarat kompetensi ketat dalam rekayasa perangkat lunak mandiri.
