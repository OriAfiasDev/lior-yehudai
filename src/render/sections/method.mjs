import { html } from '../html.mjs';
import { archFigure } from '../partials/media.mjs';

export default {
  type: 'method',
  required: ['heading', 'points'],
  render: (s, ctx) => html`
<section class="method" id="${s.id}" aria-labelledby="${s.id}-title">
  <div class="wrap method-grid">
    <div class="method-aside">
      <h2 class="section-title" id="${s.id}-title"${ctx.field('heading', s.heading)}>${ctx.t(s.heading)}</h2>
      ${s.image ? archFigure(ctx, s.image, { className: 'method-figure', sizes: '(min-width: 60rem) 15rem, 58vw' }) : ''}
    </div>
    <div class="method-points">
      ${s.points.map((p, i) => {
        const at = ctx.item('points', p, i);
        return html`<div class="point" data-reveal>
          <h3 class="point-lead"${ctx.field(`${at}.lead`, p.lead)}>${ctx.t(p.lead)}</h3>
          ${ctx.paras(p.body, 'point-body', `${at}.body`)}
        </div>`;
      })}
      ${s.formats ? html`<p class="formats" data-reveal${ctx.field('formats', s.formats)}>${ctx.t(s.formats)}</p>` : ''}
    </div>
  </div>
</section>`,
};
