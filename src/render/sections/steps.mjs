import { html } from '../html.mjs';
import { stepsLine } from '../partials/motif.mjs';

export default {
  type: 'steps',
  required: ['heading', 'items'],
  render: (s, ctx) => html`
<section class="steps" id="${s.id}" aria-labelledby="${s.id}-title">
  <div class="wrap">
    <div class="steps-head">
      <h2 class="section-title" id="${s.id}-title"${ctx.field('heading', s.heading)}>${ctx.t(s.heading)}</h2>
      ${s.lead ? html`<p class="steps-lead"${ctx.field('lead', s.lead)}>${ctx.t(s.lead)}</p>` : ''}
    </div>
    <div class="steps-track">
      ${stepsLine()}
      <ol class="steps-list" role="list">
        ${s.items.map((item, i) => {
          const at = ctx.item('items', item, i);
          return html`<li class="step" data-reveal>
            <span class="step-num" aria-hidden="true">${i + 1}</span>
            <span class="step-title"${ctx.field(`${at}.title`, item.title)}>${ctx.t(item.title)}</span>
            ${item.body ? html`<span class="step-body"${ctx.field(`${at}.body`, item.body)}>${ctx.t(item.body)}</span>` : ''}
          </li>`;
        })}
      </ol>
    </div>
  </div>
</section>`,
};
