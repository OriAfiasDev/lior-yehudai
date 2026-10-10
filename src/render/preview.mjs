// The studio editor's live preview (dist/_afias/preview.html). Runs in the browser: maps the
// studio's document to the shapes in /content (the same mapping as the content API's
// folder-shaped endpoints) and renders it with the build's own templates, plus the
// data-afias-* attributes the editor uses to select sections and edit text in place.

import { html, escape } from './html.mjs';
import { createContext } from './context.mjs';
import { sections } from './sections/index.mjs';
import { header, footer } from './page.mjs';
import { themeCss, googleFontsHref } from './theme.mjs';

const items = (v) => (Array.isArray(v) ? v : Array.isArray(v?.items) ? v.items : []);

// Studio document → { settings, theme, page, collections }, as the build loads it.
export function toSiteData(doc, pageId = 'home') {
  const page = doc.pages?.find((p) => p.id === pageId) ?? doc.pages?.[0] ?? { id: pageId, sections: [] };
  const collections = Object.fromEntries(Object.entries(doc.collections ?? {}).map(([name, list]) => [name, items(list)]));
  return {
    settings: doc.settings ?? {},
    theme: doc.theme ?? {},
    page: {
      id: page.id,
      sections: (page.sections ?? []).map((s) => ({ id: s.id, type: s.type, enabled: s.hidden !== true, ...s.data })),
    },
    collections: { reviews: [], media: [], ...collections },
  };
}

// A draft can be mid-edit (a reference just removed, a required field emptied): show what
// broke in place of that part instead of a blank frame.
const failed = (err) => html`<div class="wrap"><p class="gap">[התצוגה המקדימה נכשלה: ${err.message}]</p></div>`;

const attempt = (fn, fallback = failed) => {
  try {
    return fn();
  } catch (err) {
    return fallback(err);
  }
};

// Each section's root element carries data-afias-section, so the runtime can swap only
// what changed. A section that renders nothing (a gallery with no approved photos) stays out.
const tagSection = (id, markup) => markup.replace(/<([a-z][\w-]*)/i, `<$1 data-afias-section="${escape(id)}"`);

export function renderPreview(doc, pageId) {
  const data = toSiteData(doc, pageId);
  let ctx;
  try {
    ctx = createContext(data, { annotate: true });
  } catch (err) {
    return { html: String(failed(err)) };
  }

  const active = data.page.sections.filter((s) => s.enabled !== false);
  const body = active.map((s) => {
    const markup = attempt(() => {
      if (!sections[s.type]) throw new Error(`סוג סקשן לא מוכר: ${s.type}`);
      return sections[s.type].render(s, ctx);
    });
    return markup ? tagSection(s.id, String(markup)) : '';
  });
  return {
    html: [attempt(() => header(ctx, active.filter((s) => s.nav))), ...body, attempt(() => footer(ctx))].join('\n'),
    css: attempt(() => themeCss(data.theme), () => undefined),
    fontsHref: attempt(() => googleFontsHref(data.theme), () => null) ?? undefined,
  };
}
