import { html } from '../html.mjs';
import { button, phoneLink } from '../partials/cta.mjs';
import { icon } from '../partials/icons.mjs';
import { tick } from '../partials/motif.mjs';
import { isMissing } from '../context.mjs';

const hoursHtml = (ctx, hours) =>
  Array.isArray(hours) ? hours.map((line) => html`<span class="hours-line">${ctx.t(line)}</span>`) : ctx.t(hours);

export default {
  type: 'contact',
  required: ['heading', 'cta'],
  render: (s, ctx) => {
    const b = ctx.business;
    const hasHours = b.hours && (isMissing(b.hours) || b.hours.length);
    return html`
<section class="contact" id="${s.id}" aria-labelledby="${s.id}-title" data-contact>
  <div class="wrap contact-grid">
    <div class="contact-main">
      ${s.label ? html`<p class="label">${tick()}${ctx.t(s.label)}</p>` : ''}
      <h2 class="contact-title" id="${s.id}-title">${ctx.t(s.heading)}</h2>
      ${s.lead ? html`<p class="contact-lead">${ctx.t(s.lead)}</p>` : ''}
      <div class="contact-actions">
        ${button(ctx, s.cta, { variant: 'inverse' })}
        ${s.phoneLine ? html`<p class="phone-line">${ctx.t(s.phoneLine)} ${phoneLink(ctx, { className: 'phone-link phone-link--big' })}</p>` : ''}
      </div>
      <dl class="contact-meta">
        ${hasHours ? html`<div><dt>${icon('clock')}${ctx.ui('hoursLabel')}</dt><dd>${hoursHtml(ctx, b.hours)}</dd></div>` : ''}
        <div>
          <dt>${icon('pin')}${ctx.ui('navigateLabel')}</dt>
          <dd>
            <a href="${ctx.href('waze')}" target="_blank" rel="noopener">${ctx.ui('waze')}</a>
            <a href="${ctx.href('googleMaps')}" target="_blank" rel="noopener">${ctx.ui('googleMaps')}</a>
          </dd>
        </div>
      </dl>
    </div>
    ${s.showMap
      ? html`<div class="map" data-reveal>
          <iframe src="${ctx.href('mapEmbed')}" title="${ctx.uiPlain('mapTitle')}" loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>`
      : ''}
  </div>
</section>`;
  },
};
