import { html } from '../html.mjs';
import { icon } from '../partials/icons.mjs';
import { tick } from '../partials/motif.mjs';

// An answer is a list of parts: text (or a $missing marker) runs together into one
// paragraph; { "list": [...] } becomes a bulleted list.
function answer(ctx, parts) {
  const out = [];
  let run = [];
  const flush = () => {
    if (run.length) out.push(html`<p>${run.map((p, i) => html`${i ? ' ' : ''}${ctx.t(p)}`)}</p>`);
    run = [];
  };
  for (const part of [].concat(parts)) {
    if (part && Array.isArray(part.list)) {
      flush();
      out.push(html`<ul class="qa-list">${part.list.map((li) => html`<li>${ctx.t(li)}</li>`)}</ul>`);
    } else run.push(part);
  }
  flush();
  return out;
}

export default {
  type: 'faq',
  required: ['heading', 'groups'],
  render: (s, ctx) => html`
<section class="faq" id="${s.id}" aria-labelledby="${s.id}-title">
  <div class="wrap faq-grid">
    <div class="faq-head">
      <h2 class="section-title" id="${s.id}-title"${ctx.field('heading', s.heading)}>${ctx.t(s.heading)}</h2>
      ${s.intro ? html`<p class="faq-intro"${ctx.field('intro', s.intro)}>${ctx.t(s.intro)}</p>` : ''}
    </div>
    <div class="faq-groups">
      ${s.groups.map((group, g) => {
        const groupAt = ctx.item('groups', group, g);
        return html`<div class="faq-group" data-reveal>
          <h3 class="label"${ctx.field(`${groupAt}.title`, group.title)}>${tick()}${ctx.t(group.title)}</h3>
          ${group.items.map((item, i) => {
            const at = ctx.item(`${groupAt}.items`, item, i);
            const before = ctx.gaps.length;
            const body = answer(ctx, item.a);
            // While an answer still has a [חסר] slot, show it open so it gets filled. In the
            // studio preview every answer is open, so edits to it show up as they are typed.
            const open = ctx.gaps.length > before || ctx.annotate;
            return html`<details class="qa"${open ? html` open` : ''}>
              <summary class="qa-q"><span${ctx.field(`${at}.q`, item.q)}>${ctx.t(item.q)}</span>${icon('plus', 'icon qa-icon')}</summary>
              <div class="qa-a"${ctx.field(`${at}.a`)}>${body}</div>
            </details>`;
          })}
        </div>`;
      })}
    </div>
  </div>
</section>`,
};
