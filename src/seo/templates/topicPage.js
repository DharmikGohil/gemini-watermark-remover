/**
 * Topic page template (spoke pages).
 * Generates /{category}/{slug}/index.html
 */

import { baseTemplate } from './base.js';
import { generateMetaTags } from '../metadata.js';
import {
  articleSchema, faqSchema, breadcrumbSchema, renderSchemaScripts, SITE_URL,
} from '../schema.js';
import { CATEGORIES, getRelatedTopics } from '../data/topics.js';

export function renderTopicPage(topic) {
  const cat = CATEGORIES[topic.category];
  const canonical = `/${topic.category}/${topic.slug}/`;

  // Metadata
  const metaTags = generateMetaTags({
    title: topic.title,
    description: topic.description,
    canonical,
  });

  // Schema markup
  const schemas = renderSchemaScripts(
    articleSchema(topic, topic.category),
    faqSchema(topic.faqs),
    breadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: cat.title, url: `/${cat.slug}/` },
      { name: topic.heading },
    ])
  );

  // Breadcrumb HTML
  const breadcrumbHtml = `
    <nav class="bc" aria-label="Breadcrumb">
      <a href="${SITE_URL}/">Home</a> <span>/</span>
      <a href="${SITE_URL}/${cat.slug}/">${cat.title}</a> <span>/</span>
      <span>${topic.heading}</span>
    </nav>`;

  // Related topics (internal linking)
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

  // CTA back to tool
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
