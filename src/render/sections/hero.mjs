import { html } from '../html.mjs';
import { button, phoneLink } from '../partials/cta.mjs';
import { archFigure } from '../partials/media.mjs';
import { stars } from '../partials/icons.mjs';

export default {
  type: 'hero',
  required: ['headline', 'subheadline', 'cta'],
  render: (s, ctx) => html`
<section class="hero" id="${s.id}" aria-labelledby="${s.id}-title" data-hero>
  <div class="wrap hero-grid">
    <div class="hero-text">
      <h1 class="hero-title" id="${s.id}-title">${ctx.t(s.headline)}</h1>
      <p class="hero-sub">${ctx.t(s.subheadline)}</p>
      <div class="hero-actions" data-hero-actions>
        ${button(ctx, s.cta)}
        ${s.phoneLine ? html`<p class="phone-line">${ctx.t(s.phoneLine)} ${phoneLink(ctx)}</p>` : ''}
      </div>
      ${s.trust
        ? html`<a class="trust" href="${ctx.href('googleReviews')}" target="_blank" rel="noopener">
            ${stars()}<span>${ctx.t(s.trust)}</span><span class="sr-only">${ctx.ui('opensInNewTab')}</span></a>`
        : ''}
    </div>
    ${s.image ? archFigure(ctx, s.image, { className: 'hero-figure', eager: true }) : ''}
  </div>
</section>`,
};
