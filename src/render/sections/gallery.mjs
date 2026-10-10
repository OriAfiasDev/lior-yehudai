import { html } from '../html.mjs';
import { photo } from '../partials/media.mjs';
import { tick } from '../partials/motif.mjs';

// The room: an uneven photo grid. Photos without approval are skipped; with none left,
// the section renders nothing.
export default {
  type: 'gallery',
  required: ['items'],
  render: (s, ctx) => {
    // The first two photos share the wide top row; the rest sit three to a row.
    const photos = s.items
      .map((id, i) => photo(ctx, id, { sizes: i < 2 ? '(min-width: 48rem) 44rem, 100vw' : '(min-width: 48rem) 26rem, 50vw' }))
      .filter(Boolean);
    if (!photos.length) return '';
    return html`
<section class="gallery" id="${s.id}" aria-labelledby="${s.id}-title">
  <div class="wrap">
    <h2 class="label" id="${s.id}-title"${ctx.field('label', s.label)}>${tick()}${ctx.t(s.label)}</h2>
    <ul class="room-grid" role="list"${ctx.field('items')}>
      ${photos.map((img) => html`<li class="room-item">${img}</li>`)}
    </ul>
  </div>
</section>`;
  },
};
