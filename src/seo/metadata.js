/**
 * Dynamic metadata generator.
 * Produces <head> content: title, description, canonical, OG, Twitter cards.
 */

import { SITE_URL, SITE_NAME } from './schema.js';

/**
 * Generate full <head> meta tags for a page.
 * @param {Object} opts
 * @param {string} opts.title - Page title
 * @param {string} opts.description - Meta description (max ~155 chars)
 * @param {string} opts.canonical - Canonical URL path (e.g., /guides/remove-gemini-watermark/)
 * @param {string} [opts.ogType] - Open Graph type (default: 'article')
 * @returns {string} HTML string of meta tags
 */
export function generateMetaTags({ title, description, canonical, ogType = 'article' }) {
  const fullUrl = `${SITE_URL}${canonical}`;
  const ogImage = `${SITE_URL}/og-default.png`;

  return `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${fullUrl}">

    <!-- Open Graph -->
    <meta property="og:type" content="${ogType}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:url" content="${fullUrl}">
    <meta property="og:site_name" content="${SITE_NAME}">
    <meta property="og:image" content="${ogImage}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${ogImage}">
  `.trim();
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
