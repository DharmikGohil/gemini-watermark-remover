/**
 * Hub page template (category landing pages).
 * Generates /{category}/index.html
 * 
 * Includes CollectionPage schema, cross-links to sibling hubs,
 * and links to all spoke pages in the category.
 */

import { baseTemplate } from './base.js';
import { generateMetaTags } from '../metadata.js';
import { breadcrumbSchema, renderSchemaScripts, SITE_URL } from '../schema.js';
import { CATEGORIES, getTopicsByCategory } from '../data/topics.js';

export function renderHubPage(category) {
  const topics = getTopicsByCategory(category.slug);
  const canonical = `/${category.slug}/`;

  const metaTags = generateMetaTags({
    title: `${category.title} | Clearmark`,
    description: category.description,
    canonical,
    ogType: 'website',
  });

  // CollectionPage schema for hub
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.title,
    description: category.description,
    url: `${SITE_URL}${canonical}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: topics.map((t, i) => ({
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
      { name: category.title },
    ])
  );

  const breadcrumbHtml = `
    <nav class="bc" aria-label="Breadcrumb">
      <a href="${SITE_URL}/">Home</a> <span>/</span>
      <span>${category.title}</span>
    </nav>`;

  // Cross-links to sibling hub pages
  const siblingHubs = Object.values(CATEGORIES).filter(c => c.slug !== category.slug);
  const siblingHtml = siblingHubs.length > 0 ? `
    <section class="related" style="margin-top:48px">
      <h2>Explore More</h2>
      <div class="related-grid">
        ${siblingHubs.map(h => `
          <a href="${SITE_URL}/${h.slug}/" class="related-card">
            <h3>${h.title}</h3>
            <p>${h.description.slice(0, 100)}…</p>
          </a>
        `).join('')}
      </div>
    </section>` : '';

  const bodyContent = `
    <h1>${category.title}</h1>
    <p style="font-size:16px;color:var(--text2);margin-bottom:8px">${category.description}</p>
    <p style="font-size:13px;color:var(--text3);margin-bottom:0">${topics.length} article${topics.length !== 1 ? 's' : ''}</p>
    <div class="hub-grid">
      ${topics.map(t => `
        <a href="${SITE_URL}/${t.category}/${t.slug}/" class="hub-card">
          <h3>${t.heading}</h3>
          <p>${t.description.slice(0, 120)}…</p>
        </a>
      `).join('')}
    </div>
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
