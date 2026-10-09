import { html } from '../html.mjs';
import { tick } from '../partials/motif.mjs';

export default {
  type: 'reviewHighlights',
  required: ['items'],
  render: (s, ctx) => html`
<section class="voices" id="${s.id}" aria-labelledby="${s.id}-title">
  <div class="wrap">
    <h2 class="label" id="${s.id}-title">${tick()}${ctx.t(s.label)}</h2>
    <ul class="voices-list" role="list">
      ${s.items.map(({ review, use = 'excerpt' }) => {
        const r = ctx.review(review);
        return html`<li class="voice" data-reveal>
          <figure>
            <blockquote class="voice-text">${ctx.paras(r[use] ?? r.text)}</blockquote>
            <figcaption class="voice-cite">${r.author}</figcaption>
          </figure>
        </li>`;
      })}
    </ul>
  </div>
</section>`,
};
