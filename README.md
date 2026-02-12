# Comply

A browser-based tool that strips visible watermarks from Gemini AI-generated images. No servers, no uploads, no AI guesswork - just math.

It works by reversing the alpha compositing that Gemini uses to stamp its logo. You give it a watermarked image, it gives you back the original pixels. Lossless.

## Quick start

```bash
pnpm install
pnpm dev        # dev build with watch
pnpm build      # production build
pnpm serve      # preview the build locally
```

## How it works

Gemini composites its watermark like this:

```
watermarked = α × logo + (1 - α) × original
```

We just solve for `original`:

```
original = (watermarked - α × logo) / (1 - α)
```

The alpha map is pre-computed from known watermark captures on solid backgrounds. No guessing involved.

### Watermark detection

| Condition | Size | Offset from bottom-right |
|---|---|---|
| Both dimensions > 1024 | 96×96 | 64px |
| Otherwise | 48×48 | 32px |

## Project layout

```
├── public/          Static HTML
├── src/
│   ├── core/        The actual engine
│   │   ├── alphaMap.js
│   │   ├── blendModes.js
│   │   └── watermarkEngine.js
│   ├── assets/      Pre-captured watermark maps (48 & 96)
│   ├── userscript/  Tampermonkey script for Gemini pages
│   ├── app.js       Frontend entry
│   └── utils.js     Helpers
├── build.js         esbuild config
└── dist/            Build output
```

## Browser support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Needs Canvas API and ES6 modules.

## Limitations

- Only handles the visible Gemini logo watermark (bottom-right corner)
- Does not touch invisible/steganographic watermarks like [SynthID](https://support.google.com/gemini/answer/16722517)
- Tuned for Gemini's current watermark pattern

## Heads up

If you have a canvas fingerprint defender extension enabled, disable it before using this tool - it will mess with the pixel math.

## Disclaimer

For personal and educational use. Removing watermarks may have legal implications depending on your jurisdiction. You're responsible for how you use this.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.

## License

MIT
