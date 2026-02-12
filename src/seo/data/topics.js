/**
 * Unified topic data source.
 * 
 * Merges hand-crafted seed topics (high-quality editorial pages)
 * with factory-generated combinatorial topics (100k+ scale).
 * 
 * The seed topics are always included and serve as pillar content.
 * Factory topics fill out the long-tail programmatic SEO matrix.
 */

import { generateAllTopics, resolveRelatedSlugs, SUBCATEGORIES } from './factory.js';

// ─── Categories (top-level hubs) ─────────────────────────────────────

export const CATEGORIES = {
  guides: {
    slug: 'guides',
    title: 'Gemini AI Image Guides',
    description: 'Step-by-step guides for removing AI watermarks, organized by model, platform, format, and use case.',
    icon: 'book',
  },
  tools: {
    slug: 'tools',
    title: 'AI Image Tools & Utilities',
    description: 'Free browser-based tools for processing, analyzing, and optimizing AI-generated images.',
    icon: 'wrench',
  },
  learn: {
    slug: 'learn',
    title: 'Learn About AI Image Watermarks',
    description: 'Educational resources about AI watermarking: SynthID, alpha blending, EXIF metadata, and model comparisons.',
    icon: 'graduation-cap',
  },
};

export { SUBCATEGORIES };

// ─── Seed Topics (hand-crafted pillar content) ───────────────────────

