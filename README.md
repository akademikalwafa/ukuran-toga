# PANDUAN INSTALASI — Konfirmasi Ukuran Baju Toga

## A. Backend (Google Apps Script)
1. Buka https://script.google.com → **Proyek Baru**.
2. Hapus isi `Code.gs`, rename menjadi `Kode`, lalu paste seluruh isi **Kode.gs**.
3. Pilih salah satu (HANYA SEKALI):
   - **Belum punya spreadsheet** → jalankan `setupAppEnvironment` (▶ Run), izinkan akses Drive & Sheets.
   - **Sudah punya spreadsheet dengan sheet `REKAP_MAHASISWA`** → isi `ID` di fungsi `hubungkanSpreadsheetLama`, lalu jalankan fungsi itu.
4. Isi sheet `REKAP_MAHASISWA` dengan data mahasiswa (kolom: NIM, Nama, Prodi, Angkatan, Kelas). Format kolom NIM = Teks.
5. Login admin awal: `admin` / `admin123`. **Segera ganti**: edit `GANTI_DENGAN_PASSWORD_BARU` di fungsi `gantiPasswordAdmin`, lalu Run.
6. **Deploy → Deployment baru → Aplikasi Web** → Execute as: **Me** · Who has access: **Anyone** → Deploy → salin URL `/exec`.
   Setiap mengubah Kode.gs, deploy ulang (Kelola deployment → Edit → Versi baru).

## B. Frontend (GitHub Pages)
1. Ekstrak ZIP. Folder hasil ekstrak (`toga-ceria`) = folder yang di-`git init`. `index.html` harus langsung terlihat di dalamnya.
2. Edit `js/config.js` → isi `GAS_URL` dengan URL `/exec` tadi.
3. Push ke GitHub (repo Public) lalu Settings → Pages → branch `main` / root.

## C. Pemakaian
- Mahasiswa: buka `https://USERNAME.github.io/NAMA-REPO/`
- Admin: `https://USERNAME.github.io/NAMA-REPO/#/admin` (juga ada tautan kecil "Login Panitia" di bawah beranda).
- Urutan: login admin → Pengaturan (isi info, ukuran, gambar) → menu Mahasiswa (centang peserta, Simpan) → bagikan link.
