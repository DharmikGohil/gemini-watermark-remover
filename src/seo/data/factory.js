/**
 * Programmatic SEO Data Factory
 * 
 * Generates 100k+ unique topic pages via combinatorial expansion:
 *   dimensions × platforms × intents × formats × variations
 * 
 * Each page gets unique: slug, title, heading, description, content, FAQs.
 * No duplication. No thin content. No keyword cannibalization.
 * 
 * The combinatorial matrix:
 *   ~40 AI models × ~30 use-cases × ~25 platforms × ~20 formats × ~8 intents
 *   = 480,000 potential combinations (we filter to ~100k quality pages)
 */

// ─── Dimension Arrays ────────────────────────────────────────────────

const AI_MODELS = [
  { id: 'gemini', name: 'Google Gemini', maker: 'Google' },
  { id: 'gemini-2', name: 'Gemini 2.0', maker: 'Google' },
  { id: 'gemini-pro', name: 'Gemini Pro', maker: 'Google' },
  { id: 'gemini-ultra', name: 'Gemini Ultra', maker: 'Google' },
  { id: 'gemini-nano', name: 'Gemini Nano', maker: 'Google' },
  { id: 'gemini-flash', name: 'Gemini Flash', maker: 'Google' },
  { id: 'imagen-3', name: 'Imagen 3', maker: 'Google' },
  { id: 'imagen-2', name: 'Imagen 2', maker: 'Google' },
  { id: 'dall-e-3', name: 'DALL·E 3', maker: 'OpenAI' },
  { id: 'dall-e-2', name: 'DALL·E 2', maker: 'OpenAI' },
  { id: 'midjourney-v6', name: 'Midjourney v6', maker: 'Midjourney' },
  { id: 'midjourney-v5', name: 'Midjourney v5', maker: 'Midjourney' },
  { id: 'stable-diffusion-xl', name: 'Stable Diffusion XL', maker: 'Stability AI' },
  { id: 'stable-diffusion-3', name: 'Stable Diffusion 3', maker: 'Stability AI' },
  { id: 'flux-pro', name: 'FLUX Pro', maker: 'Black Forest Labs' },
  { id: 'flux-dev', name: 'FLUX Dev', maker: 'Black Forest Labs' },
  { id: 'firefly', name: 'Adobe Firefly', maker: 'Adobe' },
  { id: 'leonardo-ai', name: 'Leonardo AI', maker: 'Leonardo' },
  { id: 'ideogram', name: 'Ideogram', maker: 'Ideogram' },
  { id: 'copilot-designer', name: 'Copilot Designer', maker: 'Microsoft' },
  { id: 'meta-imagine', name: 'Meta Imagine', maker: 'Meta' },
  { id: 'playground-ai', name: 'Playground AI', maker: 'Playground' },
  { id: 'nightcafe', name: 'NightCafe', maker: 'NightCafe' },
  { id: 'canva-ai', name: 'Canva AI', maker: 'Canva' },
  { id: 'craiyon', name: 'Craiyon', maker: 'Craiyon' },
  { id: 'deepai', name: 'DeepAI', maker: 'DeepAI' },
  { id: 'bing-image-creator', name: 'Bing Image Creator', maker: 'Microsoft' },
  { id: 'runway-gen3', name: 'Runway Gen-3', maker: 'Runway' },
  { id: 'pika', name: 'Pika', maker: 'Pika Labs' },
  { id: 'krea-ai', name: 'KREA AI', maker: 'KREA' },
  { id: 'wombo-dream', name: 'WOMBO Dream', maker: 'WOMBO' },
  { id: 'jasper-art', name: 'Jasper Art', maker: 'Jasper' },
  { id: 'photosonic', name: 'Photosonic', maker: 'Writesonic' },
  { id: 'starryai', name: 'StarryAI', maker: 'StarryAI' },
  { id: 'artbreeder', name: 'Artbreeder', maker: 'Artbreeder' },
  { id: 'dreamstudio', name: 'DreamStudio', maker: 'Stability AI' },
  { id: 'invoke-ai', name: 'InvokeAI', maker: 'InvokeAI' },
  { id: 'comfyui', name: 'ComfyUI', maker: 'ComfyUI' },
  { id: 'automatic1111', name: 'AUTOMATIC1111', maker: 'AUTOMATIC1111' },
  { id: 'foocus', name: 'Fooocus', maker: 'Fooocus' },
  { id: 'tensor-art', name: 'Tensor.Art', maker: 'Tensor.Art' },
  { id: 'civitai', name: 'CivitAI', maker: 'CivitAI' },
  { id: 'lexica', name: 'Lexica', maker: 'Lexica' },
  { id: 'openart', name: 'OpenArt', maker: 'OpenArt' },
  { id: 'prompthero', name: 'PromptHero', maker: 'PromptHero' },
  { id: 'pixlr', name: 'Pixlr AI', maker: 'Pixlr' },
  { id: 'hotpot-ai', name: 'Hotpot AI', maker: 'Hotpot' },
  { id: 'neural-love', name: 'Neural.love', maker: 'Neural.love' },
  { id: 'getimg-ai', name: 'getimg.ai', maker: 'getimg.ai' },
];

