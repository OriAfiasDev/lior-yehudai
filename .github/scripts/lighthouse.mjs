#!/usr/bin/env node
/*
 * Run Lighthouse (mobile + desktop) against a URL and print the four category
 * scores plus every scored audit that isn't perfect.
 *
 * Usage: node lighthouse.mjs <url> [--json out.json]
 * Needs Google Chrome installed; Lighthouse itself is fetched with npx.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const url = process.argv[2];
if (!url) {
  console.error('usage: node lighthouse.mjs <url> [--json out.json]');
  process.exit(2);
}
const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
const dir = mkdtempSync(path.join(tmpdir(), 'lh-'));
const summary = {};

for (const preset of ['mobile', 'desktop']) {
  const out = path.join(dir, `${preset}.json`);
  const args = [
    '--yes', 'lighthouse', url,
    '--quiet', '--output=json', `--output-path=${out}`,
    '--only-categories=performance,accessibility,best-practices,seo',
    '--chrome-flags=--headless=new --no-sandbox',
  ];
  if (preset === 'desktop') args.push('--preset=desktop');
  try {
    execFileSync('npx', args, { stdio: ['ignore', 'ignore', 'pipe'], timeout: 240_000 });
  } catch (err) {
    console.error(`Lighthouse ${preset} failed: ${String(err.stderr || err.message).slice(0, 500)}`);
    continue;
  }
  const lhr = JSON.parse(readFileSync(out, 'utf8'));
  const scores = Object.fromEntries(Object.entries(lhr.categories).map(([k, c]) => [k, Math.round(c.score * 100)]));
  const failing = [];
  for (const [cat, c] of Object.entries(lhr.categories)) {
    for (const ref of c.auditRefs) {
      const a = lhr.audits[ref.id];
      if (!ref.weight || a.score === null || a.score >= 1) continue;
      failing.push({ category: cat, id: ref.id, title: a.title, score: a.score, value: a.displayValue || '' });
    }
  }
  summary[preset] = { scores, failing };

  console.log(`\n${preset.toUpperCase()}  ` + Object.entries(scores).map(([k, v]) => `${k} ${v}`).join(' · '));
  for (const f of failing) console.log(`  - [${f.category}] ${f.title}${f.value ? ` (${f.value})` : ''}  score ${f.score}  <${f.id}>`);
}

if (jsonOut) writeFileSync(jsonOut, JSON.stringify(summary, null, 2));
