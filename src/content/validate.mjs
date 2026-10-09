// Structural checks on content before rendering. A CMS can send anything; this keeps a
// bad payload from producing a half-broken page. Missing-content markers ($missing)
// count as present here: they are reported separately as gaps.

import { sections } from '../render/sections/index.mjs';

const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
const blank = (v) => v == null || v === '' || (Array.isArray(v) && v.length === 0);

const REQUIRED_SETTINGS = [
  'locale',
  'dir',
  'business.name',
  'business.title',
  'business.address.street',
  'business.address.city',
  'business.phone.display',
  'business.phone.e164',
  'business.whatsapp.number',
  'seo.title',
  'seo.description',
];
const REQUIRED_COLORS = ['paper', 'paperDeep', 'ink', 'inkSoft', 'clay', 'clayDeep', 'line'];

export function validate({ settings, theme, page, collections }) {
  const errors = [];

  for (const path of REQUIRED_SETTINGS) if (blank(get(settings, path))) errors.push(`settings.${path} is required`);
  for (const name of REQUIRED_COLORS) if (blank(theme.colors?.[name])) errors.push(`theme.colors.${name} is required`);
  if (!theme.fonts?.display || !theme.fonts?.body) errors.push('theme.fonts needs "display" and "body"');

  if (!Array.isArray(page.sections) || page.sections.length === 0) errors.push(`page "${page.id}" has no sections`);
  const ids = new Set();
  for (const [i, s] of (page.sections ?? []).entries()) {
    const where = `page "${page.id}" section #${i + 1} (${s.id ?? 'no id'})`;
    if (!/^[a-z][a-z0-9-]*$/.test(s.id ?? '')) errors.push(`${where}: id must be lowercase latin, used as the #anchor`);
    if (ids.has(s.id)) errors.push(`${where}: duplicate id`);
    ids.add(s.id);
    const def = sections[s.type];
    if (!def) {
      errors.push(`${where}: unknown type "${s.type}"`);
      continue;
    }
    for (const field of def.required) if (blank(get(s, field))) errors.push(`${where}: "${field}" is required`);
  }

  for (const [name, list] of Object.entries(collections)) {
    const seen = new Set();
    for (const item of list) {
      if (blank(item.id)) errors.push(`collection "${name}": item without id`);
      else if (seen.has(item.id)) errors.push(`collection "${name}": duplicate id "${item.id}"`);
      seen.add(item.id);
    }
  }

  return errors;
}
