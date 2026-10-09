import { html } from '../html.mjs';
import { icon, stars } from '../partials/icons.mjs';

export default {
  type: 'reviewList',
  required: ['heading', 'items'],
  render: (s, ctx) => html`
<section class="reviews" id="${s.id}" aria-labelledby="${s.id}-title">
  <div class="wrap reviews-head">
    <h2 class="section-title" id="${s.id}-title">${ctx.t(s.heading)}</h2>
    ${s.moreLabel
      ? html`<a class="text-link" href="${ctx.href('googleReviews')}" target="_blank" rel="noopener">
          <span>${ctx.t(s.moreLabel)}</span>${icon('arrow')}<span class="sr-only">${ctx.ui('opensInNewTab')}</span></a>`
      : ''}
  </div>
  <div class="wrap reviews-wrap">
    <ul class="reviews-rail" role="list" tabindex="0" aria-label="${ctx.uiPlain('reviewsRailLabel')}">
      ${s.items.map((id) => {
        const r = ctx.review(id);
        return html`<li class="review">
          <figure>
            ${r.topic ? html`<p class="review-topic">${ctx.t(r.topic)}</p>` : ''}
            <blockquote class="review-text">${ctx.paras(r.text ?? r.excerpt)}</blockquote>
            <figcaption class="review-cite">${stars(r.rating)}<span>${r.author}</span></figcaption>
          </figure>
        </li>`;
      })}
    </ul>
  </div>
</section>`,
};
