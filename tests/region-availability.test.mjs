import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const pluginRoot = path.join(root, 'dsh-plugin');

test('Luna plugin publication has no country allowlist', async () => {
  const manifest = JSON.parse(
    await fs.readFile(path.join(pluginRoot, '.codex-plugin/plugin.json'), 'utf8'),
  );

  assert.deepEqual(
    manifest.extensions['com.openai'].publication.countries,
    [],
    'an empty countries array removes all country restrictions',
  );
});

test('Luna DSH package uses the public npm registry', async () => {
  const pkg = JSON.parse(
    await fs.readFile(path.join(pluginRoot, 'package.json'), 'utf8'),
  );

  assert.equal(pkg.publishConfig.access, 'public');
  assert.equal(
    pkg.publishConfig.registry,
    'https://registry.npmjs.org/',
  );
  assert.ok(pkg.files.includes('.codex-plugin/plugin.json'));
});
