// Content source backed by the JSON files in /content. This is the stand-in for the
// future database: any other source only has to implement the same four methods.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

export function createFileSource(dir) {
  return {
    name: `file:${dir}`,
    getSettings: () => readJson(join(dir, 'settings.json')),
    getTheme: () => readJson(join(dir, 'theme.json')),
    getPage: (id) => readJson(join(dir, 'pages', `${id}.json`)),
    getCollection: async (name) => (await readJson(join(dir, 'collections', `${name}.json`))).items,
  };
}
