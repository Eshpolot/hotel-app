# Deployment Guide for React Router + Vite SPA

## Overview

This guide covers deploying your React Router SPA across different hosting platforms.

---

## Development & Testing

### Local Development
```bash
npm run dev
```
✅ Vite dev server automatically handles SPA routing.

### Test Production Build Locally
```bash
npm run build
npm run preview
```
Visit http://localhost:4173 and test all routes:
- `/` → ✅ Home loads
- `/contacts` → ✅ App loads with Contacts route
- `/rooms` → ✅ App loads with Rooms route
- `/booking` → ✅ App loads with Booking route

---

## Deployment Options

### 1. **Netlify (Recommended for Beginners)**

#### Method A: Git Integration (Easiest)
1. Push to GitHub/GitLab
2. Connect repo in Netlify dashboard
3. Netlify automatically uses `netlify.toml`
4. Deploy happens automatically on push

**File**: `netlify.toml` (already created)

#### Method B: CLI Deployment
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

✅ **Result**: Routes work correctly

---

### 2. **Vercel (Recommended for Production)**

#### Method A: Git Integration
1. Push to GitHub
2. Connect repo in Vercel dashboard
3. Vercel automatically uses `vercel.json`
4. Auto-deploy on push

#### Method B: CLI Deployment
```bash
npm install -g vercel
npm run build
vercel --prod
```

**File**: `vercel.json` (already created)

✅ **Result**: Routes work correctly

---

### 3. **GitHub Pages (Free, for Portfolio)**

#### Setup
1. Create `_redirects` file (already in `public/`)
2. GitHub Pages doesn't support `_redirects` natively
3. **Use Netlify + GitHub instead** (free tier works)

Or use a custom domain with redirect service.

---

### 4. **Self-Hosted Nginx**

#### Server Setup
1. Install Nginx
2. Copy `nginx.conf` to `/etc/nginx/sites-available/`
3. Create symlink: `ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/`
4. Test config: `sudo nginx -t`
5. Restart: `sudo systemctl restart nginx`

```bash
# Build
npm run build

# Deploy dist folder to server
scp -r dist/* user@server:/var/www/html/dist/
```

**File**: `nginx.conf` (already created)

✅ **Result**: Routes work correctly

---

### 5. **Self-Hosted Apache**

#### Server Setup
1. Ensure `mod_rewrite` is enabled: `sudo a2enmod rewrite`
2. Copy `.htaccess` to `dist/` folder (already in `public/.htaccess`)
3. Update Apache config to allow `.htaccess` overrides

```bash
# Build
npm run build

# Deploy dist folder to server
scp -r dist/* user@server:/var/www/html/
```

**File**: `public/.htaccess` (already created)

✅ **Result**: Routes work correctly

---

### 6. **Node.js + Express (Self-Hosted)**

#### Server Setup
```bash
# Install dependencies
npm install express compression

# Build
npm run build

# Start server
node server.js
```

Or use with PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name "alay-art"
pm2 startup
pm2 save
```

**File**: `server.js` (already created)

✅ **Result**: Routes work correctly

---

### 7. **Docker (Any Hosting)**

Create `Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

Build and deploy:
```bash
docker build -t alay-art .
docker run -p 3000:3000 alay-art
```

---

### 8. **AWS S3 + CloudFront**

#### Setup
1. Create S3 bucket for static hosting
2. Enable "Static website hosting"
3. Upload `dist/` contents to S3
4. Create CloudFront distribution
5. In CloudFront settings:
   - Set default root object: `index.html`
   - Create custom error responses:
     - 403 errors → `/index.html`
     - 404 errors → `/index.html`

✅ **Result**: Routes work correctly

---

## Deployment Checklist

Before deploying:
- [ ] Run `npm run build`
- [ ] Test with `npm run preview`
- [ ] Verify all routes work
- [ ] Check console for errors
- [ ] Test on mobile
- [ ] Verify images/assets load
- [ ] Check performance (Lighthouse)

---

## Platform Recommendations

| Platform | Best For | Cost | Effort |
|----------|----------|------|--------|
| **Netlify** | Beginners, small projects | Free tier | ⭐⭐ Low |
| **Vercel** | Production apps | Free tier | ⭐⭐ Low |
| **GitHub Pages** | Portfolio | Free | ⭐⭐⭐ Medium |
| **Nginx (VPS)** | Full control | ~$5-20/mo | ⭐⭐⭐⭐ Hard |
| **AWS/DigitalOcean** | Enterprise | Variable | ⭐⭐⭐⭐ Hard |
| **Docker** | Any hosting | Depends | ⭐⭐⭐ Medium |

**Recommended for you**: **Netlify** or **Vercel** (just connect GitHub, done!)

---

## Troubleshooting

### Issue: 404 on route refresh
**Solution**: Check that `_redirects` or server config is properly set up

### Issue: Styles/assets not loading
**Solution**: Check `vite.config.ts` base path (needed for sub-paths)

### Issue: Slow initial load
**Solution**: 
- Enable Gzip compression (included in configs)
- Use CDN for assets
- Enable code splitting in build

### Issue: Routes work but 404 persists
**Solution**: 
1. Clear browser cache
2. Check server logs
3. Verify fallback is configured

---

## Production Optimization

Add to your build for best performance:

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        react: ['react', 'react-dom'],
        router: ['react-router-dom'],
      }
    }
  }
}
```

This splits code into smaller chunks for faster loading.
