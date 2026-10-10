import { html, attr } from '../html.mjs';

const ready = (item) => Boolean(item.src) && item.consent === true;

const srcset = (item) => item.variants?.map((v) => `${v.src} ${v.width}w`).join(', ');

function img(ctx, item, { sizes, eager = false, cover = false }) {
  const set = srcset(item);
  return html`<img src="${item.src}"${attr('srcset', set)}${attr('sizes', set && sizes)} alt="${ctx.plain(item.alt)}"
    width="${item.width}" height="${item.height}"${attr('style', cover && `object-position:${item.focal ?? '50% 50%'}`)}
    ${eager ? html`fetchpriority="high"` : html`loading="lazy"`} decoding="async">`;
}

// A photo in the arch frame (the doorway into Lior's room). Shows a marked slot until
// the image exists AND publishing it was approved (consent).
export function archFigure(ctx, mediaId, { className = '', eager = false, sizes = '(min-width: 60rem) 24rem, 72vw', caption, path = 'image' } = {}) {
  const item = ctx.media(mediaId);

  if (!ready(item)) {
    return html`<figure class="arch arch--empty ${className}"${ctx.field(path)}>
      <span class="arch-gap">${ctx.gap({ $missing: item.missing ?? `תמונה: ${item.alt}` })}</span>
    </figure>`;
  }

  return html`<figure class="arch ${className}"${ctx.field(path)}>
    ${img(ctx, item, { sizes, eager, cover: true })}
    ${caption ? html`<figcaption>${ctx.t(caption)}</figcaption>` : ''}
  </figure>`;
}

// A plain photo (cropped to its box around the focal point). Unapproved photos are skipped.
export function photo(ctx, mediaId, { sizes = '(min-width: 60rem) 30rem, 80vw' } = {}) {
  const item = ctx.media(mediaId);
  return ready(item) ? img(ctx, item, { sizes, cover: true }) : '';
}
