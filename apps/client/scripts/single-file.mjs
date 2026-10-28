// Packs dist/ into one self-contained HTML file: dist/hearthfall.html.
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist/index.html', 'utf8');
const read = (href) => readFileSync('dist' + href, 'utf8').replace(/<\/script/g, '<\\/script');
const out = html
  .replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/, (_, src) => `<script type="module">${read(src)}</script>`)
  .replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/, (_, href) => `<style>${read(href)}</style>`);
writeFileSync('dist/hearthfall.html', out);
console.log(`dist/hearthfall.html: ${(out.length / 1024).toFixed(0)} KB`);
