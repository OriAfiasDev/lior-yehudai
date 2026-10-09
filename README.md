# ליאור יהודאי כהן, קלינאית תקשורת

A one-page site built from the PRD (Oct 8, 2026). Plain HTML/CSS/JS output, rendered at build time
from content data. Rendering has zero npm dependencies (Node 20+); only the production minifier
uses two dev dependencies.

```bash
npm run dev     # http://localhost:4600, rebuilds and reloads on every change
npm run render  # content → dist/, unminified (what the dev server serves)
npm run check   # fails while any [חסר: ...] slot is still open (run before launch)
npm run build   # production: render → .render/, then minify + self-host Google Fonts → dist/
```

Pushing to `main` deploys to GitHub Pages (`.github/workflows/deploy.yml`). In CI, `SITE_URL` is
the Pages URL and becomes the canonical / og:url / og:image base unless `seo.siteUrl` is set.

## How it is put together

```
content/                 ← everything editable. Today: JSON files. Later: the database.
  settings.json          business details, contact, Google rating, SEO, UI strings
  theme.json             colors, fonts, type scale, spacing, motion (styling decisions as data)
  pages/home.json        the page as an ordered list of typed sections
  collections/reviews.json
  collections/media.json
src/
  content/
    load.mjs             picks the content source and loads one page + collections
    sources/file.mjs     reads /content
    sources/http.mjs     reads the same shapes from a content API
    validate.mjs         rejects broken content before it reaches the page
  render/
    html.mjs             tagged template with auto-escaping
    context.mjs          text helpers, link builders, reference lookup, gap report
    theme.mjs            theme.json → CSS custom properties + @font-face
    page.mjs             document shell: head/SEO/JSON-LD, header, footer, mobile dock
    sections/*.mjs       one template per section type, plus the registry (index.mjs)
    partials/            arch photo frame, buttons, icons, the line motif
  styles/main.css        hand-written; reads only var(--token), never a brand value
  scripts/main.js        progressive enhancement only
public/assets/           fonts and static images, copied to dist/
```

### Ready for a CMS later

The site never reads copy, images or brand values from templates. To move content into a
database managed by a separate system:

1. **Expose the content** with the same shapes as the files in `content/` (or adapt the shapes in
   `src/content/sources/http.mjs`, the only place that knows about the remote format).
2. **Build from it:** `CONTENT_SOURCE=http CONTENT_URL=https://… CONTENT_TOKEN=… npm run build`.
   Trigger that from a CMS publish webhook (Netlify/Vercel/GitHub Actions build hooks all work).
3. **Or render on request:** templates are pure functions with no Node APIs, so `renderPage()` can
   run in an edge/serverless function, or in the browser for a live preview inside the CMS.

What the CMS gets to control:

| Data | Where | Notes |
|---|---|---|
| Section order, visibility, nav labels | `pages/home.json` → `sections[]` | `enabled: false` hides a section |
| All copy | section fields, `settings.ui` | `*words*` = hand-drawn underline; `{{reviewCount}}`, `{{rating}}`, `{{address}}`, `{{phone}}`, `{{name}}`, `{{title}}` are filled from settings |
| Reviews | `collections/reviews.json` | Sections reference reviews by `id` |
| Photos | `collections/media.json` | Shown only when `src` is set **and** `consent: true` |
| Colors, fonts, type scale, spacing, motion | `theme.json` | Becomes `--paper`, `--font-display`, `--step-3`… |
| Business info, SEO | `settings.json` | Drives links (WhatsApp, tel, maps, Waze) and JSON-LD |

A new kind of block = one file in `src/render/sections/` + one line in `sections/index.mjs`.
Each section declares its `required` fields, which `validate.mjs` enforces.

**Missing content** is written as `{ "$missing": "what is missing" }`. It renders as a visible
`[חסר: …]` slot, is listed at the end of every build, and blocks `build:strict`. A CMS can map
empty required fields to this marker for draft previews.

**Tracking:** every WhatsApp/phone link carries `data-cta`. Clicks are pushed to
`window.dataLayer` (if present) and dispatched as a `contact:click` event, so an analytics tool
can measure the PRD's success metric (number of inquiries) without touching markup.

## Font

Display: **Sigalit** (AlefAlefAlef), chosen from the supplied archive. Body: **Assistant**
(Google Fonts).

Sigalit's free license allows **one domain, up to 10,000 page views a month**, requires
**registering the license on alefalefalef.co.il**, and does not allow modifying (so it is not
subset) or redistributing the font files. That last point is why the files are **not in this
repo**: they are git-ignored, and CI writes them from two repository secrets,
`SIGALIT_WOFF2_B64` and `SIGALIT_WOFF_B64` (base64 of the woff2/woff files). For local work, put
the files in `public/assets/fonts/`. Register before launch; past the traffic limit, buy a
commercial license.

## Open before launch

From the PRD's open questions, each shown as a `[חסר: …]` slot on the page:

1. Experience and training, for "עליי"
2. What the first step really looks like (verify the 3 steps)
3. Age range (FAQ)
4. Waiting list? (may change the button wording)
5. Assessment or referral needed? (FAQ)
6. Which insurers refund, and how (FAQ)
7. Opening hours (contact)
8. Only if headline 3 is chosen: is "the kindergarten teacher said" really the common trigger

Photos: the 8 owner photos from the Google profile are in `public/assets/img/photos/` (WebP, 3
sizes each, EXIF removed). Publishing approval from Lior and the parents is recorded per photo in
`media.json` (`consentNote`).

Also: `seo.siteUrl` once there is a domain (enables canonical, og:url, og:image), and
`google.profileUrl` with the direct link to the Google profile.

Reviews: the 12 reviews the PRD selects are in `reviews.json`, word for word, approved by their
writers and by Lior. Cuts are marked (...); Tzipora's exclamation marks were removed per the PRD.
