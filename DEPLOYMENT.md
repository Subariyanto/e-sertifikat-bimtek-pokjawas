# Panduan Deploy e-Sertifikat Bimtek Pokjawas

## Deploy ke GitHub Pages

### 1. Setup Repository GitHub

```bash
cd e-sertifikat-bimtek-pokjawas

# Init git (jika belum)
git init

# Add remote repository
git remote add origin https://github.com/USERNAME/e-sertifikat-pokjawas.git

# Commit semua file
git add .
git commit -m "Initial commit: e-Sertifikat Bimtek Pokjawas"

# Push ke GitHub
git push -u origin main
```

### 2. Konfigurasi Base URL

Edit `vite.config.js`, sesuaikan dengan nama repository Anda:

```js
export default defineConfig({
  plugins: [react()],
  base: '/e-sertifikat-pokjawas/',  // Ganti dengan nama repo Anda
  // ...
})
```

Jika deploy di custom domain, gunakan `base: '/'`

### 3. Install gh-pages

```bash
npm install -D gh-pages
```

### 4. Deploy

```bash
npm run deploy
```

Perintah ini akan:
1. Build aplikasi (`npm run build`)
2. Upload folder `dist/` ke branch `gh-pages`

### 5. Aktifkan GitHub Pages

1. Buka repo di GitHub
2. Settings → Pages
3. Source: **Deploy from a branch**
4. Branch: **gh-pages** → folder: **/ (root)**
5. Klik **Save**

Tunggu ~1-2 menit, aplikasi akan live di:
`https://USERNAME.github.io/e-sertifikat-pokjawas/`

### 6. Update Setiap Kali Ada Perubahan

```bash
git add .
git commit -m "Update: deskripsi perubahan"
git push origin main
npm run deploy
```

## Deploy ke Custom Domain

### 1. Beli Domain

Contoh: `e-sertifikat-pokjawas.com`

### 2. Setup DNS

Tambahkan DNS record di registrar domain:

**A Records (root domain):**
```
Type: A
Name: @
Value: 185.199.108.153
```
```
Type: A
Name: @
Value: 185.199.109.153
```
```
Type: A
Name: @
Value: 185.199.110.153
```
```
Type: A
Name: @
Value: 185.199.111.153
```

**CNAME Record (www):**
```
Type: CNAME
Name: www
Value: USERNAME.github.io
```

### 3. Edit vite.config.js

```js
base: '/',  // Root untuk custom domain
```

### 4. Tambahkan CNAME File

Buat file `public/CNAME`:

```
e-sertifikat-pokjawas.com
```

### 5. Deploy Ulang

```bash
npm run build
npm run deploy
```

### 6. Konfigurasi GitHub Pages

1. Settings → Pages
2. Custom domain: `e-sertifikat-pokjawas.com`
3. Centang "Enforce HTTPS"
4. Save

Tunggu DNS propagasi (~1-24 jam)

## Deploy ke Netlify (Alternatif)

### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

### 2. Build

```bash
npm run build
```

### 3. Deploy

```bash
netlify deploy --prod
```

Pilih folder: `dist`

### 4. Continuous Deployment

1. Login Netlify
2. New site from Git
3. Connect GitHub repo
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy

## Deploy ke Vercel (Alternatif)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy

```bash
vercel --prod
```

Follow prompt, pilih folder `dist`

## Environment Variables Production

Untuk production, set environment variables di hosting:

### GitHub Pages
Tidak bisa set secret env. Solusi:
1. Gunakan Supabase RLS (sudah aktif)
2. Anon key aman untuk public (RLS protect data)

### Netlify
1. Site settings → Environment variables
2. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Vercel
1. Project settings → Environment Variables
2. Add variabel yang sama

## Update Verifikasi URL di Generate

Setelah deploy, QR Code akan otomatis menggunakan URL production:

```js
const verifyUrl = `${window.location.origin}/verifikasi/${kodeUnik}`
```

URL akan otomatis:
- Local: `http://localhost:5173/verifikasi/ABC123`
- GitHub Pages: `https://username.github.io/e-sertifikat-pokjawas/verifikasi/ABC123`
- Custom domain: `https://e-sertifikat-pokjawas.com/verifikasi/ABC123`

## Troubleshooting Deploy

### 404 on Page Refresh (GitHub Pages)

Tambahkan `404.html` di `public/`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <script>
      var pathSegmentsToKeep = 1;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body></body>
</html>
```

### Build Fails

```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Deploy Stuck

```bash
# Clean gh-pages cache
rm -rf node_modules/.cache
npm run deploy
```

## Production Checklist

- [ ] `.env` tidak di-commit
- [ ] Supabase RLS aktif
- [ ] Base URL correct di `vite.config.js`
- [ ] Test login production
- [ ] Test generate sertifikat production
- [ ] Test QR Code scan → redirect correct
- [ ] Test verifikasi publik
- [ ] Responsive di mobile
- [ ] HTTPS aktif (custom domain)
- [ ] Google Analytics (opsional)
- [ ] Backup database Supabase

## Monitoring Production

### 1. Supabase Dashboard

Monitor:
- Total users
- Database size
- Storage usage
- RLS policies

### 2. GitHub Pages Analytics

Gunakan Google Analytics atau Plausible:

```html
<!-- Tambahkan di index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 3. Error Tracking

Gunakan Sentry (opsional):

```bash
npm install @sentry/react
```

## Backup Strategy

### 1. Database Backup (Supabase)

Di Supabase Dashboard:
- Database → Backups
- Enable daily backups
- Manual backup sebelum update besar

### 2. Code Backup

```bash
# Push ke GitHub secara rutin
git push origin main
```

### 3. Export Data

Gunakan fitur Export CSV di aplikasi untuk backup data peserta/kegiatan

## Update Production

```bash
# 1. Commit changes
git add .
git commit -m "Update: fitur baru"

# 2. Push ke GitHub
git push origin main

# 3. Deploy
npm run deploy

# 4. Verify di browser (hard refresh Ctrl+Shift+R)
```

---

Selamat! Aplikasi e-Sertifikat Bimtek Pokjawas siap production 🚀
