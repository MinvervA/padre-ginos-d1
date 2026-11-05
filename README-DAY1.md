# Day 1 — The Server–Client Boundary

Pertanyaan utama: **kode mana yang berjalan di server, dan mana yang berjalan di browser?**

## Menjalankan proyek

Gunakan Node.js 22, lalu:

```bash
npm ci
npm run dev
```

Database lokal dibuat otomatis dari `data/pizza.seed.sqlite`. Untuk mengembalikan data awal, hentikan server lalu jalankan `npm run db:reset`.

## Checkpoint

Tabel berikut merangkum tahap pengerjaan dan nama tag dalam materi workshop. Riwayat repository ini sudah disatukan menjadi satu commit hasil akhir; tag checkpoint tidak disimpan.

| Tag | Isi |
| --- | --- |
| `d1-start` | Baseline: pembacaan dan mutasi melalui lima route handler. |
| `d1-01` | Halaman menu membaca SQLite di server dan mengirim data ke `MenuExplorer`. |
| `d1-02`, `d1-p1-start` | Daftar pizza di-cache; promise favorit dibaca dengan `use()` di dalam Suspense. |
| `d1-03`, `d1-p1-solution` | Detail pizza memakai `generateStaticParams`, cache, dan `notFound()`. Dua route pembacaan dihapus. |
| `d1-04`, `d1-p2-start` | Server Action favorit, pending, optimistic UI, dan jumlah favorit di header server. |
| `d1-05`, `d1-p2-solution` | Streaming rating dan form Server Action dengan optimistic reducer. Tidak ada route handler tersisa. |
| `d1-p3-start` | Latihan: komponen client mengimpor modul database server. Build sengaja gagal; typecheck, lint, dan tes tetap lulus. |
| `d1-06`, `d1-p3-solution` | Pizza of the Day dipilih di server dan dapat ditutup melalui banner client. |
| `d1-end`, `d2-start` | Hasil akhir Day 1 dan titik awal Day 2. |

## Batas server–client

- `src/lib/data.ts` dilindungi `server-only`. `getPizzas` dan `getPizza` memakai `"use cache"` dengan `cacheLife("hours")`.
- Menu dan detail pizza dapat diprarender. Favorit dan rating menunggu request melalui `connection()` dan di-stream dalam Suspense.
- `MenuExplorer` menyimpan pencarian dan kategori. `SizePicker` menyimpan ukuran. `DismissibleBanner` menyimpan status tutup dan menerima konten server melalui `children`.
- `FavoriteButton` dan `RatingPanel` membaca promise server dengan `use()`. `useOptimistic` memberi respons langsung; pending mencegah pengiriman berulang. Kegagalan mengembalikan tampilan ke data tersimpan dan menampilkan pesan untuk mencoba lagi.
- `src/app/actions.ts` memvalidasi masukan, menulis ke SQLite, lalu memanggil `refresh()` agar data dan header dibaca ulang.
- Pizza of the Day memakai daftar pizza yang sudah di-cache. Pilihan dihitung pada setiap request dan berganti pada tengah malam UTC; tidak perlu cache tambahan.

## Simulasi

Centang **Simulasi gagal server** di footer untuk menggagalkan penulisan favorit dan rating. Matikan kembali untuk mencoba ulang.

Latensi bawaan: baca 300 ms, tulis 800 ms. Ubah melalui `DEMO_READ_LATENCY_MS` dan `DEMO_WRITE_LATENCY_MS` di `.env.local`.

## Verifikasi

```bash
npm run typecheck
npm run lint
npx vitest run
npm run build
npm run start
```

Jika lingkungan membatasi port internal Turbopack, jalankan `npx next build --webpack` sebagai pengganti langkah build. Seluruh checkpoint proyek ini diverifikasi dengan production build webpack; `d1-p3-start` adalah satu-satunya kegagalan yang disengaja.

Hasil akhir: 13 tes lulus, termasuk optimistic UI favorit dan rating, rollback saat gagal, percobaan ulang, serta validasi Server Action. Pemeriksaan HTTP terhadap server produksi memverifikasi menu, detail, pizza tidak ditemukan, API yang sudah dihapus, persistensi favorit dan rating, jumlah favorit di header, dan kegagalan simulasi. Database dipulihkan setelah pengujian.

| Ukuran | `d1-start` | `d1-end` |
| --- | --- | --- |
| Kartu pizza dalam shell HTML statis menu | 0 | 32 |
| Route handler | 5 | 0 |
| Pembacaan menu dan detail | `useEffect` + fetch browser | SQLite di server + cache |
| Mutasi | fetch ke API | Dua Server Action |
| Pembaruan header | fetch + event `window` | Streaming server + `refresh()` |

Angka tersebut mengukur perubahan arsitektur dan isi shell, bukan kecepatan browser. Pengujian browser E2E Playwright dan pengukuran Web Vitals belum dijalankan karena browser otomatis tidak tersedia dalam sesi ini. Gunakan production build saat mengukur; perilaku cache dan shell pada mode dev berbeda.

Dokumentasi API sesuai versi terpasang tersedia di `node_modules/next/dist/docs/`.