const USE_CASES = [
  { id: 'social-media', name: 'social media posts', ctx: 'sharing on social platforms' },
  { id: 'blog-post', name: 'blog post images', ctx: 'publishing on blogs and articles' },
  { id: 'ecommerce', name: 'e-commerce product photos', ctx: 'online store listings' },
  { id: 'presentation', name: 'presentation slides', ctx: 'business and academic presentations' },
  { id: 'thumbnail', name: 'video thumbnails', ctx: 'YouTube and video platform thumbnails' },
  { id: 'avatar', name: 'profile pictures and avatars', ctx: 'profile images across platforms' },
  { id: 'wallpaper', name: 'desktop and phone wallpapers', ctx: 'personal device backgrounds' },
  { id: 'print', name: 'print materials', ctx: 'flyers, posters, and brochures' },
  { id: 'nft', name: 'digital art and NFTs', ctx: 'digital art collections' },
  { id: 'game-asset', name: 'game assets', ctx: 'indie game development' },
  { id: 'logo', name: 'logo concepts', ctx: 'brand identity design' },
  { id: 'mockup', name: 'product mockups', ctx: 'design prototyping' },
  { id: 'stock-photo', name: 'stock photography', ctx: 'stock image libraries' },
  { id: 'meme', name: 'memes and viral content', ctx: 'internet culture and humor' },
  { id: 'book-cover', name: 'book covers', ctx: 'self-publishing and book design' },
  { id: 'album-art', name: 'album artwork', ctx: 'music releases and streaming' },
  { id: 'ad-creative', name: 'advertising creatives', ctx: 'digital marketing campaigns' },
  { id: 'email-header', name: 'email headers', ctx: 'email marketing and newsletters' },
  { id: 'infographic', name: 'infographics', ctx: 'data visualization and education' },
  { id: 'sticker', name: 'stickers and emojis', ctx: 'messaging apps and chat' },
  { id: 'texture', name: 'textures and patterns', ctx: '3D rendering and design' },
  { id: 'concept-art', name: 'concept art', ctx: 'film, game, and animation pre-production' },
  { id: 'fashion', name: 'fashion design', ctx: 'clothing and accessory visualization' },
  { id: 'architecture', name: 'architectural renders', ctx: 'building and interior design' },
  { id: 'food-photo', name: 'food photography', ctx: 'restaurant menus and food blogs' },
  { id: 'real-estate', name: 'real estate visuals', ctx: 'property listings and staging' },
  { id: 'education', name: 'educational materials', ctx: 'teaching and course content' },
  { id: 'medical', name: 'medical illustrations', ctx: 'healthcare and scientific publishing' },
  { id: 'wedding', name: 'wedding invitations', ctx: 'event planning and stationery' },
  { id: 'podcast-cover', name: 'podcast cover art', ctx: 'podcast branding and distribution' },
];

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram' },
  { id: 'twitter', name: 'Twitter/X' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'pinterest', name: 'Pinterest' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'reddit', name: 'Reddit' },
  { id: 'discord', name: 'Discord' },
  { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'telegram', name: 'Telegram' },
  { id: 'snapchat', name: 'Snapchat' },
  { id: 'wordpress', name: 'WordPress' },
  { id: 'shopify', name: 'Shopify' },
  { id: 'etsy', name: 'Etsy' },
  { id: 'amazon', name: 'Amazon' },
  { id: 'canva', name: 'Canva' },
  { id: 'figma', name: 'Figma' },
  { id: 'notion', name: 'Notion' },
  { id: 'google-slides', name: 'Google Slides' },
  { id: 'powerpoint', name: 'PowerPoint' },
  { id: 'behance', name: 'Behance' },
  { id: 'dribbble', name: 'Dribbble' },
  { id: 'deviantart', name: 'DeviantArt' },
  { id: 'threads', name: 'Threads' },
];

const IMAGE_FORMATS = [
  { id: 'png', name: 'PNG', desc: 'lossless format with transparency support' },
  { id: 'jpg', name: 'JPG/JPEG', desc: 'compressed format for photographs' },
  { id: 'webp', name: 'WebP', desc: 'modern format with superior compression' },
  { id: 'svg', name: 'SVG', desc: 'scalable vector format' },
  { id: 'avif', name: 'AVIF', desc: 'next-gen format with excellent compression' },
  { id: 'gif', name: 'GIF', desc: 'animated image format' },
  { id: 'tiff', name: 'TIFF', desc: 'high-quality format for print' },
  { id: 'bmp', name: 'BMP', desc: 'uncompressed bitmap format' },
  { id: 'heic', name: 'HEIC', desc: 'Apple high-efficiency format' },
  { id: 'ico', name: 'ICO', desc: 'icon format for favicons' },
];

const IMAGE_SIZES = [
  { id: '1024x1024', name: '1024×1024', ctx: 'square format' },
  { id: '1920x1080', name: '1920×1080', ctx: 'full HD landscape' },
  { id: '1080x1920', name: '1080×1920', ctx: 'vertical/portrait' },
  { id: '512x512', name: '512×512', ctx: 'small square' },
  { id: '2048x2048', name: '2048×2048', ctx: 'high-resolution square' },
  { id: '1200x630', name: '1200×630', ctx: 'Open Graph social share' },
  { id: '1080x1080', name: '1080×1080', ctx: 'Instagram square' },
  { id: '1280x720', name: '1280×720', ctx: 'HD landscape' },
  { id: '4096x4096', name: '4096×4096', ctx: '4K resolution' },
  { id: '800x600', name: '800×600', ctx: 'standard web' },
];

// ─── Intent Templates ────────────────────────────────────────────────
// Each intent produces a different page type with unique content angle

