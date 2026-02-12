/**
 * Topic page template (spoke pages).
 * Generates /{category}/{slug}/index.html
 * 
 * Handles both seed topics (no subcategory) and factory topics (with subcategory).
 */

import { baseTemplate } from './base.js';
import { generateMetaTags } from '../metadata.js';
import {
  articleSchema, faqSchema, breadcrumbSchema, renderSchemaScripts, SITE_URL,
} from '../schema.js';
import { CATEGORIES, SUBCATEGORIES, getRelatedTopics } from '../data/topics.js';

export function renderTopicPage(topic) {
  const cat = CATEGORIES[topic.category];
  const sub = topic.subcategory ? SUBCATEGORIES[topic.subcategory] : null;
  const canonical = `/${topic.category}/${topic.slug}/`;

  const metaTags = generateMetaTags({
    title: topic.title,
    description: topic.description,
    canonical,
  });

  // Breadcrumb: Home > Category > [Subcategory] > Page
  const crumbs = [{ name: 'Home', url: '/' }, { name: cat.title, url: `/${cat.slug}/` }];
  if (sub) crumbs.push({ name: sub.title, url: `/${sub.parent}/${sub.slug}/` });
  crumbs.push({ name: topic.heading });

  const schemas = renderSchemaScripts(
    articleSchema(topic, topic.category),
    faqSchema(topic.faqs),
    breadcrumbSchema(crumbs)
  );

  const breadcrumbHtml = `
    <nav class="bc" aria-label="Breadcrumb">
      ${crumbs.map((c, i) =>
        i < crumbs.length - 1
          ? `<a href="${SITE_URL}${c.url}">${c.name}</a> <span>/</span>`
          : `<span>${c.name}</span>`
      ).join(' ')}
    </nav>`;

  // Related topics
  const related = getRelatedTopics(topic);
  const relatedHtml = related.length > 0 ? `
    <section class="related">
      <h2>Related Articles</h2>
      <div class="related-grid">
        ${related.map(r => `
          <a href="${SITE_URL}/${r.category}/${r.slug}/" class="related-card">
            <h3>${r.heading}</h3>
            <p>${r.description.slice(0, 100)}…</p>
          </a>
        `).join('')}
      </div>
    </section>` : '';

  // FAQ section
  const faqHtml = topic.faqs && topic.faqs.length > 0 ? `
    <section class="faq">
      <h2>Frequently Asked Questions</h2>
      ${topic.faqs.map(f => `
        <div class="faq-item">
          <h3>${f.q}</h3>
          <p>${f.a}</p>
        </div>
      `).join('')}
    </section>` : '';

  // CTA
  const ctaHtml = `
    <div class="cta">
      <p style="margin-bottom:16px;color:var(--text2)">Ready to remove watermarks?</p>
      <a href="${SITE_URL}/">Try Clearmark Free →</a>
    </div>`;

  const bodyContent = `
    <article>
      <h1>${topic.heading}</h1>
      <div class="content-body">${topic.content}</div>
      ${faqHtml}
      ${relatedHtml}
      ${ctaHtml}
    </article>`;

  return baseTemplate({
    headContent: `${metaTags}\n    ${schemas}`,
    bodyContent,
    breadcrumbHtml,
  });
}
