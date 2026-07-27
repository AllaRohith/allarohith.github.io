# Paper-Cut Asset Generation Prompts

This file contains the exact prompts to generate replacement illustrations for the paper-cut rebrand. The site is currently shipping with placeholder treatments (paper-cut frames around the B&W portrait, pastel gradient backgrounds on work cards) so it reads as paper-cut even without these. Drop in the real illustrations when ready.

---

## Aesthetic spec (apply to every prompt)

Soft, handcrafted paper-cut layered illustration. Stacked paper layers with visible depth, subtle shadows between layers, clean cut edges that resemble laser-cut cardstock. Smooth rounded shapes, simplified cute character proportions, minimal facial details (dot eyes, blush cheeks). A distinct white outer outline layer surrounding each main subject, resembling a thick sticker border or white cut-paper backing, separating subjects from the background — the white layer should feel like an intentional paper layer, not a glow. Pastel color palette: muted blues, greens, lavenders, peaches, warm neutrals. Lighting soft, diffused, even. Textures matte and tactile, like thick art paper or craft foam. Mood: cozy, wholesome, gentle, storybook-like, playful yet polished.

---

## 1. Hero portrait (replace `assets/rohioth.png` + WebP variants)

**Goal:** Yourself as a paper-cut portrait character. Currently shows a B&W photo inside a paper-cut sticker frame — once you have this, the B&W photo goes away.

**Aspect ratio:** 2:3 portrait (600×900 or larger)

**Prompt:**
```
A paper-cut layered portrait of a young South Asian creative developer
(early-20s male, round glasses, friendly smile, short dark hair, light
beard, wearing a casual button-up shirt). Front-facing, hands in pockets,
relaxed pose. Style: soft handcrafted paper-cut diorama, smooth rounded
shapes, simplified cute proportions, dot eyes, small blush cheeks.
Thick white outer outline sticker border around the entire character.
Layered paper depth: head + body as separate layers, soft shadow between
them. Pastel palette: muted blue shirt with peach trim, warm cream
background. Matte texture, soft diffused lighting, storybook mood,
children's book illustration quality, polished handcraft feel.

--ar 2:3 --style raw --s 50
```

**Midjourney tip:** If the face doesn't match, attach a reference photo using `--cref <url>`.

---

## 2. Work card #1 — Logistics Quote Tool (replace `assets/work/logistics-quote.jpg`)

**Goal:** Paper-cut diorama of a logistics dashboard / shipment tracking scene.

**Aspect ratio:** 16:10 landscape

**Prompt:**
```
A paper-cut layered illustration of a small paper-craft logistics
dashboard: stacked rounded paper cards showing shipment route lines,
a tiny paper truck, location pins on a soft paper map, delivery boxes
arranged in rows. Sticker-style white outline around the main scene.
Pastel palette: muted blue backgrounds, coral accent pins, soft cream
cards, peach highlights. Matte paper texture, soft even lighting,
subtle drop shadows between layers, storybook craft aesthetic,
playful yet professional. Children's book illustration quality.

--ar 16:10 --style raw --s 50
```

---

## 3. Work card #2 — Brand Identity System (replace `assets/work/brand-identity.jpg`)

**Goal:** Paper-cut diorama of a brand identity system (logo, color palette, typography).

**Aspect ratio:** 16:10 landscape

**Prompt:**
```
A paper-cut layered illustration of a brand identity system laid out
as a paper-craft mood board: a circular paper logo at center, soft
pastel color swatches arranged like paper stickers, a folded paper
business card, a tiny paper coffee cup as the brand subject, paper
typography samples floating around. White sticker outline around
the whole scene. Pastel palette: warm cream, muted lavender,
peach, sage green, soft blue. Matte paper texture, soft diffused
lighting, layered drop shadows, storybook craft aesthetic,
cohesive indie-brand mood. Children's book illustration quality.

--ar 16:10 --style raw --s 50
```

---

## 4. Work card #3 — Product Configurator (replace `assets/work/product-configurator.jpg`)

**Goal:** Paper-cut diorama of a 3D product configurator scene (shoe, chair, or product on a turntable).

**Aspect ratio:** 16:10 landscape

**Prompt:**
```
A paper-cut layered illustration of a tiny paper-craft 3D product
configurator: a simple product (a sneaker or chair) on a small
turntable, surrounded by paper color swatches as floating options,
soft shadow underneath. Sticker-style white outline around the
product and key swatches. Pastel palette: muted blue product,
coral + yellow + sage green swatches, warm cream background. Matte
paper texture, soft even lighting, layered paper depth, storybook
craft aesthetic, playful yet polished, kids' book quality.

--ar 16:10 --style raw --s 50
```

---

## 5. Work card #4 — Indie Marketing Site (replace `assets/work/indie-marketing.jpg`)

**Goal:** Paper-cut diorama of a music label / indie brand site landing page.

**Aspect ratio:** 16:10 landscape

**Prompt:**
```
A paper-cut layered illustration of a tiny paper-craft indie music
label landing page: a paper browser window containing a paper album
cover, a floating paper play button, soft paper wave bars suggesting
audio, scattered paper stars around. Sticker-style white outline
around the browser window and key elements. Pastel palette: muted
lavender + peach + cream, soft accent colors. Matte paper texture,
soft diffused lighting, layered drop shadows, storybook craft
aesthetic, modern indie-creator mood. Children's book illustration
quality.

--ar 16:10 --style raw --s 50
```

---

## 6. About section illustration (optional decorative)

If you want a small decorative paper-cut illustration next to the "1+ Year" floating badge:

```
A tiny paper-cut layered illustration of a small paper laptop with
floating paper stars, a tiny paper coffee cup, and a paper-craft
lightbulb. White sticker outline around the cluster. Pastel palette:
muted blue, peach, cream, sage. Matte paper texture, soft even
lighting, storybook craft aesthetic. Square aspect, simple,
iconic, decorative.

--ar 1:1 --style raw --s 50
```

---

## Where to put the files

| Asset | Replace at | Notes |
|---|---|---|
| Hero portrait | `assets/rohioth.png` + `assets/rohioth.webp` + sm variants | Existing WebP srcset in `<picture>` will pick up automatically |
| Work #1 | `assets/work/logistics-quote.jpg` | Currently displays inline gradient fallback |
| Work #2 | `assets/work/brand-identity.jpg` | Same |
| Work #3 | `assets/work/product-configurator.jpg` | Same |
| Work #4 | `assets/work/indie-marketing.jpg` | Same |
| About illustration | Drop in `assets/about-illustration.png` (add element as needed) | Optional |

## After dropping in

1. Re-optimize WebP variants: `cwebp -q 80 input.png -o output.webp`
2. Update the `<img>` src attributes if filenames change
3. Re-verify the paper-cut sticker outline thickness in `styles.css`:
   - `--paper-shadow-sticker` controls the white ring
   - `.hero-image` has `padding: 8px` for the white frame
   - If your illustration has its own background, you may need to remove the cream `background: var(--paper)` on `.hero-image`

---

## Re-generate checklist (if first attempt is off)

- **Face doesn't match:** attach reference photo with `--cref`
- **Too busy / cluttered:** drop the `--s 50` style value to `--s 30` for simpler output
- **Background too uniform:** add `--no plain background, monochrome` to force detail
- **Style not paper-cut enough:** try adding "die-cut sticker" or "papercraft shadowbox" to the prompt
- **Color off:** paste the hex palette (`#FAF5EC, #F2A89B, #B8D8E8, #C5D9B0, #D4C5E2, #F5D5BD`) into the prompt explicitly
