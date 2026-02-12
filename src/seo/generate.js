#!/usr/bin/env node
/**
 * Static Site Generator for programmatic SEO pages.
 * 
 * Reads structured data from topics.js and generates:
 *   - Hub pages: /guides/, /learn/, /tools/
 *   - Spoke pages: /{category}/{slug}/
 *   - Sitemap (with index support for >50k URLs)
 *   - robots.txt
 *   - 404.html
 * 
 * Designed to scale to 100k+ pages:
 *   - Build-time validation catches regressions
 *   - Sitemap index splits at 50k URLs per file
 *   - Parallel-safe (each page is independent)
 *   - No framework overhead
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { TOPICS, CATEGORIES } from './data/topics.js';
import { renderTopicPage } from './templates/topicPage.js';
import { renderHubPage } from './templates/hubPage.js';
import { render404Page } from './templates/404.js';
import { SITE_URL } from './schema.js';
import { validateTopics } from './validate.js';

const DIST = join(process.cwd(), 'dist');
const SITEMAP_URL_LIMIT = 50000;

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function writePage(filePath, html) {
  ensureDir(join(filePath, '..'));
  writeFileSync(filePath, html, 'utf-8');
}

/**
 * Generate all SEO pages
 */
export function generateSEOPages() {
  const startTime = Date.now();

  // Validate data integrity before generating anything
  validateTopics();

  let pageCount = 0;

  // 1. Hub (category) pages
  for (const cat of Object.values(CATEGORIES)) {
    const html = renderHubPage(cat);
    const dir = join(DIST, cat.slug);
    ensureDir(dir);
    writePage(join(dir, 'index.html'), html);
    pageCount++;
  }

  // 2. Spoke (topic) pages
  for (const topic of TOPICS) {
    const html = renderTopicPage(topic);
    const dir = join(DIST, topic.category, topic.slug);
    ensureDir(dir);
    writePage(join(dir, 'index.html'), html);
    pageCount++;
  }

  // 3. Sitemap (with index if >50k URLs)
  generateSitemaps();

  // 4. robots.txt
  generateRobots();

  // 5. 404 page
  writePage(join(DIST, '404.html'), render404Page());

  const elapsed = Date.now() - startTime;
  console.log(`✅ SEO: Generated ${pageCount} pages in ${elapsed}ms`);
  return pageCount;
}

/**
 * Build the full URL list for sitemaps
 */
function buildUrlList() {
  const today = new Date().toISOString().split('T')[0];
  return [
    { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: today },
    ...Object.values(CATEGORIES).map(cat => ({
      loc: `/${cat.slug}/`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: today,
    })),
    ...TOPICS.map(t => ({
      loc: `/${t.category}/${t.slug}/`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: today,
    })),
  ];
}

/**
 * Generate sitemaps. Uses a sitemap index when URL count exceeds 50k.
 */
function generateSitemaps() {
  const urls = buildUrlList();

  if (urls.length <= SITEMAP_URL_LIMIT) {
    // Single sitemap
    writePage(join(DIST, 'sitemap.xml'), renderSitemap(urls));
  } else {
    // Split into chunks, write sitemap index
    const chunks = [];
    for (let i = 0; i < urls.length; i += SITEMAP_URL_LIMIT) {
      chunks.push(urls.slice(i, i + SITEMAP_URL_LIMIT));
    }

    chunks.forEach((chunk, idx) => {
      const filename = `sitemap-${idx + 1}.xml`;
      writePage(join(DIST, filename), renderSitemap(chunk));
    });

    const today = new Date().toISOString().split('T')[0];
    const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunks.map((_, idx) => `  <sitemap>
    <loc>${SITE_URL}/sitemap-${idx + 1}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

    writePage(join(DIST, 'sitemap.xml'), indexXml);
    console.log(`📄 Sitemap index: ${chunks.length} sitemaps for ${urls.length} URLs`);
  }
}

function renderSitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

/**
 * Generate robots.txt
 */
function generateRobots() {
  const content = `User-agent: *
Allow: /
Disallow: /userscript/

Sitemap: ${SITE_URL}/sitemap.xml
`;
  writePage(join(DIST, 'robots.txt'), content);
}

// Run if called directly
if (process.argv[1]?.endsWith('generate.js')) {
  generateSEOPages();
}
