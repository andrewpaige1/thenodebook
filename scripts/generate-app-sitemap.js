// This script scans the /app directory for all page.tsx files and generates a sitemap.xml in /public.
// Usage: node scripts/generate-app-sitemap.js

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://mindthred.com'; // Change to your actual domain
const APP_DIR = path.join(__dirname, '../app');
const PUBLIC_DIR = path.join(__dirname, '../public');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');

function getAllPageFiles(dir, baseRoute = '') {
  let routes = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const newBase = file.startsWith('[') ? `${baseRoute}/${file}` : `${baseRoute}/${file}`;
      routes = routes.concat(getAllPageFiles(fullPath, newBase));
    } else if (file === 'page.tsx') {
      // Remove /layout, /loading, etc. Only add /page.tsx
      routes.push(baseRoute || '/');
    }
  }
  return routes;
}

function normalizeRoute(route) {
  // Replace [param] with :param for clarity, or remove brackets
  return route.replace(/\[(.*?)\]/g, ':$1').replace(/\/\/+/g, '/');
}

function generateSitemap(urls) {
  const urlSet = urls.map(route => `  <url>\n    <loc>${DOMAIN}${normalizeRoute(route)}</loc>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlSet}\n</urlset>`;
}

const routes = getAllPageFiles(APP_DIR);
const sitemap = generateSitemap(routes);
fs.writeFileSync(SITEMAP_PATH, sitemap);
console.log(`Sitemap generated with ${routes.length} routes at ${SITEMAP_PATH}`);