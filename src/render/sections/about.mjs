import { html } from '../html.mjs';
import { archFigure } from '../partials/media.mjs';
import { tick } from '../partials/motif.mjs';

// Short on purpose: it sits right after the hero. On phones the portrait stands
// beside the name; on wide screens it takes its own column.
export default {
  type: 'about',
  required: ['heading', 'name'],
  render: (s, ctx) => html`
<section class="about" id="${s.id}" aria-labelledby="${s.id}-title">
  <div class="wrap about-grid">
    ${s.image ? archFigure(ctx, s.image, { className: 'about-figure', sizes: '(min-width: 60rem) 24rem, 8rem' }) : ''}
    <div class="about-head">
      <h2 class="label" id="${s.id}-title">${tick()}${ctx.t(s.heading)}</h2>
      <p class="about-name">${ctx.t(s.name)}</p>
      ${s.role ? html`<p class="about-role">${ctx.t(s.role)}</p>` : ''}
    </div>
    <div class="about-body" data-reveal>${ctx.paras(s.body ?? [])}</div>
    ${s.footnote ? html`<p class="about-note">${ctx.t(s.footnote)}</p>` : ''}
  </div>
</section>`,
};
