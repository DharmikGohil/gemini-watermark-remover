#!/usr/bin/env node
/**
 * Static Site Generator — 100k+ page scale.
 * 
 * Generates:
 *   - Top-level hub pages: /guides/, /learn/, /tools/
 *   - Subcategory hub pages: /guides/remove-watermark/, /learn/compare/, etc.
 *   - Spoke pages: /{category}/{slug}/ (100k+)
 *   - Sitemap index with chunked sitemaps (50k URLs each)
 *   - robots.txt, 404.html
 * 
 * Performance:
 *   - Async writes with controlled concurrency
 *   - Content hash cache for incremental builds (skip unchanged pages)
 *   - Pre-computed shared HTML fragments
 *   - Skipped entirely in dev mode
 */

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { TOPICS, CATEGORIES, SUBCATEGORIES, getTopicsBySubcategory } from './data/topics.js';
import { renderTopicPage } from './templates/topicPage.js';
import { renderHubPage } from './templates/hubPage.js';
import { renderSubcategoryPage } from './templates/subcategoryPage.js';
import { render404Page } from './templates/404.js';
import { SITE_URL } from './schema.js';
import { validateTopics } from './validate.js';

const DIST = join(process.cwd(), 'dist');
const SITEMAP_LIMIT = 50000;
const CACHE_FILE = join(process.cwd(), '.seo-cache.json');
const WRITE_CONCURRENCY = 200;

// ─── Cache ───────────────────────────────────────────────────────────

function loadCache() {
  try {
    return JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  writeFileSync(CACHE_FILE, JSON.stringify(cache), 'utf-8');
}

function hashContent(str) {
  return createHash('md5').update(str).digest('hex');
}

// ─── Async I/O helpers ───────────────────────────────────────────────

const createdDirs = new Set();

async function ensureDirAsync(dir) {
  if (createdDirs.has(dir)) return;
  await mkdir(dir, { recursive: true });
  createdDirs.add(dir);
}

async function writePageAsync(filePath, html) {
  await ensureDirAsync(dirname(filePath));
  await writeFile(filePath, html, 'utf-8');
}

/**
 * Process items in batches with controlled concurrency.
 */
async function processInBatches(items, concurrency, fn) {
  for (let i = 0; i < items.length; i += concurrency) {
    await Promise.all(items.slice(i, i + concurrency).map(fn));
  }
}

// ─── Sync fallback for small writes ──────────────────────────────────

function ensureDir(dir) {
  if (createdDirs.has(dir)) return;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  createdDirs.add(dir);
}

function writePage(filePath, html) {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, html, 'utf-8');
}

// ─── Main generator ──────────────────────────────────────────────────