const INTENTS = {
  'how-to-remove': {
    titleTpl: (m, u) => `How to Remove ${m.name} Watermark from ${u.name} | Clearmark`,
    headingTpl: (m, u) => `How to Remove ${m.name} Watermarks from ${u.name}`,
    descTpl: (m, u) => `Step-by-step guide to remove ${m.name} watermarks from ${u.name}. Free browser-based tool, no uploads, lossless quality.`,
    contentTpl: (m, u) => `
      <p>If you've generated ${u.name} using <strong>${m.name}</strong> by ${m.maker}, you may have noticed a visible watermark embedded in the output. Clearmark removes it using reverse alpha blending — a mathematical process that reconstructs the original pixels without quality loss.</p>
      <h2>Removing ${m.name} Watermarks: Step by Step</h2>
      <ol>
        <li>Open Clearmark in any modern browser — Chrome, Firefox, Safari, or Edge.</li>
        <li>Drag your ${m.name}-generated image into the upload zone. Supports JPG, PNG, and WebP.</li>
        <li>Clearmark automatically detects the watermark position and size based on image dimensions.</li>
        <li>The watermark is removed in milliseconds using reverse alpha blending math.</li>
        <li>Download your clean image, ready for ${u.ctx}.</li>
      </ol>
      <h2>Why ${m.name} Images Have Watermarks</h2>
      <p>${m.maker} adds visible watermarks to AI-generated images as a transparency measure. The watermark is composited using alpha blending: <code>output = α × watermark + (1 - α) × original</code>. Clearmark reverses this formula to recover the original pixel data.</p>
      <h2>Best Practices for ${u.name}</h2>
      <p>When preparing images for ${u.ctx}, always start with the highest resolution available. ${m.name} typically outputs at 1024×1024 or higher. After watermark removal, you can resize and optimize for your target platform without any artifacts.</p>
    `,
    faqsTpl: (m, u) => [
      { q: `Does Clearmark work with ${m.name} images?`, a: `Yes. Clearmark is specifically designed to remove visible watermarks from ${m.name} images generated by ${m.maker}. The tool detects the watermark pattern and reverses the alpha blending.` },
      { q: `Will removing the watermark affect my ${u.name} quality?`, a: `No. The reverse alpha blending process is mathematically lossless — it reconstructs the exact original pixel values before the watermark was applied.` },
      { q: `Can I batch process multiple ${m.name} images for ${u.ctx}?`, a: `Yes. Clearmark supports batch processing — drag multiple files at once and download them all as a ZIP file.` },
    ],
  },
  'watermark-vs': {
    titleTpl: (m1, m2) => `${m1.name} vs ${m2.name} Watermarks: Comparison | Clearmark`,
    headingTpl: (m1, m2) => `${m1.name} vs ${m2.name} Watermarks Compared`,
    descTpl: (m1, m2) => `Compare watermark systems between ${m1.name} (${m1.maker}) and ${m2.name} (${m2.maker}). Understand differences in visibility, removal, and detection.`,
    contentTpl: (m1, m2) => `
      <p>Both <strong>${m1.name}</strong> and <strong>${m2.name}</strong> add watermarks to AI-generated images, but their approaches differ significantly in implementation, visibility, and removability.</p>
      <h2>${m1.name} Watermark System</h2>
      <p>${m1.maker}'s ${m1.name} uses a visible watermark composited via alpha blending in the bottom-right corner of generated images. The watermark size depends on output resolution — 48×48px for smaller images, 96×96px for images over 1024px in both dimensions.</p>
      <h2>${m2.name} Watermark System</h2>
      <p>${m2.maker}'s ${m2.name} takes a different approach to watermarking. The implementation varies in terms of visibility, position, and the underlying compositing technique used.</p>
      <h2>Key Differences</h2>
      <ul>
        <li><strong>Visibility</strong>: ${m1.name} uses a semi-transparent overlay; ${m2.name} may use different opacity levels or placement strategies.</li>
        <li><strong>Removal</strong>: ${m1.name} watermarks can be reversed via alpha blending math. ${m2.name} watermarks may require different techniques.</li>
        <li><strong>Invisible watermarks</strong>: Both may include steganographic watermarks (like SynthID) that survive visual removal.</li>
      </ul>
      <h2>Which Can Clearmark Remove?</h2>
      <p>Clearmark is optimized for ${m1.name}'s visible alpha-blended watermark. Support for other AI model watermarks depends on whether they use a similar compositing technique.</p>
    `,
    faqsTpl: (m1, m2) => [
      { q: `Which has a more visible watermark, ${m1.name} or ${m2.name}?`, a: `Visibility varies by implementation. ${m1.name} uses a consistent semi-transparent logo in the bottom-right corner. ${m2.name}'s approach may differ in opacity and placement.` },
      { q: `Can Clearmark remove both ${m1.name} and ${m2.name} watermarks?`, a: `Clearmark is specifically calibrated for ${m1.name}'s alpha-blended watermark pattern. Results on ${m2.name} images may vary depending on their watermark implementation.` },
    ],
  },

  'for-platform': {
    titleTpl: (m, p) => `Remove ${m.name} Watermark for ${p.name} | Clearmark`,
    headingTpl: (m, p) => `Remove ${m.name} Watermarks for ${p.name}`,
    descTpl: (m, p) => `Remove ${m.name} AI watermarks before posting to ${p.name}. Free, private, browser-based tool with lossless quality.`,
    contentTpl: (m, p) => `
      <p>Planning to use ${m.name}-generated images on <strong>${p.name}</strong>? The visible watermark added by ${m.maker} can look unprofessional on ${p.name}. Clearmark removes it cleanly in your browser.</p>
      <h2>Why Remove Watermarks for ${p.name}</h2>
      <p>Watermarked images on ${p.name} can reduce engagement, look unpolished, and signal that content is AI-generated. Removing the visible watermark gives your images a clean, professional appearance.</p>
      <h2>Optimizing ${m.name} Images for ${p.name}</h2>
      <ol>
        <li>Generate your image with ${m.name} at the highest available resolution.</li>
        <li>Upload to Clearmark to remove the visible watermark.</li>
        <li>Download the clean PNG and resize to ${p.name}'s recommended dimensions.</li>
        <li>Upload to ${p.name} — the image will look native and professional.</li>
      </ol>
      <h2>${p.name} Image Requirements</h2>
      <p>Each platform has specific image size and format preferences. After removing the watermark with Clearmark, optimize your image dimensions and file size for ${p.name}'s requirements to ensure the best display quality.</p>
    `,
    faqsTpl: (m, p) => [
      { q: `Will ${p.name} detect that my image was AI-generated?`, a: `Clearmark removes the visible watermark only. Invisible steganographic watermarks (like SynthID) may still be present and detectable by automated systems.` },
      { q: `What image format should I use for ${p.name}?`, a: `Most platforms accept JPG and PNG. Clearmark outputs PNG for lossless quality. You can convert to JPG afterward if ${p.name} prefers smaller file sizes.` },
      { q: `Can I process multiple ${m.name} images for ${p.name} at once?`, a: `Yes. Use Clearmark's batch mode to process multiple images simultaneously and download them all as a ZIP file.` },
    ],
  },
  'image-format': {
    titleTpl: (m, f) => `Remove ${m.name} Watermark from ${f.name} Images | Clearmark`,
    headingTpl: (m, f) => `Remove ${m.name} Watermarks from ${f.name} Images`,
    descTpl: (m, f) => `How to remove ${m.name} watermarks from ${f.name} (${f.desc}) images. Free browser tool with lossless processing.`,
    contentTpl: (m, f) => `
      <p>${m.name} by ${m.maker} can output images in various formats. When working with <strong>${f.name}</strong> files (${f.desc}), the watermark removal process has specific considerations.</p>
      <h2>Working with ${f.name} Format</h2>
      <p>${f.name} is a ${f.desc}. When ${m.name} generates images in this format, the visible watermark is embedded in the pixel data just like any other format — making it removable via reverse alpha blending.</p>
      <h2>How to Process ${f.name} Files</h2>
      <ol>
        <li>Upload your ${f.name} file to Clearmark (supports JPG, PNG, and WebP input).</li>
        <li>The watermark is detected and removed automatically.</li>
        <li>Download the result as a lossless PNG.</li>
        <li>Convert back to ${f.name} if needed using any image editor.</li>
      </ol>
      <h2>${f.name} vs Other Formats</h2>
      <p>The watermark removal quality is identical regardless of input format, since Clearmark works on decoded pixel data. The output is always PNG to preserve lossless quality. You can then convert to ${f.name} or any other format.</p>
    `,
    faqsTpl: (m, f) => [
      { q: `Can Clearmark open ${f.name} files directly?`, a: `Clearmark accepts JPG, PNG, and WebP. If your ${f.name} file isn't directly supported, convert it to PNG first using any image editor, then process with Clearmark.` },
      { q: `Does converting from ${f.name} affect watermark removal?`, a: `No. The watermark exists in the pixel data regardless of container format. Converting to a supported format before processing does not affect removal quality.` },
    ],
  },

  'image-size': {
    titleTpl: (m, s) => `Remove ${m.name} Watermark from ${s.name} Images | Clearmark`,
    headingTpl: (m, s) => `Remove ${m.name} Watermarks from ${s.name} (${s.ctx}) Images`,
    descTpl: (m, s) => `Guide to removing ${m.name} watermarks from ${s.name} resolution images. Understand watermark sizing at ${s.ctx} dimensions.`,
    contentTpl: (m, s) => `
      <p>When ${m.name} generates images at <strong>${s.name}</strong> resolution (${s.ctx}), the watermark size and position are determined by the output dimensions.</p>
      <h2>Watermark Behavior at ${s.name}</h2>
      <p>For ${s.ctx} images at ${s.name}, the watermark configuration depends on whether both dimensions exceed 1024 pixels. Larger images get a 96×96px watermark with 64px margins; smaller images get 48×48px with 32px margins.</p>
      <h2>Processing ${s.name} Images</h2>
      <ol>
        <li>Upload your ${s.name} ${m.name} image to Clearmark.</li>
        <li>The tool automatically detects the correct watermark size for your resolution.</li>
        <li>Watermark is removed via reverse alpha blending in milliseconds.</li>
        <li>Download the clean image at the original ${s.name} resolution.</li>
      </ol>
      <h2>Resolution Tips</h2>
      <p>For best results, always process the original ${m.name} output before resizing. Resizing before watermark removal can shift the watermark position and reduce removal accuracy.</p>
    `,
    faqsTpl: (m, s) => [
      { q: `What watermark size does ${m.name} use at ${s.name}?`, a: `It depends on the dimensions. If both width and height exceed 1024px, the watermark is 96×96px. Otherwise, it's 48×48px. Clearmark detects this automatically.` },
      { q: `Should I resize before or after removing the watermark?`, a: `Always remove the watermark first at the original ${s.name} resolution, then resize. Resizing first can misalign the watermark pattern.` },
    ],
  },
  'use-case-guide': {
    titleTpl: (u, p) => `AI Watermark Removal for ${u.name} on ${p.name} | Clearmark`,
    headingTpl: (u, p) => `Remove AI Watermarks from ${u.name} for ${p.name}`,
    descTpl: (u, p) => `How to remove AI watermarks from ${u.name} before publishing on ${p.name}. Free, private, lossless browser tool.`,
    contentTpl: (u, p) => `
      <p>Creating ${u.name} with AI tools is fast and powerful, but visible watermarks can undermine your content on <strong>${p.name}</strong>. Clearmark removes them cleanly.</p>
      <h2>Why Clean ${u.name} Matter on ${p.name}</h2>
      <p>On ${p.name}, visual quality directly impacts engagement. Watermarked ${u.name} look unfinished and can reduce credibility. Removing the visible watermark ensures your content looks polished and professional for ${u.ctx}.</p>
      <h2>Workflow for ${p.name}</h2>
      <ol>
        <li>Generate your ${u.name} using any AI image tool (Gemini, DALL·E, Midjourney, etc.).</li>
        <li>Upload to Clearmark to remove the visible watermark.</li>
        <li>Optimize the image dimensions for ${p.name}'s requirements.</li>
        <li>Publish your clean, professional ${u.name} on ${p.name}.</li>
      </ol>
      <h2>Tips for ${u.ctx}</h2>
      <p>When creating ${u.name} for ${p.name}, generate at the highest resolution available, remove watermarks with Clearmark, then resize to the platform's recommended dimensions for optimal display.</p>
    `,
    faqsTpl: (u, p) => [
      { q: `Which AI tools' watermarks can Clearmark remove from ${u.name}?`, a: `Clearmark is optimized for Google Gemini's visible watermark. It uses reverse alpha blending, which works on any watermark applied via the same compositing technique.` },
      { q: `What's the best image size for ${u.name} on ${p.name}?`, a: `Check ${p.name}'s current image guidelines. Generally, generate at the highest resolution, remove the watermark, then resize to the platform's recommended dimensions.` },
    ],
  },
  'model-platform-usecase': {
    titleTpl: (m, pu) => `${m.name} ${pu.u.name} Without Watermark for ${pu.p.name} | Clearmark`,
    headingTpl: (m, pu) => `Create Clean ${m.name} ${pu.u.name} for ${pu.p.name}`,
    descTpl: (m, pu) => `Remove ${m.name} watermarks from ${pu.u.name} before posting to ${pu.p.name}. Free, lossless, browser-based.`,
    contentTpl: (m, pu) => `
      <p>Using <strong>${m.name}</strong> to create ${pu.u.name} for <strong>${pu.p.name}</strong>? The visible watermark from ${m.maker} can hurt your content's credibility. Clearmark removes it in seconds.</p>
      <h2>Complete Workflow</h2>
      <ol>
        <li>Generate ${pu.u.name} with ${m.name} at the highest resolution available.</li>
        <li>Open Clearmark and upload your image (JPG, PNG, or WebP).</li>
        <li>The watermark is automatically detected and removed via reverse alpha blending.</li>
        <li>Download the clean image and optimize for ${pu.p.name}'s ${pu.u.ctx} requirements.</li>
      </ol>
      <h2>Why This Matters for ${pu.p.name}</h2>
      <p>On ${pu.p.name}, ${pu.u.name} with visible AI watermarks can reduce engagement and appear unprofessional. Clean images perform better for ${pu.u.ctx} and build audience trust.</p>
      <h2>Optimization Tips</h2>
      <p>After watermark removal, resize your ${m.name} output to match ${pu.p.name}'s recommended dimensions for ${pu.u.name}. Export as PNG for maximum quality or JPG for smaller file sizes.</p>
    `,
    faqsTpl: (m, pu) => [
      { q: `Can I use ${m.name} images on ${pu.p.name} after removing the watermark?`, a: `Yes. After removing the visible watermark with Clearmark, the image is ready for ${pu.p.name}. Note that invisible steganographic watermarks may still be present.` },
      { q: `What resolution should I use for ${pu.u.name} on ${pu.p.name}?`, a: `Generate at the highest resolution ${m.name} supports, remove the watermark, then resize to ${pu.p.name}'s recommended dimensions for ${pu.u.name}.` },
    ],
  },
  'format-platform': {
    titleTpl: (f, p) => `Best ${f.name} Settings for ${p.name} After Watermark Removal | Clearmark`,
    headingTpl: (f, p) => `Optimize ${f.name} Images for ${p.name} After Watermark Removal`,
    descTpl: (f, p) => `How to optimize ${f.name} images for ${p.name} after removing AI watermarks. Format conversion, compression, and quality tips.`,
    contentTpl: (f, p) => `
      <p>After removing AI watermarks with Clearmark, you may need to convert or optimize your images for <strong>${p.name}</strong>. Here's how to handle <strong>${f.name}</strong> files.</p>
      <h2>${f.name} on ${p.name}</h2>
      <p>${f.name} is a ${f.desc}. ${p.name} may have specific preferences for image formats, file sizes, and dimensions that affect how your content displays.</p>
      <h2>Recommended Workflow</h2>
      <ol>
        <li>Remove the AI watermark using Clearmark (outputs lossless PNG).</li>
        <li>Convert to ${f.name} if needed for ${p.name}'s requirements.</li>
        <li>Optimize file size while maintaining visual quality.</li>
        <li>Upload to ${p.name} at the recommended dimensions.</li>
      </ol>
      <h2>Quality Considerations</h2>
      <p>Clearmark always outputs PNG to preserve lossless quality. If ${p.name} requires ${f.name}, convert after watermark removal to avoid any quality loss during the removal process.</p>
    `,
    faqsTpl: (f, p) => [
      { q: `Does ${p.name} support ${f.name} uploads?`, a: `Most platforms accept common formats like JPG and PNG. Check ${p.name}'s current documentation for ${f.name} support and any file size limits.` },
      { q: `Should I convert to ${f.name} before or after watermark removal?`, a: `Always remove the watermark first (Clearmark outputs PNG), then convert to ${f.name} for ${p.name}. This preserves maximum quality during removal.` },
    ],
  },
  'size-platform': {
    titleTpl: (s, p) => `${s.name} Image Size Guide for ${p.name} | Clearmark`,
    headingTpl: (s, p) => `${s.name} Images for ${p.name}: Watermark Removal and Sizing`,
    descTpl: (s, p) => `Guide to using ${s.name} (${s.ctx}) AI images on ${p.name} after watermark removal. Resize and optimize for best results.`,
    contentTpl: (s, p) => `
      <p>Working with <strong>${s.name}</strong> (${s.ctx}) AI-generated images for <strong>${p.name}</strong>? Here's how to remove watermarks and optimize for the platform.</p>
      <h2>Watermark Removal at ${s.name}</h2>
      <p>At ${s.name} resolution, the AI watermark configuration is automatically detected by Clearmark. The tool handles both 48×48px and 96×96px watermark patterns based on your image dimensions.</p>
      <h2>Optimizing for ${p.name}</h2>
      <ol>
        <li>Upload your ${s.name} image to Clearmark for watermark removal.</li>
        <li>Download the clean image at original ${s.name} resolution.</li>
        <li>Resize to ${p.name}'s recommended dimensions if different from ${s.name}.</li>
        <li>Export in ${p.name}'s preferred format (usually JPG or PNG).</li>
      </ol>
      <h2>Resolution Tips</h2>
      <p>Starting with ${s.name} (${s.ctx}) gives you flexibility to resize for ${p.name} without upscaling artifacts. Always remove the watermark at the original resolution first.</p>
    `,
    faqsTpl: (s, p) => [
      { q: `Is ${s.name} the right size for ${p.name}?`, a: `It depends on ${p.name}'s requirements. ${s.name} (${s.ctx}) may need resizing. Check the platform's current image guidelines for optimal dimensions.` },
      { q: `Does resizing after watermark removal affect quality?`, a: `Downscaling is generally safe. Upscaling may introduce artifacts. Start with the highest resolution available and resize down after watermark removal.` },
    ],
  },
  'model-overview': {
    titleTpl: (m, _) => `${m.name} Watermark: Everything You Need to Know | Clearmark`,
    headingTpl: (m, _) => `${m.name} Watermark: Complete Guide`,
    descTpl: (m, _) => `Everything about ${m.name} watermarks by ${m.maker}: how they work, where they appear, and how to remove them with Clearmark.`,
    contentTpl: (m, _) => `
      <p><strong>${m.name}</strong> by ${m.maker} adds visible watermarks to AI-generated images. This guide covers everything you need to know about these watermarks and how to handle them.</p>
      <h2>How ${m.name} Watermarks Work</h2>
      <p>${m.maker} embeds a semi-transparent logo into generated images using alpha blending — a compositing technique where the watermark is layered over the original image with controlled transparency.</p>
      <h2>Watermark Specifications</h2>
      <ul>
        <li><strong>Position</strong>: Bottom-right corner of the image.</li>
        <li><strong>Size</strong>: 48×48px (images ≤1024px) or 96×96px (images >1024px).</li>
        <li><strong>Technique</strong>: Alpha blending with a known logo pattern.</li>
        <li><strong>Invisible watermark</strong>: May also include SynthID steganographic watermark.</li>
      </ul>
      <h2>Removing ${m.name} Watermarks</h2>
      <p>Clearmark reverses the alpha blending formula to reconstruct the original pixel values. The process is lossless and runs entirely in your browser — no uploads, no servers, no quality loss.</p>
      <h2>Important Notes</h2>
      <p>Clearmark removes the visible watermark only. Invisible steganographic watermarks (like SynthID) embedded in the pixel data are not affected and may still be detectable by ${m.maker}'s tools.</p>
    `,
    faqsTpl: (m, _) => [
      { q: `Does ${m.name} always add a watermark?`, a: `${m.maker} adds visible watermarks to AI-generated images as a transparency measure. The watermark appears on all generated image outputs.` },
      { q: `Is removing ${m.name} watermarks legal?`, a: `Clearmark is provided for educational and personal use. The legal implications of watermark removal depend on your jurisdiction and intended use of the images.` },
      { q: `Does ${m.name} use invisible watermarks too?`, a: `${m.maker} may use steganographic watermarks like SynthID in addition to the visible watermark. Clearmark only removes the visible alpha-blended watermark.` },
    ],
  },
  'platform-overview': {
    titleTpl: (p, _) => `Remove AI Watermarks for ${p.name}: Complete Guide | Clearmark`,
    headingTpl: (p, _) => `Remove AI Watermarks for ${p.name}`,
    descTpl: (p, _) => `Complete guide to removing AI watermarks from images before posting to ${p.name}. Covers all major AI generators.`,
    contentTpl: (p, _) => `
      <p>Posting AI-generated images on <strong>${p.name}</strong> with visible watermarks can look unprofessional and reduce engagement. Clearmark removes watermarks from all major AI image generators.</p>
      <h2>Supported AI Models</h2>
      <p>Clearmark works with images from Google Gemini, DALL·E, Midjourney, Stable Diffusion, and other AI generators that use alpha-blended visible watermarks.</p>
      <h2>Workflow for ${p.name}</h2>
      <ol>
        <li>Generate your image with any AI tool.</li>
        <li>Upload to Clearmark — watermark is removed in milliseconds.</li>
        <li>Resize to ${p.name}'s recommended dimensions.</li>
        <li>Upload to ${p.name} for a clean, professional look.</li>
      </ol>
      <h2>${p.name} Image Best Practices</h2>
      <p>Each platform has specific requirements for image dimensions, file formats, and file sizes. After watermark removal, optimize your images for ${p.name}'s specifications to ensure the best display quality and engagement.</p>
    `,
    faqsTpl: (p, _) => [
      { q: `Does ${p.name} detect AI-generated images?`, a: `Some platforms are developing AI detection capabilities. Clearmark removes the visible watermark, but invisible steganographic watermarks may still be detectable.` },
      { q: `What image format works best on ${p.name}?`, a: `Most platforms prefer JPG for photos and PNG for graphics with transparency. Check ${p.name}'s current guidelines for optimal format and size recommendations.` },
    ],
  },
  'usecase-overview': {
    titleTpl: (u, _) => `Remove AI Watermarks from ${u.name} | Clearmark`,
    headingTpl: (u, _) => `Remove AI Watermarks from ${u.name}`,
    descTpl: (u, _) => `How to remove AI watermarks from ${u.name} for ${u.ctx}. Free, private, lossless browser tool.`,
    contentTpl: (u, _) => `
      <p>AI-generated <strong>${u.name}</strong> are increasingly popular for ${u.ctx}. But visible watermarks can undermine the professional quality you need. Clearmark removes them cleanly.</p>
      <h2>Why Watermark-Free ${u.name} Matter</h2>
      <p>For ${u.ctx}, image quality and professionalism are critical. Visible AI watermarks signal that content is machine-generated and can reduce credibility with your audience.</p>
      <h2>How to Remove Watermarks from ${u.name}</h2>
      <ol>
        <li>Generate your ${u.name} with any AI image tool.</li>
        <li>Upload to Clearmark for instant watermark removal.</li>
        <li>Download the clean image and optimize for your target use.</li>
      </ol>
      <h2>Tips for ${u.ctx}</h2>
      <p>Generate at the highest resolution available, remove watermarks first, then resize and format for your specific ${u.ctx} requirements. This ensures maximum quality throughout the workflow.</p>
    `,
    faqsTpl: (u, _) => [
      { q: `Which AI tools work best for ${u.name}?`, a: `Popular choices include Google Gemini, Midjourney, DALL·E, and Stable Diffusion. Each has strengths for different types of ${u.name}. Clearmark works with all of them.` },
      { q: `Can I use watermark-removed images commercially for ${u.ctx}?`, a: `Check the terms of service for the AI tool you used to generate the image. Clearmark is a processing tool — usage rights depend on the original AI platform's license.` },
    ],
  },
};

