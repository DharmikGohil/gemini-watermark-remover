/**
 * Custom 404 page — keeps users on-site and passes link equity.
 */

import { baseTemplate } from './base.js';
import { SITE_URL } from '../schema.js';

export function render404Page() {
  const headContent = `
    <title>Page Not Found | Clearmark</title>
    <meta name="robots" content="noindex">
  `.trim();

  const bodyContent = `
    <div style="text-align:center;padding:80px 0">
      <h1 style="font-size:64px;margin-bottom:8px">404</h1>
      <p style="font-size:18px;color:var(--text2);margin-bottom:32px">This page doesn't exist.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a href="${SITE_URL}/" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,var(--accent),#8b5cf6);color:#fff;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none">Remove Watermarks</a>
        <a href="${SITE_URL}/guides/" style="display:inline-block;padding:12px 28px;border:1px solid var(--border);color:var(--text2);border-radius:8px;font-weight:600;font-size:14px;text-decoration:none">Browse Guides</a>
        <a href="${SITE_URL}/learn/" style="display:inline-block;padding:12px 28px;border:1px solid var(--border);color:var(--text2);border-radius:8px;font-weight:600;font-size:14px;text-decoration:none">Learn</a>
      </div>
    </div>`;

  return baseTemplate({
    headContent,
    bodyContent,
    breadcrumbHtml: '',
  });
}