export async function generateSEOPages() {
  const t0 = Date.now();

  // Validate first
  validateTopics();

  const oldCache = loadCache();
  const newCache = {};
  let pageCount = 0;
  let skipped = 0;

  // 1. Top-level hub pages (sync — only 3)
  for (const cat of Object.values(CATEGORIES)) {
    const html = renderHubPage(cat);
    writePage(join(DIST, cat.slug, 'index.html'), html);
    pageCount++;
  }

  // 2. Subcategory hub pages (sync — ~12)
  for (const sub of Object.values(SUBCATEGORIES)) {
    const topics = getTopicsBySubcategory(sub.slug);
    if (topics.length > 0) {
      writePage(
        join(DIST, sub.parent, sub.slug, 'index.html'),
        renderSubcategoryPage(sub, topics)
      );
      pageCount++;
    }
  }

  // 3. Spoke pages (the bulk — 100k+) — async with cache
  const writeQueue = [];

  for (const topic of TOPICS) {
    const filePath = join(DIST, topic.category, topic.slug, 'index.html');
    // Build a lightweight cache key from the topic's unique data
    const cacheKey = `${topic.category}/${topic.slug}`;
    const contentHash = hashContent(
      topic.title + topic.heading + topic.description + topic.content +
      JSON.stringify(topic.faqs) + JSON.stringify(topic.relatedSlugs)
    );

    if (oldCache[cacheKey] === contentHash && existsSync(filePath)) {
      // Page content unchanged and file exists — skip render + write
      newCache[cacheKey] = contentHash;
      skipped++;
      pageCount++;
      continue;
    }

    newCache[cacheKey] = contentHash;
    writeQueue.push({ topic, filePath });
  }

  // Process writes in batches
  const totalWrites = writeQueue.length;
  let written = 0;

  await processInBatches(writeQueue, WRITE_CONCURRENCY, async ({ topic, filePath }) => {
    const html = renderTopicPage(topic);
    await writePageAsync(filePath, html);
    written++;
    if (totalWrites > 1000 && written % 10000 === 0) {
      console.log(`   📝 ${written}/${totalWrites} pages written...`);
    }
  });

  // 4. Sitemaps
  generateSitemaps();

  // 5. robots.txt
  writePage(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /userscript/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  // 6. 404
  writePage(join(DIST, '404.html'), render404Page());

  // Save cache for next build
  saveCache(newCache);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const skipMsg = skipped > 0 ? ` (${skipped} cached, ${totalWrites} written)` : '';
  console.log(`✅ SEO: Generated ${pageCount} pages in ${elapsed}s${skipMsg}`);
  return pageCount;
}

// Keep backward compat — sync wrapper
export function generateSEOPagesSync() {
  // Fallback for contexts that can't await
  const t0 = Date.now();
  validateTopics();
  let pageCount = 0;

  for (const cat of Object.values(CATEGORIES)) {
    writePage(join(DIST, cat.slug, 'index.html'), renderHubPage(cat));
    pageCount++;
  }
  for (const sub of Object.values(SUBCATEGORIES)) {
    const topics = getTopicsBySubcategory(sub.slug);
    if (topics.length > 0) {
      writePage(join(DIST, sub.parent, sub.slug, 'index.html'), renderSubcategoryPage(sub, topics));
      pageCount++;
    }
  }
  for (const topic of TOPICS) {
    writePage(join(DIST, topic.category, topic.slug, 'index.html'), renderTopicPage(topic));
    pageCount++;
  }
  generateSitemaps();
  writePage(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /userscript/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  writePage(join(DIST, '404.html'), render404Page());

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`✅ SEO: Generated ${pageCount} pages in ${elapsed}s`);
  return pageCount;
}

function generateSitemaps() {
  const today = new Date().toISOString().split('T')[0];

  const urls = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    ...Object.values(CATEGORIES).map(c => ({ loc: `/${c.slug}/`, priority: '0.8', changefreq: 'weekly' })),
    ...Object.values(SUBCATEGORIES).map(s => ({ loc: `/${s.parent}/${s.slug}/`, priority: '0.7', changefreq: 'weekly' })),
    ...TOPICS.map(t => ({ loc: `/${t.category}/${t.slug}/`, priority: '0.6', changefreq: 'monthly' })),
  ];

  if (urls.length <= SITEMAP_LIMIT) {
    writePage(join(DIST, 'sitemap.xml'), renderSitemap(urls, today));
    return;
  }

  const chunks = [];
  for (let i = 0; i < urls.length; i += SITEMAP_LIMIT) {
    chunks.push(urls.slice(i, i + SITEMAP_LIMIT));
  }

  for (let i = 0; i < chunks.length; i++) {
    writePage(join(DIST, `sitemap-${i + 1}.xml`), renderSitemap(chunks[i], today));
  }

  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunks.map((_, i) => `  <sitemap>\n    <loc>${SITE_URL}/sitemap-${i + 1}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`).join('\n')}
</sitemapindex>`;

  writePage(join(DIST, 'sitemap.xml'), indexXml);
  console.log(`📄 Sitemap index: ${chunks.length} files for ${urls.length} URLs`);
}

function renderSitemap(urls, today) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>\n    <loc>${SITE_URL}${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}
</urlset>`;
}

if (process.argv[1]?.endsWith('generate.js')) {
  generateSEOPages();
}
