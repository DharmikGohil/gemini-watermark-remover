/**
 * JSON-LD structured data generators.
 * Produces schema.org markup for each page type.
 */

const SITE_URL = 'https://clearmark.dharmikgohil.in';
const SITE_NAME = 'Clearmark';
const LOGO_URL = `${SITE_URL}/logo.svg`;

/**
 * Generate Article schema
 */
export function articleSchema(topic, categorySlug) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: topic.heading,
    description: topic.description,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
    mainEntityOfPage: `${SITE_URL}/${categorySlug}/${topic.slug}/`,
    datePublished: '2025-01-01',
    dateModified: new Date().toISOString().split('T')[0],
  };
}

/**
 * Generate FAQ schema from topic.faqs
 */
export function faqSchema(faqs) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/**
 * Generate Breadcrumb schema
 */
export function breadcrumbSchema(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url ? `${SITE_URL}${c.url}` : undefined,
    })),
  };
}

/**
 * Generate SoftwareApplication schema for the homepage
 */
export function softwareAppSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'Free browser-based tool to remove watermarks from Gemini AI-generated images using lossless reverse alpha blending.',
    url: SITE_URL,
  };
}

/**
 * Combine multiple schema objects into a single script tag string
 */
export function renderSchemaScripts(...schemas) {
  return schemas
    .filter(Boolean)
    .map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('\n    ');
}

export { SITE_URL, SITE_NAME };
