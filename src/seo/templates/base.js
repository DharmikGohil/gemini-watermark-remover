/**
 * Base HTML template shared by all generated pages.
 * Keeps bundle size minimal — no framework, just template literals.
 */

import { SITE_URL } from '../schema.js';

/**
 * @param {Object} opts
 * @param {string} opts.headContent - Meta tags, schema scripts, etc.
 * @param {string} opts.bodyContent - Main page content HTML
 * @param {string} opts.breadcrumbHtml - Breadcrumb navigation HTML
 * @param {string} [opts.bodyClass] - Optional body class
 * @returns {string} Full HTML document
 */
export function baseTemplate({ headContent, bodyContent, breadcrumbHtml, bodyClass = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${headContent}
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a78bfa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 3l-1.9 5.8-5.8 1.9 5.8 1.9 1.9 5.8 1.9-5.8 5.8-1.9-5.8-1.9z'/%3E%3C/svg%3E">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>${minimalCSS()}</style>
</head>
<body class="${bodyClass}">
  <header class="sh">
    <div class="sh-inner">
      <a href="${SITE_URL}/" class="logo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9 1.9 5.8 1.9-5.8 5.8-1.9-5.8-1.9Z"/></svg>
        <span>Clearmark</span>
      </a>
      <nav>
        <a href="${SITE_URL}/">Tool</a>
        <a href="${SITE_URL}/guides/">Guides</a>
        <a href="${SITE_URL}/learn/">Learn</a>
        <a href="${SITE_URL}/tools/">Tools</a>
      </nav>
    </div>
  </header>
  <main>
    ${breadcrumbHtml}
    ${bodyContent}
  </main>
  <footer class="sf">
    <p>&copy; ${new Date().getFullYear()} Clearmark. For educational purposes only.</p>
  </footer>
</body>
</html>`;
}

/**
 * Minimal CSS for SEO pages — keeps page weight low for Core Web Vitals.
 * No external CSS files; everything is inlined for fastest FCP.
 */
function minimalCSS() {
  return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#09090b;--bg2:#111113;--border:rgba(255,255,255,.06);--text:#fafafa;--text2:#a1a1aa;--text3:#52525b;--accent:#a78bfa;--radius:12px}
body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;min-height:100vh;display:flex;flex-direction:column;line-height:1.7}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
.sh{position:sticky;top:0;z-index:50;background:rgba(9,9,11,.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);height:56px}
.sh-inner{max-width:900px;margin:0 auto;padding:0 24px;height:100%;display:flex;align-items:center;justify-content:space-between}
.logo{display:flex;align-items:center;gap:8px;color:var(--text);font-weight:800;font-size:15px;text-decoration:none}
.logo svg{color:var(--accent)}
nav{display:flex;gap:16px;font-size:13px}nav a{color:var(--text2);text-decoration:none}nav a:hover{color:var(--text)}
main{flex:1;max-width:900px;margin:0 auto;padding:48px 24px 80px;width:100%}
.bc{display:flex;gap:6px;font-size:12px;color:var(--text3);margin-bottom:32px;flex-wrap:wrap}
.bc a{color:var(--text2)}.bc span{color:var(--text3)}
h1{font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-.03em;line-height:1.15;margin-bottom:24px;background:linear-gradient(to bottom,#fff 30%,var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
h2{font-size:22px;font-weight:700;margin:32px 0 12px;color:var(--text)}
h3{font-size:18px;font-weight:600;margin:24px 0 8px}
p,li{color:var(--text2);font-size:15px;margin-bottom:12px}
ul,ol{padding-left:24px;margin-bottom:16px}
code{background:var(--bg2);padding:2px 6px;border-radius:4px;font-size:13px;color:var(--accent)}
.content-body{margin-bottom:48px}
.faq{margin:48px 0}.faq h2{margin-bottom:20px}
.faq-item{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:20px 24px;margin-bottom:12px}
.faq-item h3{margin:0 0 8px;font-size:15px;color:var(--text)}
.faq-item p{margin:0;font-size:14px}
.related{margin:48px 0}.related h2{margin-bottom:16px}
.related-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.related-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px;transition:border-color .2s}
.related-card:hover{border-color:rgba(167,139,250,.3);text-decoration:none}
.related-card h3{font-size:14px;font-weight:600;color:var(--text);margin:0 0 4px}
.related-card p{font-size:12px;color:var(--text3);margin:0}
.hub-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:24px}
.hub-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:20px 24px;transition:border-color .2s}
.hub-card:hover{border-color:rgba(167,139,250,.3);text-decoration:none}
.hub-card h3{font-size:16px;font-weight:600;color:var(--text);margin:0 0 6px}
.hub-card p{font-size:13px;color:var(--text3);margin:0}
.cta{text-align:center;margin:48px 0;padding:32px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius)}
.cta a{display:inline-block;padding:12px 28px;background:linear-gradient(135deg,var(--accent),#8b5cf6);color:#fff;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none}
.sf{border-top:1px solid var(--border);padding:24px;text-align:center;font-size:12px;color:var(--text3)}
@media(max-width:640px){nav{gap:10px}main{padding:32px 16px 60px}}
  `.trim();
}
