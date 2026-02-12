/**
 * Build-time validation for topic data.
 * Catches regressions before they ship: duplicate slugs, missing fields,
 * title/description collisions (keyword cannibalization), broken related links.
 * 
 * Run automatically during SSG. Throws on fatal errors, warns on soft issues.
 */

import { TOPICS, CATEGORIES } from './data/topics.js';

const REQUIRED_TOPIC_FIELDS = ['slug', 'category', 'title', 'heading', 'description', 'content', 'faqs'];
const MAX_TITLE_LENGTH = 70;
const MAX_DESC_LENGTH = 160;

export function validateTopics() {
  const errors = [];
  const warnings = [];

  const slugs = new Set();
  const titles = new Set();
  const canonicals = new Set();

  for (const topic of TOPICS) {
    const id = `[${topic.category}/${topic.slug}]`;

    // Required fields
    for (const field of REQUIRED_TOPIC_FIELDS) {
      if (!topic[field]) {
        errors.push(`${id} missing required field: ${field}`);
      }
    }

    // Category exists
    if (topic.category && !CATEGORIES[topic.category]) {
      errors.push(`${id} references unknown category: ${topic.category}`);
    }

    // Duplicate slug (global uniqueness)
    if (slugs.has(topic.slug)) {
      errors.push(`${id} duplicate slug: ${topic.slug}`);
    }
    slugs.add(topic.slug);

    // Duplicate title (keyword cannibalization)
    if (titles.has(topic.title)) {
      errors.push(`${id} duplicate title — causes keyword cannibalization: ${topic.title}`);
    }
    titles.add(topic.title);

    // Canonical collision
    const canonical = `/${topic.category}/${topic.slug}/`;
    if (canonicals.has(canonical)) {
      errors.push(`${id} duplicate canonical URL: ${canonical}`);
    }
    canonicals.add(canonical);

    // Title length
    if (topic.title && topic.title.length > MAX_TITLE_LENGTH) {
      warnings.push(`${id} title exceeds ${MAX_TITLE_LENGTH} chars (${topic.title.length}): may be truncated in SERPs`);
    }

    // Description length
    if (topic.description && topic.description.length > MAX_DESC_LENGTH) {
      warnings.push(`${id} description exceeds ${MAX_DESC_LENGTH} chars (${topic.description.length}): may be truncated in SERPs`);
    }

    // Thin content check
    if (topic.content && topic.content.replace(/<[^>]+>/g, '').trim().length < 200) {
      warnings.push(`${id} content body is very short (<200 chars text) — risk of thin content penalty`);
    }

    // Related slugs point to real topics
    if (topic.relatedSlugs) {
      for (const rs of topic.relatedSlugs) {
        if (!TOPICS.find(t => t.slug === rs)) {
          errors.push(`${id} relatedSlugs references non-existent slug: ${rs}`);
        }
      }
    }

    // FAQs have both q and a
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
    console.warn(`⚠️  SEO validation warnings (${warnings.length}):`);
    warnings.forEach(w => console.warn(`   ${w}`));
  }

  if (errors.length > 0) {
    console.error(`❌ SEO validation errors (${errors.length}):`);
    errors.forEach(e => console.error(`   ${e}`));
    throw new Error(`SEO validation failed with ${errors.length} error(s). Fix before deploying.`);
  }

  console.log(`✅ SEO validation passed: ${TOPICS.length} topics, ${Object.keys(CATEGORIES).length} categories`);
}
