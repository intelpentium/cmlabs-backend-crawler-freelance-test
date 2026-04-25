# Website Crawler

API dan CLI untuk crawl website modern lalu menyimpan HTML final yang sudah dirender browser headless.

## Fitur

- Mendukung website tipe SPA, SSR, dan PWA dengan `puppeteer`
- Menyimpan HTML hasil render ke folder `output/`
- Menyediakan API `POST /crawl`
- Menyediakan script batch untuk crawl target dari tugas

## Menjalankan API

```bash
npm install
npm start
```

Contoh request:

```bash
curl -X POST http://localhost:3000/crawl \
  -H "Content-Type: application/json" \
  -d '{"url":"https://cmlabs.co"}'
```

## Menjalankan batch crawl

```bash
npm run crawl:targets
```

Output HTML akan disimpan di folder `output/`.
