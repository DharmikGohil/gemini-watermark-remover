/**
 * Hub page template (category landing pages).
 * Generates /{category}/index.html
 */

import { baseTemplate } from './base.js';
import { generateMetaTags } from '../metadata.js';
import { breadcrumbSchema, renderSchemaScripts, SITE_URL } from '../schema.js';
import { getTopicsByCategory } from '../data/topics.js';

export function renderHubPage(category) {
  const topics = getTopicsByCategory(category.slug);
  const canonical = `/${category.slug}/`;

  const metaTags = generateMetaTags({
    title: `${category.title} | Clearmark`,
    description: category.description,
    canonical,
    ogType: 'website',
  });

  const schemas = renderSchemaScripts(
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

  const bodyContent = `
    <h1>${category.title}</h1>
    <p>${category.description}</p>
    <div class="hub-grid">
      ${topics.map(t => `
        <a href="${SITE_URL}/${t.category}/${t.slug}/" class="hub-card">
          <h3>${t.heading}</h3>
          <p>${t.description.slice(0, 120)}…</p>
        </a>
      `).join('')}
    </div>
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
