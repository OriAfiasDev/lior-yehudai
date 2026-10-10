// node build.mjs [--out dir] [--strict] [--quiet] [--keep]
// Loads content (files or a content API), validates it, renders <out>/index.html (default dist/).
// --strict  fails the build while any [חסר: ...] slot remains (use it before launch).
// --keep    writes over the output folder instead of clearing it first (the dev server uses this).
// SITE_URL  (env) is used as seo.siteUrl when the content does not set one, e.g. the Pages URL in CI.
// STUDIO_URL (env) adds the afias studio editor's live preview, <out>/_afias/preview.html: it
//           renders drafts in the browser with the same templates (src/render) and stylesheet.
//           With SITE_SLUG too, the page gets the studio's visit counter (beacon.js).

import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve } from 'node:path';
import { createSource, loadSiteData } from './src/content/load.mjs';
import { validate } from './src/content/validate.mjs';
import { renderPage } from './src/render/page.mjs';
import { faviconSvg } from './src/render/partials/motif.mjs';
import { html, raw } from './src/render/html.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const args = new Set(argv);
const outArg = argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : 'dist';
const out = resolve(root, outArg);
const strict = args.has('--strict');
const quiet = args.has('--quiet');
const keep = args.has('--keep');

const minifyCss = (css) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n+/g, '\n')
    .trim();

// Not for visitors: noindex, and nothing links to it. <base> makes the site's relative asset
// paths (photos, fonts) resolve from the site root, under a Pages base path too.
const previewPage = (settings, css, studio) => html`<!doctype html>
<html lang="${settings.locale}" dir="${settings.dir}">
<head>
<meta charset="utf-8">
<base href="../">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>תצוגה מקדימה</title>
<style>${raw(css)}</style>
<script type="module" src="_afias/boot.mjs"></script>
</head>
<body>
<div id="af-root" data-studio="${studio}"></div>
</body>
</html>
`;

async function main() {
  const source = createSource(process.env, { contentDir: join(root, 'content') });
  const data = await loadSiteData(source);
  if (!data.settings.seo.siteUrl && process.env.SITE_URL) data.settings.seo.siteUrl = process.env.SITE_URL;
  // A base without a trailing slash makes new URL('assets/x', base) drop the last path
  // segment (Pages passes ".../lior-yehudai"), so normalize it once here.
  if (data.settings.seo.siteUrl) data.settings.seo.siteUrl = data.settings.seo.siteUrl.replace(/\/*$/, '/');

  const errors = validate(data);
  if (errors.length) throw new Error(`Content is invalid:\n  - ${errors.join('\n  - ')}`);

  const studio = process.env.STUDIO_URL?.replace(/\/+$/, '');
  if (studio && !URL.canParse(studio)) throw new Error(`STUDIO_URL is not a URL: ${studio}`);
  const slug = process.env.SITE_SLUG;
  const beacon = studio && slug && { src: `${studio}/kit/v1/beacon.js`, endpoint: `${studio}/api/v1/sites/${encodeURIComponent(slug)}/events` };

  const css = minifyCss(await readFile(join(root, 'src/styles/main.css'), 'utf8'));
  const rendered = renderPage(data, { css, script: 'assets/js/main.js', beacon });
  const pageHtml = rendered.html.replace(/\n\s+/g, '\n'); // template indentation only
  const { gaps } = rendered;
  if (strict && gaps.length) throw new Error(`Missing content, ${gaps.length} slots:\n  - ${gaps.join('\n  - ')}`);

  if (!keep) await rm(out, { recursive: true, force: true });
  await mkdir(join(out, 'assets/js'), { recursive: true });
  await cp(join(root, 'public'), out, { recursive: true });
  await cp(join(root, 'src/scripts/main.js'), join(out, 'assets/js/main.js'));
  await writeFile(join(out, 'index.html'), pageHtml);
  await mkdir(join(out, 'assets/img'), { recursive: true });
  await writeFile(join(out, 'assets/img/favicon.svg'), faviconSvg(data.theme.colors));

  if (studio) {
    await cp(join(root, 'src/render'), join(out, '_afias/render'), { recursive: true });
    await cp(join(root, 'src/preview/boot.mjs'), join(out, '_afias/boot.mjs'));
    await writeFile(join(out, '_afias/preview.html'), previewPage(data.settings, css, studio).toString());
  }

  const warnings = [];
  if (!data.settings.seo.siteUrl) warnings.push('seo.siteUrl is empty: no canonical, og:url or og:image yet');

  console.log(`Built ${relative(root, out)}/index.html from ${source.name} (${(pageHtml.length / 1024).toFixed(1)} KB)`);
  if (studio) console.log(`  studio preview: _afias/preview.html (${studio})`);
  if (beacon) console.log(`  visit counter: ${beacon.endpoint}`);
  if (!quiet) {
    for (const w of warnings) console.log(`  warning: ${w}`);
    if (gaps.length) console.log(`  ${gaps.length} missing content slots:\n    - ${gaps.join('\n    - ')}`);
  } else if (gaps.length) {
    console.log(`  ${gaps.length} missing content slots`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
