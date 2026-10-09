// The signature motif: a hand-drawn line that "accompanies" (ללוות, Lior's own word).
// Paths are drawn right to left so they follow the Hebrew reading direction.
// pathLength="1" lets CSS draw them with stroke-dashoffset 1 -> 0.

import { raw } from '../html.mjs';

// Three slightly different strokes, cycled per word, so a phrase never repeats a shape.
const UNDER = [
  'M298 10 C 252 4, 206 15, 152 10 S 58 5, 2 12',
  'M298 12 C 240 15, 196 6, 140 9 S 50 14, 2 10',
  'M298 9 C 262 13, 214 5, 160 11 S 66 12, 2 8',
];

export const underline = (i = 0) =>
  raw(
    '<svg class="line-motif line-under" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
      `<path pathLength="1" d="${UNDER[i % UNDER.length]}"/></svg>`,
  );

// Short stroke used before small labels and professional terms.
export const tick = () =>
  raw(
    '<svg class="line-motif line-tick" viewBox="0 0 48 10" aria-hidden="true" focusable="false">' +
      '<path pathLength="1" d="M46 5 C 36 2, 26 8, 14 5 S 4 4, 2 6"/></svg>',
  );

// The line that runs through the three steps: across on wide screens, down on phones.
export const stepsLine = () =>
  raw(
    '<svg class="line-motif steps-line steps-line--across" viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true" focusable="false" data-draw>' +
      '<path pathLength="1" d="M996 30 C 900 6, 812 54, 690 30 S 470 8, 350 32 S 120 52, 4 26"/></svg>' +
      '<svg class="line-motif steps-line steps-line--down" viewBox="0 0 40 600" preserveAspectRatio="none" aria-hidden="true" focusable="false" data-draw>' +
      '<path pathLength="1" d="M20 4 C 6 90, 34 170, 20 250 S 4 430, 22 596"/></svg>',
  );

// Progress through the worries: a faint line with the clay line drawn over it (--progress 0..1).
export const progressLine = () =>
  raw(
    '<svg class="line-motif progress-line" viewBox="0 0 1000 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
      '<path class="progress-track" d="M996 12 C 880 4, 760 20, 620 12 S 360 4, 220 13 S 60 18, 4 10"/>' +
      '<path class="progress-fill" pathLength="1" d="M996 12 C 880 4, 760 20, 620 12 S 360 4, 220 13 S 60 18, 4 10"/></svg>',
  );

// Favicon: the same loop, drawn from the theme colors at build time.
export const faviconSvg = (colors) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${colors.paper}"/>` +
  `<path d="M56 41 C 45 43, 37 41, 31 35 C 25 29, 28 19, 35 21 C 42 23, 39 40, 28 44 S 13 43, 8 41" fill="none" stroke="${colors.clayDeep}" stroke-width="5" stroke-linecap="round"/></svg>\n`;

// A small loop that closes the page, in the footer.
export const loop = () =>
  raw(
    '<svg class="line-motif line-loop" viewBox="0 0 160 40" aria-hidden="true" focusable="false" data-draw>' +
      '<path pathLength="1" d="M158 30 C 120 34, 92 30, 74 22 C 58 14, 66 4, 78 8 C 90 12, 84 30, 64 34 S 20 30, 2 26"/></svg>',
  );
