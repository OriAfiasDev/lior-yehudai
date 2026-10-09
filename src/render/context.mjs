// Everything a section template needs, built once per render: resolved references,
// text helpers that understand content markers, link builders and the gap report.
//
// Content markers:
//   { "$missing": "what is missing" }  -> rendered as a visible [חסר: ...] slot and reported
//   *words*                            -> words underlined with the hand-drawn line motif
//   {{token}}                          -> replaced from business settings

import { html, raw, escape } from './html.mjs';
import { underline } from './partials/motif.mjs';

export const isMissing = (v) => v != null && typeof v === 'object' && '$missing' in v;
export const isEmpty = (v) => v == null || v === '' || (Array.isArray(v) && v.length === 0);

export function createContext({ settings, theme, page, collections }) {
  const gaps = [];
  const b = settings.business;

  const tokens = {
    name: b.name,
    title: b.title,
    phone: b.phone.display,
    address: `${b.address.street}, ${b.address.city}`,
    rating: Number(b.google.rating).toFixed(1),
    reviewCount: String(b.google.reviewCount),
  };
  const fill = (s) => s.replace(/\{\{(\w+)\}\}/g, (m, key) => tokens[key] ?? m);

  const gap = (value) => {
    gaps.push(value.$missing);
    return html`<span class="gap" data-gap>[חסר: ${value.$missing}]</span>`;
  };

  // Inline text: tokens, escaping, *line* marks.
  const t = (value) => {
    if (isMissing(value)) return gap(value);
    if (isEmpty(value)) return '';
    const safe = escape(fill(String(value)));
    // Each word gets its own stroke so the phrase can wrap on narrow screens; the
    // strokes touch across spaces and draw one after another (--i).
    return raw(
      safe.replace(/\*([^*]+)\*/g, (m, phrase) =>
        phrase
          .trim()
          .split(/\s+/)
          .map((word, i) => `<span class="lined" style="--i:${i}">${word}${underline(i)}</span>`)
          .join(' '),
      ),
    );
  };

  // Plain string for attributes. Missing values are reported and become ''.
  const plain = (value) => {
    if (isMissing(value)) {
      gaps.push(value.$missing);
      return '';
    }
    return isEmpty(value) ? '' : fill(String(value)).replace(/\*/g, '');
  };

  // Multi-paragraph text: an array, or a string with blank lines between paragraphs.
  const paras = (value, className) => {
    const list = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/\n\s*\n/) : [value];
    return list.map((p) => html`<p${className ? raw(` class="${className}"`) : ''}>${t(p)}</p>`);
  };

  const ui = (key) => t(settings.ui?.[key] ?? '');
  const uiPlain = (key) => plain(settings.ui?.[key] ?? '');

  const index = (list, kind) => {
    const map = new Map(list.map((item) => [item.id, item]));
    return (id) => {
      if (!map.has(id)) throw new Error(`Unknown ${kind} "${id}" referenced in page "${page.id}"`);
      return map.get(id);
    };
  };

  const waText = encodeURIComponent(b.whatsapp.message ?? '');
  const mapsQuery = encodeURIComponent(tokens.address);
  const links = {
    whatsapp: `https://wa.me/${b.whatsapp.number}${waText ? `?text=${waText}` : ''}`,
    phone: `tel:${b.phone.e164}`,
    googleReviews:
      b.google.profileUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.google.profileQuery)}`,
    googleMaps: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
    mapEmbed: `https://maps.google.com/maps?q=${mapsQuery}&z=16&hl=${settings.locale === 'he' ? 'iw' : settings.locale}&output=embed`,
    waze: `https://waze.com/ul?q=${mapsQuery}&navigate=yes`,
  };
  const href = (action) => {
    if (!links[action]) throw new Error(`Unknown link action "${action}"`);
    return links[action];
  };

  return {
    settings,
    theme,
    page,
    business: b,
    tokens,
    links,
    gaps,
    t,
    plain,
    paras,
    ui,
    uiPlain,
    gap,
    href,
    media: index(collections.media, 'media'),
    review: index(collections.reviews, 'review'),
  };
}
