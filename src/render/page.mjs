import { html, raw } from './html.mjs';
import { createContext } from './context.mjs';
import { sections } from './sections/index.mjs';
import { themeCss, fontPreloads, googleFontsHref } from './theme.mjs';
import { icon } from './partials/icons.mjs';
import { loop } from './partials/motif.mjs';

const absolute = (siteUrl, path) => (siteUrl ? new URL(path, siteUrl).href : null);

// JSON inside <script> must not be able to close the tag.
const jsonForScript = (value) => raw(JSON.stringify(value).replace(/</g, '\\u003c'));

function structuredData(ctx) {
  const { business: b, settings } = ctx;
  const url = settings.seo.siteUrl;
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: `${b.name}, ${b.title}`,
    description: settings.seo.description,
    medicalSpecialty: 'SpeechPathology',
    telephone: b.phone.e164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.address.street,
      addressLocality: b.address.city,
      addressCountry: b.address.country,
    },
    areaServed: b.address.city,
    ...(url && { url, image: absolute(url, settings.seo.ogImage) }),
    ...(Array.isArray(b.hours) && { openingHours: b.hours }),
  };
}

function head(ctx, { css }) {
  const { settings, theme } = ctx;
  const seo = settings.seo;
  const ogImage = absolute(seo.siteUrl, seo.ogImage);
  const fontsHref = googleFontsHref(theme);
  return html`<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ctx.plain(seo.title)}</title>
<meta name="description" content="${ctx.plain(seo.description)}">
<meta name="theme-color" content="${seo.themeColor}">
${seo.siteUrl ? html`<link rel="canonical" href="${seo.siteUrl}">` : ''}
<meta property="og:type" content="website">
<meta property="og:locale" content="he_IL">
<meta property="og:title" content="${ctx.plain(seo.title)}">
<meta property="og:description" content="${ctx.plain(seo.description)}">
${seo.siteUrl ? html`<meta property="og:url" content="${seo.siteUrl}">` : ''}
${ogImage ? html`<meta property="og:image" content="${ogImage}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
${fontPreloads(theme).map((f) => html`<link rel="preload" href="${f.url}" as="font" type="font/${f.format}" crossorigin>`)}
${fontsHref
  ? html`<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontsHref}">`
  : ''}
<script>document.documentElement.classList.add('js');if(CSS.supports('animation-timeline: view()'))document.documentElement.classList.add('sdt')</script>
<style>${raw(themeCss(theme))}
${raw(css)}</style>
<script type="application/ld+json">${jsonForScript(structuredData(ctx))}</script>
</head>`;
}

export function header(ctx, navItems) {
  const b = ctx.business;
  return html`<header class="site-header" data-header>
  <div class="wrap header-inner">
    <a class="brand" href="#${ctx.page.sections[0]?.id ?? 'main'}">
      <span class="brand-name">${b.name}</span><span class="brand-role">${b.title}</span>
    </a>
    ${navItems.length
      ? html`<nav class="nav" aria-label="${ctx.uiPlain('navLabel')}"><ul role="list">
          ${navItems.map((s) => html`<li><a href="#${s.id}">${ctx.t(s.nav)}</a></li>`)}
        </ul></nav>`
      : ''}
    <a class="header-cta" href="${ctx.href('whatsapp')}" target="_blank" rel="noopener" data-cta="whatsapp">
      ${icon('whatsapp')}<span>${ctx.ui('headerCta')}</span>
    </a>
  </div>
</header>`;
}

// Mobile-only contact bar. Appears after the hero's own buttons scroll away.
const dock = (ctx) => html`<div class="dock" data-dock inert>
  <a class="btn btn--primary dock-main" href="${ctx.href('whatsapp')}" target="_blank" rel="noopener" data-cta="whatsapp">
    ${icon('whatsapp')}<span>${ctx.ui('dockCta')}</span></a>
  <a class="dock-phone" href="${ctx.href('phone')}" data-cta="phone">
    ${icon('phone')}<span class="sr-only">${ctx.ui('dockPhone')} ${ctx.business.phone.display}</span></a>
</div>`;

export const footer = (ctx) => html`<footer class="site-footer">
  <div class="wrap footer-inner">
    ${loop()}
    <p>${ctx.ui('footerLine')}</p>
    <p class="footer-year">© ${new Date().getFullYear()}</p>
  </div>
</footer>`;

// `beacon` ({ src, endpoint }) adds the studio's visit counter: page views and clicks on
// [data-cta] links, no cookies or identifiers.
export function renderPage(data, { css, script, beacon }) {
  const ctx = createContext(data);
  const active = data.page.sections.filter((s) => s.enabled !== false);
  const body = active.map((s) => sections[s.type].render(s, ctx));
  const navItems = active.filter((s) => s.nav);

  const doc = html`<!doctype html>
<html lang="${data.settings.locale}" dir="${data.settings.dir}">
${head(ctx, { css })}
<body>
<a class="skip-link" href="#main">${ctx.ui('skipLink')}</a>
${header(ctx, navItems)}
<main id="main">
${body}
</main>
${footer(ctx)}
${dock(ctx)}
<script src="${script}" defer></script>
${beacon ? html`<script src="${beacon.src}" data-endpoint="${beacon.endpoint}" defer></script>` : ''}
</body>
</html>
`;
  return { html: doc.toString(), gaps: [...new Set(ctx.gaps)] };
}
