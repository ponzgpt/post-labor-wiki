#!/usr/bin/env node
// Renders the PNG icons and the 1200×630 social image from SVG/HTML with the local headless Chrome (nothing installed).
// Run after changing public/favicon.svg or the OG layout below: npm run brand. Outputs are committed in public/.
import { writeFileSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { fred, rebase, last } from '../src/lib/data.mjs';

const root = new URL('..', import.meta.url).pathname;
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const tmp = mkdtempSync(join(tmpdir(), 'plw-brand-'));
const fonts = (p) => pathToFileURL(join(root, 'node_modules/@fontsource-variable', p)).href;

function shot(html, out, w, h, transparent = false) {
  const file = join(tmp, 'page.html');
  writeFileSync(file, html);
  execFileSync(CHROME, ['--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${w},${h}`,
    ...(transparent ? ['--default-background-color=00000000'] : []), `--screenshot=${out}`, pathToFileURL(file).href], { stdio: 'ignore' });
}

// Icons: the light-scheme mark (the SVG's default), at each size.
const source = readFileSync(join(root, 'public/favicon.svg'), 'utf8');
const svg = source.replace(/@media[\s\S]*?\}\s*\}/, '');
// The dark-scheme variant (light tile), for the dark social image.
const svgDark = source.replace(/<style>[\s\S]*<\/style>/, '<style>.bg{fill:#e8edf5}.up{stroke:#0b1220}.flat{stroke:#c42a6c}.o{fill:#0b1220}</style>');
for (const [name, size] of [['icon-32.png', 32], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  shot(`<html><body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`, join(root, 'public', name), size, size, true);
}
// apple-touch-icon: opaque square (iOS rounds it), mark inset on the ink background.
shot(`<html><body style="margin:0;background:#0d1626">${svg.replace('<svg ', '<svg width="180" height="180" ').replace('rx="8"', 'rx="0"')}</body></html>`, join(root, 'public/apple-touch-icon.png'), 180, 180);

// Social image: statement + the decoupling chart, drawn from the committed snapshots.
const prod = rebase(fred('OPHNFB.csv'), 1973), pay = rebase(fred('COMPRNFB.csv'), 1973);
const X0 = 1973, X1 = last(prod).x, ymax = Math.ceil(last(prod).v / 50) * 50;
const sx = (x) => 40 + ((x - X0) / (X1 - X0)) * 420, sy = (v) => 300 - ((v - 50) / (ymax - 50)) * 270;
const path = (s) => s.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)} ${sy(p.v).toFixed(1)}`).join('');
const og = `<!doctype html><html><head><style>
@font-face { font-family: 'Serif'; src: url(${fonts('source-serif-4/files/source-serif-4-latin-opsz-normal.woff2')}); font-weight: 200 900; }
@font-face { font-family: 'Sans'; src: url(${fonts('public-sans/files/public-sans-latin-wght-normal.woff2')}); font-weight: 100 900; }
body { margin: 0; width: 1200px; height: 630px; background: #0b1220; color: #e8edf5; font-family: 'Sans'; display: grid; grid-template-columns: 640px 1fr; }
.l { padding: 64px 0 56px 72px; display: flex; flex-direction: column; }
.brand { display: flex; align-items: center; gap: 16px; font: 700 30px 'Serif'; }
h1 { font: 680 54px/1.08 'Serif'; letter-spacing: -0.02em; margin: 44px 0 0; }
p { font-size: 23px; line-height: 1.45; color: #bcc6d6; margin: 22px 0 0; }
.badges { margin-top: auto; display: flex; gap: 10px; }
.b { font: 700 15px 'Sans'; letter-spacing: .05em; text-transform: uppercase; border: 2px solid; border-radius: 99px; padding: 4px 13px; }
.r { padding: 70px 64px 0 0; }
.k { font-size: 18px; color: #94a1b6; margin-bottom: 14px; }
.k b { font: 700 40px 'Serif'; display: block; color: #e8edf5; }
</style></head><body>
<div class="l">
  <div class="brand">${svgDark.replace('<svg ', '<svg width="52" height="52" ')}Post-Labor Wiki</div>
  <h1>What happens to income and power when machines do the work?</h1>
  <p>The evidence, the frameworks, the policy options and the open questions. Every claim cited and labelled.</p>
  <div class="badges"><span class="b" style="color:#52d49c">Empirical</span><span class="b" style="color:#b6a5ff">Analytical</span><span class="b" style="color:#f483cb;border-style:dashed">Forecast</span><span class="b" style="color:#ff8a9b;border-style:double;border-width:4px">Normative</span></div>
</div>
<div class="r">
  <div class="k"><b><span style="color:#5b9bff">+${Math.round(last(prod).v - 100)}%</span> vs <span style="color:#f06aa6">+${Math.round(last(pay).v - 100)}%</span></b>US output per hour vs real hourly pay, 1973–${X1}</div>
  <svg width="500" height="330" viewBox="0 0 500 330">
    ${[50, 100, 150, 200, 250, 300].filter((v) => v <= ymax).map((v) => `<line x1="40" x2="460" y1="${sy(v)}" y2="${sy(v)}" stroke="#1f2b40"/><text x="30" y="${sy(v) + 5}" fill="#94a1b6" font-size="14" text-anchor="end" font-family="Sans">${v}</text>`).join('')}
    <path d="${path(prod)}" fill="none" stroke="#5b9bff" stroke-width="4" stroke-linejoin="round"/>
    <path d="${path(pay)}" fill="none" stroke="#f06aa6" stroke-width="4" stroke-linejoin="round"/>
    <text x="40" y="324" fill="#94a1b6" font-size="14" font-family="Sans">1973</text><text x="460" y="324" fill="#94a1b6" font-size="14" font-family="Sans" text-anchor="end">${X1}</text>
  </svg>
</div></body></html>`;
const png = join(tmp, 'og.png');
shot(og, png, 1200, 630);
execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '88', png, '--out', join(root, 'public/og.jpg')], { stdio: 'ignore' });
rmSync(tmp, { recursive: true, force: true });
console.log('✓ public/icon-32.png, icon-192.png, icon-512.png, apple-touch-icon.png, og.jpg');
