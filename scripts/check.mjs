import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MAX_LINES = 250;
const JS_ROOTS = ['app', 'services'];
const EXTRA_FILES = ['constants.js', 'index.js'];

function listJsFiles(dir) {
  return readdirSync(dir)
    .flatMap((entry) => {
      const path = join(dir, entry);
      const stat = statSync(path);
      if (stat.isDirectory()) return listJsFiles(path);
      return path.endsWith('.js') ? [path] : [];
    });
}

const files = [
  ...EXTRA_FILES,
  ...JS_ROOTS.flatMap(listJsFiles),
];

const oversized = [];
const expectedScripts = [
  './constants.js',
  './services/layoutTokens.js',
  './services/richText.js',
  './services/canvasExportHelpers.js',
  './services/canvasExportLayoutsA.js',
  './services/canvasExportCarousel.js',
  './services/canvasExportLayoutsB.js',
  './services/canvasExportText.js',
  './services/canvasExport.js',
  './services/historyDb.js',
  './services/imageStore.js',
  './app/core.js',
  './app/persistence.js',
  './app/preview-metrics.js',
  './app/handlers-upload.js',
  './app/handlers-export.js',
  './app/handlers-history.js',
  './app/handlers-crop.js',
  './app/handlers-edit.js',
  './app/handlers-slides.js',
  './app/handlers-drag.js',
  './app/handlers.js',
  './app/events.js',
  './app/template-welcome.js',
  './app/template-preview-story.js',
  './app/template-preview.js',
  './app/template-editor.js',
  './app/templates-main.js',
  './app/templates-modals.js',
  './app/render.js',
  './app/contracts.js',
  './app/init.js',
  './index.js',
];

for (const file of files) {
  execFileSync('node', ['--check', file], { stdio: 'inherit' });

  const lines = execFileSync('wc', ['-l', file], { encoding: 'utf8' });
  const count = Number(lines.trim().split(/\s+/)[0]);
  if (count > MAX_LINES) {
    oversized.push(`${file}: ${count} linhas`);
  }
}

if (oversized.length > 0) {
  console.error(`Arquivos acima de ${MAX_LINES} linhas:\n${oversized.join('\n')}`);
  process.exit(1);
}

const html = readFileSync('index.html', 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((match) => match[1]);
if (JSON.stringify(scripts) !== JSON.stringify(expectedScripts)) {
  console.error('Ordem de scripts em index.html diverge do contrato esperado.');
  console.error(`Esperado:\n${expectedScripts.join('\n')}`);
  console.error(`Atual:\n${scripts.join('\n')}`);
  process.exit(1);
}

console.log(`OK: ${files.length} arquivos JS validos, ate ${MAX_LINES} linhas, e ordem de scripts correta.`);
