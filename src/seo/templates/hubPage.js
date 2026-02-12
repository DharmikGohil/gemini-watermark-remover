/**
 * Top-level hub page template.
 * Generates /{category}/index.html
 * 
 * At 100k+ scale, hubs link to subcategory pages (not individual topics).
 * Also shows the hand-crafted seed/pillar topics directly.
 */

import { baseTemplate } from './base.js';
import { generateMetaTags } from '../metadata.js';
import { breadcrumbSchema, renderSchemaScripts, SITE_URL } from '../schema.js';
import { CATEGORIES, SUBCATEGORIES, getTopicsByCategory, getTopicsBySubcategory } from '../data/topics.js';

export function renderHubPage(category) {
  const allTopics = getTopicsByCategory(category.slug);
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

  // Subcategories for this hub
  const subs = Object.values(SUBCATEGORIES).filter(s => s.parent === category.slug);

  // Pillar topics (no subcategory = hand-crafted seed content)
  const pillarTopics = allTopics.filter(t => !t.subcategory).slice(0, 20);

  // Cross-links to sibling hubs
  const siblingHubs = Object.values(CATEGORIES).filter(c => c.slug !== category.slug);

  const subsHtml = subs.length > 0 ? `
    <h2 style="margin-top:32px">Browse by Topic</h2>
    <div class="hub-grid">
      ${subs.map(s => {
        const count = getTopicsBySubcategory(s.slug).length;
        return `
        <a href="${SITE_URL}/${s.parent}/${s.slug}/" class="hub-card">
          <h3>${s.title}</h3>
          <p>${s.description.slice(0, 100)}…</p>
          <p style="font-size:11px;color:var(--text3);margin-top:6px">${count.toLocaleString()} articles</p>
        </a>`;
      }).join('')}
    </div>` : '';

  const pillarHtml = pillarTopics.length > 0 ? `
    <h2 style="margin-top:40px">Featured Articles</h2>
    <div class="hub-grid">
      ${pillarTopics.map(t => `
        <a href="${SITE_URL}/${t.category}/${t.slug}/" class="hub-card">
          <h3>${t.heading}</h3>
          <p>${t.description.slice(0, 120)}…</p>
        </a>
      `).join('')}
    </div>` : '';

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
    <p style="font-size:16px;color:var(--text2);margin-bottom:4px">${category.description}</p>
    <p style="font-size:13px;color:var(--text3)">${allTopics.length.toLocaleString()} articles</p>
    ${subsHtml}
    ${pillarHtml}
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
