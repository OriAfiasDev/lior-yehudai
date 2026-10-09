// Tiny tagged-template HTML builder. Every interpolated value is escaped unless it
// is already SafeHtml (the result of another html`` call or raw()). Templates stay
// plain functions, so they run the same in Node (build), an edge function or a browser
// (live CMS preview).

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export class SafeHtml {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

export const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);

export const raw = (value) => new SafeHtml(String(value));

function serialize(value) {
  if (value == null || value === false || value === true) return '';
  if (Array.isArray(value)) return value.map(serialize).join('');
  if (value instanceof SafeHtml) return value.value;
  return escape(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += serialize(values[i]) + strings[i + 1];
  return new SafeHtml(out);
}

// Renders an attribute only when it has a value: attr('loading', lazy && 'lazy')
export const attr = (name, value) =>
  value == null || value === false ? '' : raw(value === true ? ` ${name}` : ` ${name}="${escape(value)}"`);
