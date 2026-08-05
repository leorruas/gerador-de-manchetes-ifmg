import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = resolve(process.argv[2] || '../PS27/Instagram post - 1.svg');
const destination = resolve(process.argv[3] || './assets/ps27');
const names = [
  'fundo',
  'fundo-historias',
  'lucas',
  'paulo',
  'lavinia',
  'logo-ifmg-adesivo',
  'adesivo-retangular-amarelo',
  'adesivo-retangular-vermelho',
  'adesivo-retangular-verde',
  'slogan-ps27',
  'slogan-ps27-pink',
  'estrela',
  'adesivo-data-amarelo',
  'adesivo-data-azul',
  'adesivo-data-vermelho',
];

const svg = await readFile(source, 'utf8');
const matches = [...svg.matchAll(/<image id="image(\d+)_\d+_\d+"[^>]*xlink:href="data:([^;]+);base64,([^"]+)"\s*\/>/g)];
if (matches.length !== names.length) throw new Error(`Esperadas ${names.length} camadas; encontradas ${matches.length}.`);

await mkdir(destination, { recursive: true });
for (const [, index, mime, encoded] of matches) {
  const extension = mime === 'image/jpeg' ? 'jpg' : mime === 'image/png' ? 'png' : 'bin';
  await writeFile(resolve(destination, `${names[Number(index)]}.${extension}`), Buffer.from(encoded, 'base64'));
}

console.log(`Extraídas ${matches.length} camadas de ${source} em ${destination}.`);
