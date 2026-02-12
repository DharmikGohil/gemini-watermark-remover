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
 * Performance: streams writes, pre-computes CSS once, uses Maps for lookups.
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { TOPICS, CATEGORIES, SUBCATEGORIES, getTopicsBySubcategory } from './data/topics.js';
import { renderTopicPage } from './templates/topicPage.js';
import { renderHubPage } from './templates/hubPage.js';
import { renderSubcategoryPage } from './templates/subcategoryPage.js';
import { render404Page } from './templates/404.js';
import { SITE_URL } from './schema.js';
import { validateTopics } from './validate.js';

const DIST = join(process.cwd(), 'dist');
const SITEMAP_LIMIT = 50000;

// Cache created dirs to avoid redundant existsSync calls at scale
const createdDirs = new Set();
function ensureDir(dir) {
  if (createdDirs.has(dir)) return;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  createdDirs.add(dir);
}

function writePage(filePath, html) {
  ensureDir(dirname(filePath));
  writeFileSync(filePath, html, 'utf-8');
}

export function generateSEOPages() {
  const t0 = Date.now();

  // Validate first
  validateTopics();

  let pageCount = 0;

  // 1. Top-level hub pages
  for (const cat of Object.values(CATEGORIES)) {
    writePage(join(DIST, cat.slug, 'index.html'), renderHubPage(cat));
    pageCount++;
  }

  // 2. Subcategory hub pages
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

  // 3. Spoke pages (the bulk — 100k+)
  const batchSize = 5000;
  for (let i = 0; i < TOPICS.length; i += batchSize) {
    const batch = TOPICS.slice(i, i + batchSize);
    for (const topic of batch) {
      writePage(
        join(DIST, topic.category, topic.slug, 'index.html'),
        renderTopicPage(topic)
      );
      pageCount++;
    }
    // Progress logging for large builds
    if (TOPICS.length > 1000 && (i + batchSize) % 10000 === 0) {
      console.log(`   📝 ${Math.min(i + batchSize, TOPICS.length)}/${TOPICS.length} pages...`);
    }
  }

  // 4. Sitemaps
  generateSitemaps();

  // 5. robots.txt
  writePage(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /userscript/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  // 6. 404
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

  // Chunk into multiple sitemaps + index
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
