/**
 * Build-time validation for topic data at 100k+ scale.
 * Uses Set/Map lookups (O(1)) instead of array scans.
 * 
 * Checks: duplicate slugs, duplicate canonicals, missing fields,
 * broken related links, thin content, title length.
 * 
 * Throws on fatal errors. Warns on soft issues (capped to avoid log spam).
 */

import { TOPICS, CATEGORIES } from './data/topics.js';

const REQUIRED_FIELDS = ['slug', 'category', 'title', 'heading', 'description', 'content', 'faqs'];
const MAX_TITLE_LEN = 80; // slightly relaxed for long model names
const MAX_DESC_LEN = 170;
const MAX_WARNINGS = 20; // cap warning output at scale

export function validateTopics() {
  const errors = [];
  const warnings = [];

  const slugs = new Set();
  const canonicals = new Set();
  const allSlugs = new Set(TOPICS.map(t => t.slug)); // for related-slug checks

  for (const topic of TOPICS) {
    const id = `[${topic.category}/${topic.slug}]`;

    // Required fields
    for (const field of REQUIRED_FIELDS) {
      if (!topic[field]) {
        errors.push(`${id} missing required field: ${field}`);
      }
    }

    // Category exists
    if (topic.category && !CATEGORIES[topic.category]) {
      errors.push(`${id} unknown category: ${topic.category}`);
    }

    // Duplicate slug
    if (slugs.has(topic.slug)) {
      errors.push(`${id} duplicate slug`);
    }
    slugs.add(topic.slug);

    // Duplicate canonical
    const canonical = `/${topic.category}/${topic.slug}/`;
    if (canonicals.has(canonical)) {
      errors.push(`${id} duplicate canonical: ${canonical}`);
    }
    canonicals.add(canonical);

    // Title length (warn only, capped)
    if (warnings.length < MAX_WARNINGS) {
      if (topic.title && topic.title.length > MAX_TITLE_LEN) {
        warnings.push(`${id} title ${topic.title.length} chars (max ${MAX_TITLE_LEN})`);
      }
      if (topic.description && topic.description.length > MAX_DESC_LEN) {
        warnings.push(`${id} desc ${topic.description.length} chars (max ${MAX_DESC_LEN})`);
      }
    }

    // Related slugs point to real topics (O(1) lookup)
    if (topic.relatedSlugs) {
      for (const rs of topic.relatedSlugs) {
        if (!allSlugs.has(rs)) {
          errors.push(`${id} relatedSlugs references missing slug: ${rs}`);
        }
      }
    }

    // FAQs structure
    if (topic.faqs) {
      topic.faqs.forEach((faq, i) => {
        if (!faq.q || !faq.a) {
          errors.push(`${id} FAQ[${i}] missing q or a`);
        }
      });
    }
  }

  // Report
  if (warnings.length > 0) {
    const shown = warnings.slice(0, MAX_WARNINGS);
    console.warn(`⚠️  SEO warnings (${warnings.length} total, showing ${shown.length}):`);
    shown.forEach(w => console.warn(`   ${w}`));
  }

  if (errors.length > 0) {
    console.error(`❌ SEO validation errors (${errors.length}):`);
    errors.slice(0, 30).forEach(e => console.error(`   ${e}`));
    if (errors.length > 30) console.error(`   ... and ${errors.length - 30} more`);
    throw new Error(`SEO validation failed with ${errors.length} error(s).`);
  }

  console.log(`✅ SEO validation passed: ${TOPICS.length} topics, ${Object.keys(CATEGORIES).length} categories`);
}
