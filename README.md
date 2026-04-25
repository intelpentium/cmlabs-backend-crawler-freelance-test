# Panduan Penggunaan CMLABS Crawler API

Project ini adalah REST API untuk melakukan crawl halaman website, menyimpan HTML hasil render, dan menyimpan metadata hasil crawl ke PostgreSQL.

## Prasyarat

Pastikan sudah tersedia:

- Node.js versi modern, disarankan Node.js 20 atau lebih baru.
- npm.
- PostgreSQL 16, bisa dari Docker Compose yang sudah disediakan.
- Playwright Chromium.

## Setup Project

Salin file environment:

```bash
cp .env.example .env
```

Install dependency:

```bash
npm install
```

Install browser Chromium untuk Playwright:

```bash
npx playwright install chromium
```

## Setup Database

Cara paling mudah adalah memakai Docker Compose:

```bash
docker compose up -d postgres
```

Default koneksi database di `.env`:

```env
DATABASE_URL="postgresql://crawler:crawler@localhost:5432/crawler?schema=public"
```

Jalankan migrasi Prisma:

```bash
npm run prisma:migrate -- --name init
```

## Menjalankan Server

Jalankan API:

```bash
npm run dev
```

Server berjalan di:

```text
http://127.0.0.1:3000
```

Jika port `3000` sudah dipakai, ubah nilai `PORT` di `.env`, misalnya:

```env
PORT=3001
```

Lalu jalankan ulang server dan akses memakai port baru.

## Testing Endpoint

Endpoint `/` memang tidak tersedia. Gunakan endpoint berikut untuk testing.

### Health Check

Bisa dibuka langsung dari browser:

```text
http://127.0.0.1:3000/health
```

Atau lewat terminal:

```bash
curl http://127.0.0.1:3000/health
```

Response sukses:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

### Membuat Crawl Baru

Endpoint ini memakai method `POST`, jadi gunakan curl atau Postman:

```bash
curl -X POST http://127.0.0.1:3000/crawl \
  -H "Content-Type: application/json" \
  -d '{"url":"https://cmlabs.co"}'
```

Contoh response sukses:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://cmlabs.co/",
    "title": "Website Title",
    "metadata": {
      "title": "Website Title",
      "description": "Meta description",
      "canonical": "https://cmlabs.co/",
      "ogTitle": "Open Graph Title",
      "ogDescription": "Open Graph Description",
      "ogImage": "https://example.com/image.png",
      "twitterTitle": "Twitter Title",
      "twitterDescription": "Twitter Description"
    },
    "filePath": "files/cmlabs.co-2026-04-25T04-00-00-000Z-uuid.html",
    "createdAt": "2026-04-25T04:00:00.000Z"
  }
}
```

Simpan nilai `id` dari response untuk mengecek detail hasil crawl.

### Melihat Detail Crawl

```bash
curl http://127.0.0.1:3000/crawl/<id>
```

Ganti `<id>` dengan ID dari response `POST /crawl`.

### Melihat List Crawl

Bisa dibuka dari browser:

```text
http://127.0.0.1:3000/crawl?page=1&limit=10
```

Atau lewat terminal:

```bash
curl "http://127.0.0.1:3000/crawl?page=1&limit=10"
```

### Test Manual Dua Target

Script ini akan melakukan crawl ke `https://cmlabs.co` dan `https://nextjs.org`:

```bash
npm run crawl:targets
```

## Struktur Output

Setiap crawl akan menghasilkan:

- Record database di tabel `CrawlResult`.
- File HTML hasil render di folder sesuai `FILE_STORAGE_DIR`, default-nya `files`.
- Metadata halaman seperti title, description, canonical, Open Graph, dan Twitter tags.

## Troubleshooting

Jika muncul error port sudah dipakai:

```text
Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
```

Cek proses yang memakai port:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Matikan proses tersebut:

```bash
kill <PID>
```

Atau ubah `PORT` di `.env` ke port lain.

Jika crawl gagal karena database, pastikan PostgreSQL berjalan dan `DATABASE_URL` di `.env` sudah benar.
