import { html } from '../html.mjs';
import { icon } from './icons.mjs';

const ICONS = { whatsapp: 'whatsapp', phone: 'phone' };

const external = (action) => action === 'whatsapp';

// The main action button. `action` maps to a link built from business settings.
// `path` is where the button lives in the section's data (for the studio preview).
export function button(ctx, cta, { variant = 'primary', className = '', path = 'cta' } = {}) {
  return html`<a class="btn btn--${variant} ${className}" href="${ctx.href(cta.action)}"
    ${external(cta.action) ? html`target="_blank" rel="noopener"` : ''} data-cta="${cta.action}">
    ${ICONS[cta.action] ? icon(ICONS[cta.action]) : ''}<span${ctx.field(`${path}.label`, cta.label)}>${ctx.t(cta.label)}</span>
  </a>`;
}

export function phoneLink(ctx, { className = 'phone-link' } = {}) {
  return html`<a class="${className}" href="${ctx.href('phone')}" data-cta="phone"><bdi dir="ltr">${ctx.business.phone.display}</bdi></a>`;
}
