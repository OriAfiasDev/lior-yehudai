import { html } from '../html.mjs';
import { tick, progressLine } from '../partials/motif.mjs';
import { button } from '../partials/cta.mjs';

// The page's identifying detail: the parent's sentence large, the professional term and
// a short note under it. With JS the stage pins and shows one sentence per scroll step
// (main.js adds .is-pinned); without it, or with reduced motion, it is a plain list.
export default {
  type: 'worries',
  required: ['heading', 'items'],
  render: (s, ctx) => html`
<section class="worries" id="${s.id}" aria-labelledby="${s.id}-title" data-worries style="--count:${s.items.length}">
  <div class="worries-track">
    <div class="worries-stage">
      <div class="wrap worries-inner">
        <h2 class="worries-title" id="${s.id}-title">${ctx.t(s.heading)}</h2>
        <ul class="worries-list" role="list">
          ${s.items.map(
            (item) => html`<li class="worry">
              <p class="worry-said">${ctx.t(item.said)}</p>
              <p class="worry-term">${tick()}${ctx.t(item.term)}</p>
              ${item.note ? html`<p class="worry-note">${ctx.t(item.note)}</p>` : ''}
            </li>`,
          )}
        </ul>
        <ol class="worries-index" role="list" aria-label="${ctx.uiPlain('worriesIndexLabel')}">
          ${s.items.map((item, i) => html`<li><button type="button" data-worries-jump="${i}">${ctx.t(item.term)}</button></li>`)}
        </ol>
        <div class="worries-progress" aria-hidden="true">
          <span class="worries-count"><span data-worries-current>1</span> ${ctx.ui('worriesProgress')} ${s.items.length}</span>
          ${progressLine()}
        </div>
      </div>
    </div>
  </div>
  ${s.closing || s.cta
    ? html`<div class="wrap worries-close" data-reveal>
        ${s.closing ? html`<p class="worries-closing">${ctx.t(s.closing)}</p>` : ''}
        ${s.cta ? button(ctx, s.cta, { variant: 'quiet' }) : ''}
      </div>`
    : ''}
</section>`,
};
