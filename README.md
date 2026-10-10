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

**The live site's content comes from afias studio**, not from `content/` (see below). Locally the
commands above still read `content/`; to build what is published in the studio:

```bash
CONTENT_SOURCE=http CONTENT_URL=$STUDIO_URL/api/v1/sites/lior-yehudai npm run build
```

## How it is put together

```
afias/blueprint.json     ← what the client can edit in the studio (sections, fields, collections)
content/                 ← the content as it was when the studio was connected (local dev, fallback)
  settings.json          business details, contact, Google rating, SEO, UI strings
  theme.json             colors, fonts, type scale, spacing, motion (styling decisions as data)
  pages/home.json        the page as an ordered list of typed sections
  collections/reviews.json
  collections/media.json
src/
  content/
    load.mjs             picks the content source and loads one page + collections
    sources/file.mjs     reads /content
    sources/http.mjs     reads the same shapes from a content API (the studio), with retries
    validate.mjs         rejects broken content before it reaches the page
  render/
    html.mjs             tagged template with auto-escaping
    context.mjs          text helpers, link builders, reference lookup, gap report
    theme.mjs            theme.json → CSS custom properties + @font-face
    page.mjs             document shell: head/SEO/JSON-LD, header, footer, mobile dock
    sections/*.mjs       one template per section type, plus the registry (index.mjs)
    partials/            arch photo frame, buttons, icons, the line motif
    preview.mjs          the studio editor's live preview: same templates, run in the browser
  preview/boot.mjs       browser entry of /_afias/preview.html
  styles/main.css        hand-written; reads only var(--token), never a brand value
  scripts/main.js        progressive enhancement only
public/assets/           fonts and static images, copied to dist/
```

### Edited in afias studio

Lior edits the site in the studio (project `lior-yehudai`) and presses "פרסום". The studio sends
a `repository_dispatch` (`afias-publish`); the Pages workflow builds plain static HTML from the
published content and reports building → ready/failed back to the studio. Pushes to `main` build
from the studio too, so a code change never brings back old copy from `content/`.

- **Build:** `CONTENT_SOURCE=http`, `CONTENT_URL=$STUDIO_URL/api/v1/sites/$SITE_SLUG`. The studio
  serves the same shapes as `content/` (settings, theme, pages/home, collections/*). If it can't be
  reached (3 retries), the build fails and the live site stays as it was.
- **Repo settings:** variables `STUDIO_URL` and `SITE_SLUG`, secret `AFIAS_DEPLOY_TOKEN` (from the
  studio's connect step). When the studio moves, change `STUDIO_URL` and re-run the workflow.
- **What is editable:** `afias/blueprint.json`. Keys it doesn't expose are kept as they are on every
  save. Left in code on purpose: `locale`/`dir`, `business.clinic`/`audience` (not on the page),
  `address.country` and `seo.ogImage` (JSON-LD and a file path), and the theme beyond colors and
  corner radius (fonts are licensed and self-hosted, type scale and spacing are the design system).
- **Live preview:** with `STUDIO_URL` set, the build adds `/_afias/preview.html` (noindex, linked
  from nowhere): it renders the editor's draft with the same templates and stylesheet, plus
  `data-afias-*` attributes for selecting and editing in place. Those attributes exist only there
  (`createContext(data, { annotate: true })`); the production HTML doesn't change.
  The studio's preview URL is `https://oriafiasdev.github.io/lior-yehudai/_afias/preview.html`
  (the afias.dev domain forwards without the path).
- Sections added in the studio get ids like `reviewList_k3x9a2b`, which the validator accepts.

What the studio gets to control:

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
