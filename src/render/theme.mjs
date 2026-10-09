// Turns content/theme.json into CSS custom properties + @font-face rules.
// The stylesheet only ever reads var(--token), so changing the theme data restyles
// the site without touching CSS.

const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const round = (n) => Math.round(n * 1000) / 1000;
const quote = (family) => `"${family.replace(/"/g, '')}"`;

// Fluid type: each step interpolates between a mobile and a desktop modular scale.
function typeSteps(scale) {
  const { minViewport, maxViewport, minBase, maxBase, minRatio, maxRatio, steps } = scale;
  return steps.map((step) => {
    const min = minBase * minRatio ** step;
    const max = maxBase * maxRatio ** step;
    const slope = (max - min) / (maxViewport - minViewport);
    const intercept = min - slope * minViewport;
    const [lo, hi] = min <= max ? [min, max] : [max, min];
    return `--step-${step}: clamp(${round(lo / 16)}rem, ${round(intercept / 16)}rem + ${round(slope * 100)}vw, ${round(hi / 16)}rem);`;
  });
}

export function fontFaceCss(fonts) {
  return Object.values(fonts)
    .flatMap((font) =>
      (font.faces ?? []).map((face) => {
        const src = face.src.map((s) => `url("${s.url}") format("${s.format}")`).join(', ');
        return `@font-face{font-family:${quote(font.family)};src:${src};font-weight:${face.weight};font-style:${face.style ?? 'normal'};font-display:swap}`;
      }),
    )
    .join('\n');
}

export function themeCss(theme) {
  const vars = [];
  for (const [name, value] of Object.entries(theme.colors)) vars.push(`--${kebab(name)}: ${value};`);
  for (const [role, font] of Object.entries(theme.fonts)) vars.push(`--font-${role}: ${quote(font.family)}, ${font.fallback};`);
  vars.push(...typeSteps(theme.typeScale));
  for (const [name, px] of Object.entries(theme.space)) vars.push(`--space-${name}: ${px / 16}rem;`);
  for (const [name, px] of Object.entries(theme.radius)) vars.push(`--radius-${name}: ${px}px;`);
  const m = theme.motion;
  vars.push(`--dur-short: ${m.durationShort}ms;`, `--dur-long: ${m.durationLong}ms;`, `--ease: ${m.ease};`);
  return `${fontFaceCss(theme.fonts)}\n:root{${vars.join('')}}`;
}

// Font files worth preloading (the display face used above the fold).
export const fontPreloads = (theme) =>
  Object.values(theme.fonts).flatMap((font) =>
    (font.faces ?? []).filter((f) => f.preload).map((f) => f.src.find((s) => s.format === 'woff2') ?? f.src[0]),
  );

export const googleFontsHref = (theme) => {
  const families = Object.values(theme.fonts).filter((f) => f.googleFonts).map((f) => `family=${f.googleFonts}`);
  return families.length ? `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap` : null;
};
