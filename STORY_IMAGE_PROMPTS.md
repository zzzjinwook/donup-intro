# DonUp story illustrations

Two decorative objects for the scroll story (`.story-orbit`) and the flow scene. Generate each one separately with the built-in image tool. If the category family in `IMAGE_PROMPTS.md` is used as a reference image (for example `food.png`), use it **only** for material, grain, lighting, and palette — never for its subject.

These are decoration, not product UI. Real app screenshots stay separate simulator captures and are never generated. Use the structure of the reference site's layout as inspiration only; do not recreate any other brand's signature objects, characters, colors, or 3D style.

## Shared style (identical in both prompts)

Premium matte ivory-paper and unglazed-ceramic editorial object, subtle paper grain, very restrained dimensional shading (gentle upper-left light, soft contact-free falloff), clean rounded edges that are not swollen. Calm muted DonUp palette: dusty rose pink #E98AA3 as the main accent with a little deeper coral #F2557F, warm ivory #FFF6EA, soft sage mint #A8D8BC, tiny charcoal #2B2B2B details only. One object, centered, occupying about 60% of a square canvas, generous empty margin on every side. Genuine transparent background (alpha). No text, letters, numbers, logos, watermark, fake app UI, screens, icons, or charts with labels. No glossy plastic, chrome, glass, inflated bevel, neon glow, dramatic cast shadow, black halo, floor, base plate, tile, badge, or background gradient.

## A — record-card sculpture

Use case: decorative illustration for the "everyday recording" story section.

Prompt:

Create ONE standalone decorative sculpture for DonUp, a calm Korean personal-finance app website. Premium matte ivory-paper and unglazed-ceramic editorial object, subtle paper grain, very restrained dimensional shading with gentle upper-left light, clean rounded edges that are not swollen. Palette: dusty rose pink #E98AA3 as the main accent with a little deeper coral #F2557F, warm ivory #FFF6EA, soft sage mint #A8D8BC, tiny charcoal #2B2B2B details only. Subject: three thin ivory paper record-card fragments loosely fanned and slightly offset in space like a quiet sculpture, each card with a few blank rounded line grooves (no writing), and one slim dusty-pink ribbon bookmark tucked between the cards with its tail softly curling out. Three-quarter view, balanced and airy, feels like neatly kept notes rather than paperwork. One object group centered, about 60% of a square canvas, generous empty margin. Genuine transparent background. No text, letters, numbers, logos, watermark, fake UI, receipts with print, pens or hands. No glossy plastic, glass, inflated bevel, neon glow, dramatic shadow, black halo, floor, base plate, tile, badge or background gradient.

## B — flow ribbon and three pillars

Use case: decorative illustration for the "spending flow / insights" story section.

Prompt:

Create ONE standalone decorative sculpture for DonUp, a calm Korean personal-finance app website. Premium matte ivory-paper and unglazed-ceramic editorial object, subtle paper grain, very restrained dimensional shading with gentle upper-left light, clean rounded edges that are not swollen. Palette: dusty rose pink #E98AA3 as the main accent with a little deeper coral #F2557F, warm ivory #FFF6EA, soft sage mint #A8D8BC, tiny charcoal #2B2B2B details only. Subject: one soft organic paper ribbon in dusty pink that flows in a gentle S-curve from the upper left and settles across the tops of three short rounded ceramic pillars of different heights (ivory, sage mint, and pale pink), suggesting money flowing into tidy groups. Pillars are smooth unmarked cylinders with softly rounded tops, no ticks, numbers or axes. Three-quarter view, calm and balanced, sculptural rather than infographic. One object group centered, about 60% of a square canvas, generous empty margin. Genuine transparent background. No text, letters, numbers, logos, watermark, fake UI, chart labels, coins or currency symbols. No glossy plastic, glass, inflated bevel, neon glow, dramatic shadow, black halo, floor, base plate, tile, badge or background gradient.

## Delivery notes

- Export as transparent WebP (alpha preserved), at least 1200×1200 px. Optimize separately; the CSS scales them down.
- If a result shows a halo or a white matte on the edges, regenerate rather than cleaning it up by hand.
- In the page these images are purely decorative (`alt=""`, `aria-hidden`). Record the generated file path and the exact prompt here after generation, as `IMAGE_PROMPTS.md` does.

## Generated assets (Codex integration, 2026-10-30)

Built-in `image_gen` mode was used for two separate calls with `transparent_background: true`; no CLI/API key was used. The prompts above were normalized with `Use case: stylized-concept` and an asset-type label, preserving their requested subjects, palette and exclusions.

- record-cards: original `/Users/hjw/.codex/generated_images/01a1803a-a89a-78d2-b01f-5ecd5f0cc846/exec-7f31ce5c-21b0-42e8-8406-7d4164634c90.png`; workspace `assets/illustrations/story-record-cards-v1.png` and `assets/illustrations/story-record-cards-v1.webp`. Actual image is 1254×1254 with alpha, WebP 109,770 bytes, quality90/method6/alpha100. The original PNG remains unchanged.
- insight-ribbon: original `/Users/hjw/.codex/generated_images/01a1803a-a89a-78d2-b01f-5ecd5f0cc846/exec-5db12902-965c-4f5b-8a3f-3fbccb83f9e0.png`; workspace `assets/illustrations/story-insight-ribbon-v1.png` and `assets/illustrations/story-insight-ribbon-v1.webp`. Actual image is 1254×1254 with alpha, WebP 87,036 bytes, quality90/method6/alpha100. The original PNG remains unchanged.

These assets are decoration only. The actual iPhone app screens remain the existing verified simulator captures. The public build includes only the WebP versions; this file, original PNGs and provenance JSON are excluded by the existing whitelist.
