# Client-Side Routing Fix for React Router + Vite

## Problem Explanation

When you navigate directly to `/contacts`, `/rooms/1`, or any non-root route (or refresh the page on those routes), you get a **404 error**. This happens because:

1. **Server tries to find physical files**: The web server looks for a file/folder matching the URL path
2. **No physical files exist**: Since React Router handles routing on the client side, there's no `/contacts/index.html` or `/rooms/1/index.html`
3. **404 is returned**: The server can't find the physical resource

## Solution Overview

The fix is to configure servers to serve `index.html` for **all routes that aren't actual files**. This allows React Router to boot up and handle routing on the client side.

---

## 1. Development Server (Vite Dev)

**No configuration needed** by default! Vite dev server already handles SPA routing.

✅ **Why it works in dev but not in production:**
- Vite's dev server has a fallback that serves `index.html` for missing routes
- Production servers (Nginx, Express, etc.) don't have this by default

---

## 2. Production Build

Your `vite.config.ts` is already configured with `viteSingleFile()`, which bundles everything into a single `index.html`.

**For static hosting (Netlify, Vercel, etc.):**
- You only deploy the `dist/` folder
- The single `index.html` is served for all routes
- ✅ This works out of the box!

---

## 3. Platform-Specific Configurations

### 3.1 Netlify

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**OR** create `_redirects` file in `public/`:
```
/*    /index.html   200
```

---

### 3.2 Vercel

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### 3.3 GitHub Pages

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Then update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/repository-name/', // Replace with your repo name
  // ... rest of config
});
```

---

### 3.4 Nginx

Configure `/etc/nginx/sites-available/default`:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html/dist;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Cache static assets
    location ~* \.(js|css|woff2?|ttf|otf|eot|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Fallback to index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

### 3.5 Apache

Create `.htaccess` in your `dist/` folder:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f [OR]
  RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -d
  RewriteRule ^ - [L]
  RewriteRule ^ /index.html [QSA,L]
</IfModule>
```

---

### 3.6 Node.js / Express

```javascript
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback: serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## 4. Updated vite.config.ts (Recommended)

For better dev server SPA support, use this:

```typescript
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    // Dev server fallback for SPA
    middlewareMode: false,
  },
  preview: {
    // Preview mode fallback
    port: 4173,
  },
});
```

---

## 5. Quick Deployment Checklist

- ✅ Dev: Works by default (Vite handles it)
- ✅ Build: `npm run build` creates `dist/`
- ✅ Static Hosting (Netlify/Vercel): Add redirect config
- ✅ Self-Hosted (Nginx/Apache): Configure fallback rules
- ✅ Test: `npm run preview` to test production build locally

---

## 6. Testing Locally

Test your production build:

```bash
npm run build
npm run preview
```

Then visit:
- http://localhost:4173 - home ✅
- http://localhost:4173/contacts - should load app ✅
- http://localhost:4173/rooms - should load app ✅
- http://localhost:4173/booking - should load app ✅

If you see blank page or 404, the fallback isn't working.

---

## Summary

Your project is **already configured correctly** for:
- ✅ Dev server (Vite default)
- ✅ Production build (viteSingleFile bundles everything)

You only need to:
1. Add platform-specific redirects if hosting on Netlify/Vercel
2. Configure server rules if self-hosting (Nginx/Apache)