const SEED_TOPICS = [
  {
    slug: 'remove-gemini-watermark',
    category: 'guides',
    subcategory: 'remove-watermark',
    title: 'How to Remove Gemini AI Watermarks from Images | Clearmark',
    heading: 'How to Remove Gemini AI Watermarks from Images',
    description: 'Learn how to remove visible watermarks from Google Gemini AI-generated images using free browser-based tools with lossless reverse alpha blending.',
    schemaType: 'Article',
    relatedSlugs: ['what-is-alpha-blending', 'gemini-watermark-sizes', 'check-gemini-exif'],
    content: `
      <p>Google Gemini adds a small visible watermark to every AI-generated image. Clearmark removes it using <strong>reverse alpha blending</strong> — a mathematical technique that reconstructs the original pixel values without any quality loss.</p>
      <h2>Step-by-Step Process</h2>
      <ol>
        <li>Open Clearmark in your browser — no installation needed.</li>
        <li>Drag and drop your Gemini image (JPG, PNG, or WebP).</li>
        <li>The watermark is detected and removed automatically in milliseconds.</li>
        <li>Download the clean image or batch-process multiple files.</li>
      </ol>
      <h2>Why This Works</h2>
      <p>Gemini composites watermarks using the formula: <code>watermarked = α × logo + (1 - α) × original</code>. Clearmark reverses this equation to recover the original pixel data with zero quality loss.</p>
    `,
    faqs: [
      { q: 'Does removing the watermark affect image quality?', a: 'No. Clearmark uses lossless reverse alpha blending, which mathematically reconstructs the exact original pixel values.' },
      { q: 'Does this work on non-Gemini images?', a: 'The tool is calibrated specifically for Gemini AI watermarks. Using it on other images may produce distorted results.' },
      { q: 'Is my image uploaded to a server?', a: 'No. All processing happens locally in your browser. Your images never leave your device.' },
    ],
  },
  {
    slug: 'what-is-alpha-blending',
    category: 'learn',
    title: 'What Is Alpha Blending? How AI Watermarks Work | Clearmark',
    heading: 'What Is Alpha Blending and How Do AI Watermarks Work?',
    description: 'Understand the alpha blending technique used by Google Gemini to embed visible watermarks in AI-generated images, and how reverse blending removes them.',
    schemaType: 'Article',
    relatedSlugs: ['remove-gemini-watermark', 'synthid-vs-visible-watermarks', 'gemini-watermark-sizes'],
    content: `
      <p>Alpha blending is a compositing technique that combines a foreground image (the watermark) with a background image (your photo) using an alpha channel that controls transparency.</p>
      <h2>The Math Behind It</h2>
      <p>The blending formula is: <code>result = α × foreground + (1 - α) × background</code>, where α ranges from 0 (fully transparent) to 1 (fully opaque).</p>
      <h2>Reversing the Process</h2>
      <p>If you know the watermark pattern and its alpha values, you can solve for the original: <code>original = (result - α × watermark) / (1 - α)</code>. This is exactly what Clearmark does.</p>
    `,
    faqs: [
      { q: 'What is an alpha channel?', a: 'An alpha channel stores transparency information for each pixel, with values from 0 (fully transparent) to 1 (fully opaque).' },
      { q: 'Can any watermark be reversed with alpha blending?', a: 'Only watermarks applied via alpha compositing with a known pattern can be mathematically reversed. Arbitrary watermarks cannot.' },
    ],
  },
  {
    slug: 'gemini-watermark-sizes',
    category: 'learn',
    title: 'Gemini AI Watermark Sizes and Positions Explained | Clearmark',
    heading: 'Gemini AI Watermark Sizes and Positions Explained',
    description: 'Technical breakdown of Google Gemini watermark dimensions: 48×48 vs 96×96 pixels, margin offsets, and how detection works based on image resolution.',
    schemaType: 'Article',
    relatedSlugs: ['remove-gemini-watermark', 'what-is-alpha-blending', 'check-gemini-exif'],
    content: `
      <p>Gemini uses two watermark sizes depending on the output image resolution:</p>
      <h2>Size Rules</h2>
      <ul>
        <li><strong>48×48 pixels</strong> with 32px margins — used when either image dimension is ≤1024px.</li>
        <li><strong>96×96 pixels</strong> with 64px margins — used when both dimensions exceed 1024px.</li>
      </ul>
      <h2>Position</h2>
      <p>The watermark is always placed in the <strong>bottom-right corner</strong>, offset by the margin values from the image edges.</p>
    `,
    faqs: [
      { q: 'Where is the Gemini watermark located?', a: 'Always in the bottom-right corner, offset by 32px (small images) or 64px (large images) from the edges.' },
      { q: 'How does Clearmark detect the watermark size?', a: 'It checks if both image dimensions exceed 1024 pixels. If so, it uses the 96×96 pattern; otherwise, the 48×48 pattern.' },
    ],
  },
  {
    slug: 'synthid-vs-visible-watermarks',
    category: 'learn',
    title: "SynthID vs Visible Watermarks: What's the Difference? | Clearmark",
    heading: "SynthID vs Visible Watermarks: What's the Difference?",
    description: 'Compare Google SynthID invisible steganographic watermarks with visible alpha-blended watermarks in Gemini AI images.',
    schemaType: 'Article',
    relatedSlugs: ['what-is-alpha-blending', 'remove-gemini-watermark', 'check-gemini-exif'],
    content: `
      <p>Google uses two distinct watermarking systems for AI-generated images:</p>
      <h2>Visible Watermarks</h2>
      <p>A small logo composited onto the image using alpha blending. This is what Clearmark removes.</p>
      <h2>SynthID (Invisible)</h2>
      <p>A steganographic watermark embedded directly into the pixel data at a level imperceptible to the human eye. SynthID survives cropping, compression, and screenshots.</p>
      <h2>Key Differences</h2>
      <ul>
        <li>Visible watermarks can be mathematically reversed; SynthID cannot be removed by simple tools.</li>
        <li>SynthID is designed for provenance verification, not visual branding.</li>
      </ul>
    `,
    faqs: [
      { q: 'Does Clearmark remove SynthID?', a: 'No. Clearmark only removes the visible alpha-blended watermark. SynthID is an invisible steganographic watermark that persists.' },
      { q: 'Can SynthID be detected?', a: "Yes, but only by Google's proprietary detection tools. It is invisible to the human eye and standard image editors." },
    ],
  },
  {
    slug: 'check-gemini-exif',
    category: 'guides',
    title: 'How to Check if an Image Was Made by Gemini AI (EXIF) | Clearmark',
    heading: 'How to Check if an Image Was Made by Gemini AI Using EXIF Data',
    description: 'Verify if an image was generated by Google Gemini AI by examining its EXIF metadata, including the "Made with Google AI" credit field.',
    schemaType: 'Article',
    relatedSlugs: ['remove-gemini-watermark', 'gemini-watermark-sizes', 'synthid-vs-visible-watermarks'],
    content: `
      <p>Gemini AI embeds metadata in every generated image. You can check the EXIF data to verify origin.</p>
      <h2>What to Look For</h2>
      <ul>
        <li><strong>Credit field</strong>: Should read "Made with Google AI".</li>
        <li><strong>ImageWidth / ImageHeight</strong>: Present in original (unmodified) images.</li>
      </ul>
      <h2>Why It Matters</h2>
      <p>Clearmark checks EXIF data automatically. If the image isn't from Gemini or has been resized, you'll see a warning — because the watermark pattern won't match and removal may produce artifacts.</p>
    `,
    faqs: [
      { q: 'What happens if I process a non-Gemini image?', a: "Clearmark will warn you. Processing may produce visual artifacts since the watermark pattern won't match." },
      { q: 'Does resizing an image remove the EXIF data?', a: 'It depends on the tool. Many image editors strip EXIF on export. Clearmark checks for both the credit field and dimension metadata.' },
    ],
  },
  {
    slug: 'batch-watermark-removal',
    category: 'guides',
    title: 'Batch Remove Watermarks from Multiple Gemini Images | Clearmark',
    heading: 'How to Batch Remove Watermarks from Multiple Gemini Images',
    description: "Process multiple Gemini AI images at once with Clearmark's batch mode. Remove watermarks from dozens of images simultaneously.",
    schemaType: 'Article',
    relatedSlugs: ['remove-gemini-watermark', 'check-gemini-exif', 'gemini-watermark-sizes'],
    content: `
      <p>Clearmark supports batch processing — select multiple images and they'll all be processed concurrently.</p>
      <h2>How Batch Mode Works</h2>
      <ol>
        <li>Select or drag multiple image files into the upload zone.</li>
        <li>Clearmark processes up to 3 images simultaneously for speed.</li>
        <li>Each image shows its own status, watermark info, and download button.</li>
        <li>Click "Download All" to get a ZIP file with all processed images.</li>
      </ol>
      <h2>Performance</h2>
      <p>Processing is near-instant per image since it's pure math — no AI inference or server round-trips. Batch processing 50+ images typically takes just seconds.</p>
    `,
    faqs: [
      { q: 'Is there a limit on batch size?', a: "There's no hard limit, but very large batches may be constrained by your browser's available memory. Files over 20MB each are skipped." },
      { q: 'What format are batch downloads?', a: 'Individual images download as PNG. The "Download All" button creates a ZIP file containing all processed images.' },
    ],
  },
  {
    slug: 'userscript-auto-remove',
    category: 'tools',
    title: 'Auto-Remove Gemini Watermarks with Tampermonkey Userscript | Clearmark',
    heading: 'Automatically Remove Gemini Watermarks with the Clearmark Userscript',
    description: 'Install the Clearmark Tampermonkey userscript to automatically remove watermarks from Gemini AI images on gemini.google.com.',
    schemaType: 'Article',
    relatedSlugs: ['remove-gemini-watermark', 'batch-watermark-removal', 'what-is-alpha-blending'],
    content: `
      <p>The Clearmark userscript runs directly on gemini.google.com and automatically processes images as they're generated.</p>
      <h2>Installation</h2>
      <ol>
        <li>Install <a href="https://www.tampermonkey.net/" rel="noopener">Tampermonkey</a> browser extension.</li>
        <li>Click the Clearmark userscript install link.</li>
        <li>Visit gemini.google.com — watermarks are removed automatically.</li>
      </ol>
      <h2>How It Works</h2>
      <p>The script uses a MutationObserver to detect new images, intercepts download requests, and processes images through the same reverse alpha blending engine as the web tool.</p>
    `,
    faqs: [
      { q: 'Does the userscript work on mobile?', a: 'Tampermonkey is primarily a desktop browser extension. Mobile support is limited to browsers like Firefox for Android with extension support.' },
      { q: 'Does it affect page performance?', a: 'Minimally. Processing is triggered only when Gemini images are detected, and the math operations complete in milliseconds.' },
    ],
  },
];

// ─── Merge seed + factory topics ─────────────────────────────────────

const factoryTopics = generateAllTopics();
resolveRelatedSlugs(factoryTopics);

// Seed slugs take priority — filter out any factory dupes
const seedSlugs = new Set(SEED_TOPICS.map(t => t.slug));
const dedupedFactory = factoryTopics.filter(t => !seedSlugs.has(t.slug));

export const TOPICS = [...SEED_TOPICS, ...dedupedFactory];

// ─── Lookup helpers ──────────────────────────────────────────────────

const _slugIndex = new Map(TOPICS.map(t => [t.slug, t]));

export function getTopicBySlug(slug) {
  return _slugIndex.get(slug) || null;
}

export function getTopicsByCategory(categorySlug) {
  return TOPICS.filter(t => t.category === categorySlug);
}

export function getTopicsBySubcategory(subcategorySlug) {
  return TOPICS.filter(t => t.subcategory === subcategorySlug);
}

export function getRelatedTopics(topic) {
  return (topic.relatedSlugs || [])
    .map(s => _slugIndex.get(s))
    .filter(Boolean);
}
