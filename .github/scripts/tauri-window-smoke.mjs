// Native Windows acceptance check for a real installed Tauri/WebView2 window.
// This does not run on the web/PWA pipeline and requires no third-party JS packages.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const installed = process.argv[2];
assert.ok(installed, 'Expected the NSIS installation directory');
let socket;

async function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error('WebView2 debugger socket timed out'));
    }, 3500);
    ws.addEventListener('open', () => {
      clearTimeout(timer);
      resolve(ws);
    }, { once: true });
    ws.addEventListener('error', () => {
      clearTimeout(timer);
      reject(new Error('WebView2 debugger socket failed'));
    }, { once: true });
  });
}

// Microsoft documents WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS for debugging.
// The port exists only in this Windows CI step, never in the packaged app.
for (let attempt = 0; attempt < 40; attempt++) {
  try {
    const response = await fetch('http://127.0.0.1:9222/json/list', { signal: AbortSignal.timeout(1700) });
    const targets = await response.json();
    const page = targets.find((target) => target.type === 'page'
      && target.url.startsWith('https://app.restora.live/')
      && target.webSocketDebuggerUrl);
    if (page) {
      socket = await connect(page.webSocketDebuggerUrl);
      break;
    }
  } catch { /* WebView2 may still be opening */ }
  await sleep(700);
}
assert.ok(socket, 'The installed WebView2 did not navigate to the locally mapped Restora origin');

let counter = 0;
function call(method, params = {}) {
  const id = ++counter;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.removeEventListener('message', onMessage);
      reject(new Error('WebView2 command timed out: ' + method));
    }, 6000);
    function onMessage(event) {
      const message = JSON.parse(event.data);
      if (message.id !== id) return;
      socket.removeEventListener('message', onMessage);
      clearTimeout(timer);
      if (message.error) reject(new Error(method + ': ' + message.error.message));
      else resolve(message.result);
    }
    socket.addEventListener('message', onMessage);
    socket.send(JSON.stringify({ id, method, params }));
  });
}

const probe = [
  '(async () => {',
  '  const script = document.querySelector("script[type=module][src]");',
  '  if (!script || !document.getElementById("root")?.firstElementChild) return null;',
  '  const response = await fetch(script.src, { cache: "no-store" });',
  '  if (!response.ok) throw new Error("Main React script failed with " + response.status);',
  '  const hash = await crypto.subtle.digest("SHA-256", await response.arrayBuffer());',
  '  const registrations = await navigator.serviceWorker?.getRegistrations().catch(() => []);',
  '  return { url: location.href, flag: window.__RESTORA_DESKTOP__ === true,',
  '    offline: navigator.onLine === false,',
  '    script: script.src, hash: Array.from(new Uint8Array(hash), (n) => n.toString(16).padStart(2,"0")).join(""),',
  '    workers: registrations?.length ?? 0 };',
  '})()',
].join('\n');

async function inspect() {
  for (let attempt = 0; attempt < 25; attempt++) {
    try {
      const result = await call('Runtime.evaluate', { expression: probe, awaitPromise: true, returnByValue: true });
      if (result.result?.value) return result.result.value;
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    } catch (error) {
      if (attempt === 24) throw error;
    }
    await sleep(600);
  }
  throw new Error('Bundled React root never rendered in installed WebView2');
}

function verify(snapshot, shouldBeOffline) {
  assert.ok(snapshot.url.startsWith('https://app.restora.live/index.html'), snapshot.url);
  assert.equal(snapshot.flag, true, 'Missing Tauri desktop environment flag');
  assert.equal(snapshot.workers, 0, 'An external web service worker is controlling the desktop bundle');
  if (shouldBeOffline) assert.equal(snapshot.offline, true, 'Offline navigation state did not apply');

  const asset = new URL(snapshot.script);
  assert.equal(asset.origin, 'https://app.restora.live');
  const rel = decodeURIComponent(asset.pathname).replace(/^\/+/, '');
  const root = join(installed, 'web');
  const file = join(root, rel);
  assert.ok(file.startsWith(root + sep), 'An asset escaped its native bundle');
  const expected = createHash('sha256').update(readFileSync(file)).digest('hex');
  assert.equal(snapshot.hash, expected, 'WebView2 loaded a different JS build than this installer bundled');
  console.log('PASS: native React rendered from packaged JS; hash ' + expected.slice(0, 16));
}

try {
  verify(await inspect(), false);

  // Current Chrome DevTools Network APIs (not deprecated emulateNetworkConditions):
  // block the server and tell the page it is offline, then reload a deep hash route.
  await call('Network.enable');
  await call('Network.setBlockedURLs', { urls: ['https://restora.live/*'] });
  await call('Network.overrideNetworkState', {
    offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0, connectionType: 'none',
  });
  await call('Page.enable');
  await call('Page.navigate', { url: 'https://app.restora.live/index.html#/orders/new' });
  await sleep(900);
  await call('Page.reload', { ignoreCache: true });
  verify(await inspect(), true);
  console.log('PASS: installed React reloaded from disk on a deep route with the backend unavailable');
} finally {
  socket.close();
}
