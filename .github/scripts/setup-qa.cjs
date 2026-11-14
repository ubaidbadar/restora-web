const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const root = path.resolve(__dirname, '../..');
const harness = path.join(root, '.github', 'order-page-e2e');
const windows = process.platform === 'win32';

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: windows,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

run('npm', [
  'install',
  '--prefix',
  path.relative(root, harness),
  '--no-save',
  '--no-package-lock',
  '@playwright/test',
  '@axe-core/playwright',
]);

const playwright = path.join(
  harness,
  'node_modules',
  '.bin',
  windows ? 'playwright.cmd' : 'playwright'
);
if (!fs.existsSync(playwright)) {
  throw new Error('Playwright installation did not create its local CLI.');
}

run(playwright, ['install', 'chromium', 'firefox', 'webkit'], harness);
run('git', ['config', 'core.hooksPath', '.githooks']);

console.log('\nQA setup complete. Local commits will now run the full pre-commit test gate.');
