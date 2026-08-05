import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const destination = resolve(process.argv[2] || './app/ps27-assets.js');
const files = [
  ['fundo.jpg', 'image/jpeg'], ['fundo-historias.png', 'image/png'], ['lucas.png', 'image/png'], ['paulo.png', 'image/png'], ['lavinia.png', 'image/png'], ['logo-ifmg-adesivo.png', 'image/png'],
  ['adesivo-retangular-amarelo.png', 'image/png'], ['adesivo-retangular-vermelho.png', 'image/png'], ['adesivo-retangular-verde.png', 'image/png'], ['slogan-ps27.png', 'image/png'], ['slogan-ps27-pink.png', 'image/png'], ['estrela.png', 'image/png'],
  ['adesivo-data-amarelo.png', 'image/png'], ['adesivo-data-azul.png', 'image/png'], ['adesivo-data-vermelho.png', 'image/png'],
];
const values = await Promise.all(files.map(async ([name, mime]) => [name, `data:${mime};base64,${(await readFile(resolve('./assets/ps27', name))).toString('base64')}`]));
await writeFile(destination, `// Gerado por scripts/generate-ps27-data-assets.mjs. Não editar manualmente.\nwindow.ps27EmbeddedAssets = ${JSON.stringify(Object.fromEntries(values))};\n`);
console.log(`Camadas PS27 embutidas em ${destination}.`);
