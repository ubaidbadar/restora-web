const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const root = path.resolve(__dirname, '../..');
const harness = path.join(root, '.github', 'order-page-e2e');
const windows = process.platform === 'win32';
const playwright = path.join(
  harness,
  'node_modules',
  '.bin',
  windows ? 'playwright.cmd' : 'playwright'
);

if (!fs.existsSync(playwright)) {
  console.error('Playwright is not installed. Run "yarn qa:setup" once on this machine.');
  process.exit(1);
}
if (!fs.existsSync(path.join(root, 'dist', 'index.html'))) {
  console.error('The production build is missing. Run "yarn build" or "yarn qa:order".');
  process.exit(1);
}

const result = spawnSync(
  playwright,
  ['test', '--config=playwright.config.cjs', ...process.argv.slice(2)],
  { cwd: harness, stdio: 'inherit', shell: windows }
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
