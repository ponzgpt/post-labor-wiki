// Colour maths for the design checks: WCAG contrast, HSL hue, and the "no brown" rule (research/IA-v3.md §9).

export function rgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
}

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
export const luminance = (hex) => { const [r, g, b] = rgb(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function hsl(hex) {
  const [r, g, b] = rgb(hex);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}

/** Brown, ochre, mustard, rust, beige: a hue of 15–70° that is not near-grey and not a pale tint of almost nothing. */
export function earthy(hex) {
  const { h, s, l } = hsl(hex);
  return h >= 15 && h <= 70 && s >= 0.12 && (l <= 0.9 || s >= 0.4);
}

/** Custom properties holding a hex colour, from one CSS block's body. */
export function hexTokens(block) {
  return Object.fromEntries([...block.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,6})\b/g)].map(([, k, v]) => [k, v.toLowerCase()]));
}

/** The three theme blocks of tokens.css: light (:root), dark via the OS (media query) and dark by choice ([data-theme="dark"]). */
export function themeBlocks(css) {
  const body = (re) => css.match(re)?.[1] ?? '';
  return {
    light: hexTokens(body(/(?:^|\n):root\s*\{([^}]*)\}/)),
    darkMedia: hexTokens(body(/prefers-color-scheme:\s*dark\)\s*\{\s*:root:not\(\[data-theme=["']light["']\]\)\s*\{([^}]*)\}/)),
    dark: hexTokens(body(/:root\[data-theme=["']dark["']\]\s*\{([^}]*)\}/)),
  };
}
