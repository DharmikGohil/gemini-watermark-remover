#!/usr/bin/env node
/**
 * Static Site Generator for programmatic SEO pages.
 * 
 * Reads structured data from topics.js and generates:
 *   - Hub pages: /guides/, /learn/, /tools/
 *   - Spoke pages: /{category}/{slug}/
 *   - Sitemap: /sitemap.xml
 *   - Robots.txt: /robots.txt
 * 
 * Designed to scale to 100k+ pages:
 *   - Parallel file writes
 *   - No framework overhead
 *   - Incremental-friendly (each page is independent)
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { TOPICS, CATEGORIES } from './data/topics.js';
import { renderTopicPage } from './templates/topicPage.js';
import { renderHubPage } from './templates/hubPage.js';
import { SITE_URL } from './schema.js';

const DIST = join(process.cwd(), 'dist');

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
  let pageCount = 0;

  // 1. Generate hub (category) pages
  for (const cat of Object.values(CATEGORIES)) {
    const html = renderHubPage(cat);
    const dir = join(DIST, cat.slug);
    ensureDir(dir);
    writePage(join(dir, 'index.html'), html);
    pageCount++;
  }

  // 2. Generate spoke (topic) pages
  for (const topic of TOPICS) {
    const html = renderTopicPage(topic);
    const dir = join(DIST, topic.category, topic.slug);
    ensureDir(dir);
    writePage(join(dir, 'index.html'), html);
    pageCount++;
  }

  // 3. Generate sitemap.xml
  generateSitemap();

  // 4. Generate robots.txt
  generateRobots();

  const elapsed = Date.now() - startTime;
  console.log(`✅ SEO: Generated ${pageCount} pages in ${elapsed}ms`);
  return pageCount;
}

/**
 * Generate sitemap.xml with all pages
 */
function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];

  const urls = [
    // Homepage (highest priority)
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    // Hub pages
    ...Object.values(CATEGORIES).map(cat => ({
      loc: `/${cat.slug}/`,
      priority: '0.8',
      changefreq: 'weekly',
    })),
    // Topic pages
    ...TOPICS.map(t => ({
      loc: `/${t.category}/${t.slug}/`,
      priority: '0.6',
      changefreq: 'monthly',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  writePage(join(DIST, 'sitemap.xml'), xml);
}

/**
 * Generate robots.txt
 */
function generateRobots() {
  const content = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  writePage(join(DIST, 'robots.txt'), content);
}

// Run if called directly
if (process.argv[1]?.endsWith('generate.js')) {
  generateSEOPages();
}