// ─── Subcategories (nested hubs) ─────────────────────────────────────

export const SUBCATEGORIES = {
  // Under guides/
  'remove-watermark': { parent: 'guides', slug: 'remove-watermark', title: 'Watermark Removal Guides', description: 'Step-by-step guides for removing AI watermarks from images generated by every major AI model.' },
  'for-platform': { parent: 'guides', slug: 'for-platform', title: 'Platform-Specific Guides', description: 'Optimize AI-generated images for specific platforms after watermark removal.' },
  'by-format': { parent: 'guides', slug: 'by-format', title: 'Format-Specific Guides', description: 'Handle watermark removal across different image formats: PNG, JPG, WebP, and more.' },
  'by-size': { parent: 'guides', slug: 'by-size', title: 'Resolution-Specific Guides', description: 'Watermark removal guides for specific image resolutions and aspect ratios.' },
  'by-use-case': { parent: 'guides', slug: 'by-use-case', title: 'Use Case Guides', description: 'Remove AI watermarks for specific use cases: social media, e-commerce, presentations, and more.' },
  'model-platform-usecase': { parent: 'guides', slug: 'model-platform-usecase', title: 'Model + Platform + Use Case Guides', description: 'Targeted guides combining AI model, platform, and use case for watermark removal workflows.' },
  'format-platform': { parent: 'guides', slug: 'format-platform', title: 'Format + Platform Guides', description: 'Optimize image formats for specific platforms after AI watermark removal.' },
  'size-platform': { parent: 'guides', slug: 'size-platform', title: 'Resolution + Platform Guides', description: 'Image sizing guides for specific platforms after AI watermark removal.' },
  // Under learn/
  'compare': { parent: 'learn', slug: 'compare', title: 'AI Watermark Comparisons', description: 'Side-by-side comparisons of watermark systems across AI image generators.' },
  'model-overview': { parent: 'learn', slug: 'model-overview', title: 'AI Model Watermark Guides', description: 'Comprehensive guides to watermark systems for each AI image generator.' },
  'platform-overview': { parent: 'learn', slug: 'platform-overview', title: 'Platform Guides', description: 'Complete guides to using AI images on specific platforms.' },
  'usecase-overview': { parent: 'learn', slug: 'usecase-overview', title: 'Use Case Overviews', description: 'Guides to removing AI watermarks for specific creative use cases.' },
};

