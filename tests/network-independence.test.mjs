import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');

test('desktop runtime blocks direct network requests', async () => {
  const main = await fs.readFile(path.join(root, 'desktop/main.cjs'), 'utf8');

  assert.match(main, /session\.defaultSession\.webRequest\.onBeforeRequest/);
  for (const scheme of ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*']) {
    assert.ok(main.includes(`'${scheme}'`), scheme);
  }
  assert.match(main, /callback\(\{cancel:true\}\)/);
});

test('web pages cannot initiate external network connections', async () => {
  for (const file of ['index.html', 'pet.html']) {
    const html = await fs.readFile(path.join(root, file), 'utf8');
    assert.match(html, /connect-src 'none'/);
    assert.doesNotMatch(html, /(?:src|href)=["'](?:https?:)?\/\//i);
  }
});

test('offline web launcher only binds to localhost', async () => {
  const server = await fs.readFile(path.join(root, 'offline/serve.mjs'), 'utf8');

  assert.match(server, /listen\(port, '127\.0\.0\.1'/);
  assert.doesNotMatch(server, /https?:\/\/(?!127\.0\.0\.1|localhost)/);
  assert.doesNotMatch(server, /\bfetch\s*\(/);
});
