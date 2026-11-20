/**
 * Native-only Vite 8 build. Windows WebView2 is allowed to reuse the same
 * https://app.restora.live origin as the working PWA, but the packaged UI must
 * not require separate network-style requests to bootstrap JS or CSS.
 *
 * This avoids deprecated Rollup options, adds no dependency, and never affects
 * the hosted web/PWA's normal build.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

process.env.RESTORA_DESKTOP_BUNDLE = '1';
const { build } = await import('vite');
await build();

const dist = resolve('dist');
const path = resolve(dist, 'index.html');
let html = await readFile(path, 'utf8');

const scriptTags = [...html.matchAll(/<script\b[^>]*\bsrc="(\/assets\/[^"]+\.js)"[^>]*><\/script>/g)];
const cssTags = [...html.matchAll(/<link\b[^>]*\bhref="(\/assets\/[^"]+\.css)"[^>]*>/g)];
if (scriptTags.length !== 1 || cssTags.length !== 1) {
  throw new Error(
    'The native build must emit exactly one entry module and CSS file, found ' +
    scriptTags.length + ' module(s) and ' + cssTags.length + ' stylesheet(s).'
  );
}
for (const [tag, src] of scriptTags) {
  const javascript = await readFile(resolve(dist, '.' + src), 'utf8');
  html = html.replace(tag, '<script type="module">' + javascript.replace(/<\/script/gi, '<\\/script') + '</script>');
}
for (const [tag, src] of cssTags) {
  const css = await readFile(resolve(dist, '.' + src), 'utf8');
  html = html.replace(tag, '<style>' + css.replace(/<\/style/gi, '<\\/style') + '</style>');
}
if (/<(?:script|link)\b[^>]*(?:src|href)="\/assets\/[^"]+\.(?:js|css)"/.test(html)) {
  throw new Error('Desktop build still references separate JS/CSS assets');
}
await writeFile(path, html);
console.log('Restora POS desktop HTML includes its complete startup JS and CSS (' + Buffer.byteLength(html) + ' bytes).');
