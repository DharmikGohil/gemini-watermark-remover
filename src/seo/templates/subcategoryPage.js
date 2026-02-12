/**
 * Subcategory hub page template.
 * Generates /{parent}/{subcategory}/index.html
 * 
 * Lists all spoke pages in the subcategory with pagination-style
 * display (shows first N, links to all). Includes CollectionPage schema.
 */

import { baseTemplate } from './base.js';
import { generateMetaTags } from '../metadata.js';
import { breadcrumbSchema, renderSchemaScripts, SITE_URL } from '../schema.js';
import { CATEGORIES, SUBCATEGORIES } from '../data/topics.js';

const MAX_DISPLAY = 100; // show first 100 on the hub, rest are still linked in sitemap

export function renderSubcategoryPage(sub, topics) {
  const parent = CATEGORIES[sub.parent];
  const canonical = `/${sub.parent}/${sub.slug}/`;

  const metaTags = generateMetaTags({
    title: `${sub.title} | Clearmark`,
    description: sub.description,
    canonical,
    ogType: 'website',
  });

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: sub.title,
    description: sub.description,
    url: `${SITE_URL}${canonical}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: topics.length,
      itemListElement: topics.slice(0, 50).map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/${t.category}/${t.slug}/`,
        name: t.heading,
      })),
    },
  };

  const schemas = renderSchemaScripts(
    collectionSchema,
    breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: parent.title, url: `/${parent.slug}/` },
      { name: sub.title },
    ])
  );

  const breadcrumbHtml = `
    <nav class="bc" aria-label="Breadcrumb">
      <a href="${SITE_URL}/">Home</a> <span>/</span>
      <a href="${SITE_URL}/${parent.slug}/">${parent.title}</a> <span>/</span>
      <span>${sub.title}</span>
    </nav>`;

  // Cross-links to sibling subcategories
  const siblings = Object.values(SUBCATEGORIES).filter(s => s.parent === sub.parent && s.slug !== sub.slug);
  const siblingHtml = siblings.length > 0 ? `
    <section class="related" style="margin-top:48px">
      <h2>More in ${parent.title}</h2>
      <div class="related-grid">
        ${siblings.map(s => `
          <a href="${SITE_URL}/${s.parent}/${s.slug}/" class="related-card">
            <h3>${s.title}</h3>
            <p>${s.description.slice(0, 100)}…</p>
          </a>
        `).join('')}
      </div>
    </section>` : '';

  const displayed = topics.slice(0, MAX_DISPLAY);
  const remaining = topics.length - displayed.length;

  const bodyContent = `
    <h1>${sub.title}</h1>
    <p style="font-size:16px;color:var(--text2);margin-bottom:8px">${sub.description}</p>
    <p style="font-size:13px;color:var(--text3);margin-bottom:0">${topics.length.toLocaleString()} articles</p>
    <div class="hub-grid">
      ${displayed.map(t => `
        <a href="${SITE_URL}/${t.category}/${t.slug}/" class="hub-card">
          <h3>${t.heading}</h3>
          <p>${t.description.slice(0, 100)}…</p>
        </a>
      `).join('')}
    </div>
    ${remaining > 0 ? `<p style="text-align:center;margin-top:24px;color:var(--text3);font-size:13px">+ ${remaining.toLocaleString()} more articles indexed in the sitemap</p>` : ''}
    ${siblingHtml}
    <div class="cta" style="margin-top:48px">
      <p style="margin-bottom:16px;color:var(--text2)">Ready to remove watermarks?</p>
      <a href="${SITE_URL}/">Try Clearmark Free →</a>
    </div>`;

  return baseTemplate({
    headContent: `${metaTags}\n    ${schemas}`,
    bodyContent,
    breadcrumbHtml,
  });
}