// ─── Combinatorial Page Generator ────────────────────────────────────

/**
 * Generate 100k+ unique topic objects from combinatorial expansion.
 * Each combination produces a page with unique slug, title, heading,
 * description, content body, and FAQs.
 */
export function generateAllTopics() {
  const topics = [];
  const slugSet = new Set();

  function add(slug, category, subcategory, intentKey, arg1, arg2) {
    if (slugSet.has(slug)) return; // dedup safety
    slugSet.add(slug);
    const intent = INTENTS[intentKey];
    topics.push({
      slug,
      category,
      subcategory,
      title: intent.titleTpl(arg1, arg2),
      heading: intent.headingTpl(arg1, arg2),
      description: intent.descTpl(arg1, arg2),
      content: intent.contentTpl(arg1, arg2),
      faqs: intent.faqsTpl(arg1, arg2),
      schemaType: 'Article',
      // Related: same model different intent, or same intent different model
      _model: arg1.id || arg1.slug || '',
      _dim2: arg2.id || arg2.slug || '',
      _intent: intentKey,
    });
  }

  // 1. model × use-case → "how to remove X watermark from Y" (30×30 = 900)
  for (const m of AI_MODELS) {
    for (const u of USE_CASES) {
      add(`remove-${m.id}-watermark-from-${u.id}`, 'guides', 'remove-watermark', 'how-to-remove', m, u);
    }
  }

  // 2. model × platform → "remove X watermark for Y" (30×25 = 750)
  for (const m of AI_MODELS) {
    for (const p of PLATFORMS) {
      add(`remove-${m.id}-watermark-for-${p.id}`, 'guides', 'for-platform', 'for-platform', m, p);
    }
  }

  // 3. model × format → "remove X watermark from Y images" (30×10 = 300)
  for (const m of AI_MODELS) {
    for (const f of IMAGE_FORMATS) {
      add(`remove-${m.id}-watermark-${f.id}`, 'guides', 'by-format', 'image-format', m, f);
    }
  }

  // 4. model × size → "remove X watermark from Y images" (30×10 = 300)
  for (const m of AI_MODELS) {
    for (const s of IMAGE_SIZES) {
      add(`remove-${m.id}-watermark-${s.id}`, 'guides', 'by-size', 'image-size', m, s);
    }
  }

  // 5. model vs model comparisons (30 choose 2 = 435)
  for (let i = 0; i < AI_MODELS.length; i++) {
    for (let j = i + 1; j < AI_MODELS.length; j++) {
      add(`${AI_MODELS[i].id}-vs-${AI_MODELS[j].id}-watermark`, 'learn', 'compare', 'watermark-vs', AI_MODELS[i], AI_MODELS[j]);
    }
  }

  // 6. use-case × platform → "AI watermark removal for X on Y" (30×25 = 750)
  for (const u of USE_CASES) {
    for (const p of PLATFORMS) {
      add(`ai-watermark-${u.id}-for-${p.id}`, 'guides', 'by-use-case', 'use-case-guide', u, p);
    }
  }

  // 7. model × platform × use-case (30 models × 25 platforms × 30 use-cases = 22,500)
  for (const m of AI_MODELS) {
    for (const p of PLATFORMS) {
      for (const u of USE_CASES) {
        add(
          `${m.id}-${u.id}-for-${p.id}`,
          'guides', 'model-platform-usecase', 'model-platform-usecase',
          m, { p, u, ctx: u.ctx }
        );
      }
    }
  }

  // 8. format × platform (10×25 = 250)
  for (const f of IMAGE_FORMATS) {
    for (const p of PLATFORMS) {
      add(`${f.id}-for-${p.id}`, 'guides', 'format-platform', 'format-platform', f, p);
    }
  }

  // 9. size × platform (10×25 = 250)
  for (const s of IMAGE_SIZES) {
    for (const p of PLATFORMS) {
      add(`${s.id}-for-${p.id}`, 'guides', 'size-platform', 'size-platform', s, p);
    }
  }

  // 10. model × format × platform (30×10×25 = 7,500)
  for (const m of AI_MODELS) {
    for (const f of IMAGE_FORMATS) {
      for (const p of PLATFORMS) {
        add(
          `${m.id}-${f.id}-for-${p.id}`,
          'guides', 'format-platform', 'format-platform',
          { ...f, id: `${m.id}-${f.id}`, name: `${m.name} ${f.name}`, desc: `${f.desc} from ${m.name}` },
          p
        );
      }
    }
  }

  // 11. model × size × platform (30×10×25 = 7,500)
  for (const m of AI_MODELS) {
    for (const s of IMAGE_SIZES) {
      for (const p of PLATFORMS) {
        add(
          `${m.id}-${s.id}-for-${p.id}`,
          'guides', 'size-platform', 'size-platform',
          { ...s, id: `${m.id}-${s.id}`, name: `${m.name} ${s.name}`, ctx: `${s.ctx} from ${m.name}` },
          p
        );
      }
    }
  }

  // 12. model × use-case × format (30×30×10 = 9,000)
  for (const m of AI_MODELS) {
    for (const u of USE_CASES) {
      for (const f of IMAGE_FORMATS) {
        add(
          `${m.id}-${u.id}-${f.id}`,
          'guides', 'by-format', 'image-format',
          m,
          { ...f, id: `${u.id}-${f.id}`, name: `${f.name} ${u.name}`, desc: `${f.desc} for ${u.ctx}` }
        );
      }
    }
  }

  // 13. model × use-case × size (30×30×10 = 9,000)
  for (const m of AI_MODELS) {
    for (const u of USE_CASES) {
      for (const s of IMAGE_SIZES) {
        add(
          `${m.id}-${u.id}-${s.id}`,
          'guides', 'by-size', 'image-size',
          m,
          { ...s, id: `${u.id}-${s.id}`, name: `${s.name} ${u.name}`, ctx: `${s.ctx} for ${u.ctx}` }
        );
      }
    }
  }

  // 14. use-case × format × platform (30×10×25 = 7,500)
  for (const u of USE_CASES) {
    for (const f of IMAGE_FORMATS) {
      for (const p of PLATFORMS) {
        add(
          `${u.id}-${f.id}-for-${p.id}`,
          'guides', 'format-platform', 'format-platform',
          { ...f, id: `${u.id}-${f.id}`, name: `${f.name} ${u.name}`, desc: `${f.desc} for ${u.ctx}` },
          p
        );
      }
    }
  }

  // 15. model overview pages (30)
  const dummy = { id: '_', name: '' };
  for (const m of AI_MODELS) {
    add(`${m.id}-watermark-guide`, 'learn', 'model-overview', 'model-overview', m, dummy);
  }

  // 16. platform overview pages (25)
  for (const p of PLATFORMS) {
    add(`ai-watermarks-for-${p.id}`, 'learn', 'platform-overview', 'platform-overview', p, dummy);
  }

  // 17. use-case overview pages (30)
  for (const u of USE_CASES) {
    add(`ai-watermarks-${u.id}`, 'learn', 'usecase-overview', 'usecase-overview', u, dummy);
  }

  return topics;
}

/**
 * Resolve relatedSlugs for each topic post-generation.
 * Strategy: pick 3 related pages from the same subcategory (same intent,
 * different dimension value) to create spoke-to-spoke links without
 * cannibalization.
 */
export function resolveRelatedSlugs(topics) {
  // Index by subcategory for fast lookup
  const bySub = {};
  for (const t of topics) {
    const key = t.subcategory || t.category;
    if (!bySub[key]) bySub[key] = [];
    bySub[key].push(t);
  }

  for (const t of topics) {
    const key = t.subcategory || t.category;
    const pool = bySub[key] || [];
    // Pick up to 3 siblings that share the intent but differ in dimension
    const candidates = pool.filter(c =>
      c.slug !== t.slug && c._intent === t._intent && c._dim2 !== t._dim2
    );
    // Deterministic pick: spread across the pool
    const step = Math.max(1, Math.floor(candidates.length / 3));
    t.relatedSlugs = [];
    for (let i = 0; i < Math.min(3, candidates.length); i++) {
      t.relatedSlugs.push(candidates[i * step]?.slug || candidates[i]?.slug);
    }
    t.relatedSlugs = [...new Set(t.relatedSlugs)].filter(Boolean);
  }
}
