import { createFileSource } from './sources/file.mjs';
import { createHttpSource } from './sources/http.mjs';

export const COLLECTIONS = ['reviews', 'media'];

// CONTENT_SOURCE=file (default) reads /content.
// CONTENT_SOURCE=http CONTENT_URL=... [CONTENT_TOKEN=...] reads a content API.
export function createSource(env, defaults) {
  const kind = env.CONTENT_SOURCE ?? 'file';
  if (kind === 'file') return createFileSource(env.CONTENT_DIR ?? defaults.contentDir);
  if (kind === 'http') {
    if (!env.CONTENT_URL) throw new Error('CONTENT_SOURCE=http needs CONTENT_URL');
    return createHttpSource(env.CONTENT_URL, { token: env.CONTENT_TOKEN });
  }
  throw new Error(`Unknown CONTENT_SOURCE "${kind}"`);
}

export async function loadSiteData(source, pageId = 'home') {
  const [settings, theme, page, ...lists] = await Promise.all([
    source.getSettings(),
    source.getTheme(),
    source.getPage(pageId),
    ...COLLECTIONS.map((name) => source.getCollection(name)),
  ]);
  const collections = Object.fromEntries(COLLECTIONS.map((name, i) => [name, lists[i] ?? []]));
  return { settings, theme, page, collections };
}
