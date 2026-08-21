import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist', 'public');
const assetSource = join(root, 'assets', 'learning-lens');
const media = join(dist, 'media');

const replacements = [
  ['/manus-storage/sora-latin-variable_f537e28c.woff2', '/media/fonts/sora-latin-variable.woff2'],
  ['/manus-storage/manrope-latin-variable_0ec88f5a.woff2', '/media/fonts/manrope-latin-variable.woff2'],
  ['/manus-storage/learning-lens-accounting-business-study-notes_c4b10195.webp', '/media/images/learning-lens-accounting-business-study-notes.webp'],
  ['/manus-storage/learning-lens-accounting-business-study-notebook_21994ca7.webp', '/media/images/learning-lens-accounting-business-study-notebook.webp'],
  ['/manus-storage/the-learning-lens-navbar-logo-blue-orange_ddf2d96f.png', '/media/brand/the-learning-lens-navbar-logo-blue-orange.png'],
  ['/manus-storage/the-learning-lens-mobile-menu-logo-white-light-blue_d1334d38.png', '/media/brand/the-learning-lens-mobile-menu-logo-white-light-blue.png'],
  ['/manus-storage/the-learning-lens-favicon-32_7feb59af.png', '/media/icons/the-learning-lens-favicon-32.png'],
  ['/manus-storage/the-learning-lens-favicon-48_85899f50.png', '/media/icons/the-learning-lens-favicon-48.png'],
  ['/manus-storage/the-learning-lens-apple-touch-icon-180_712f7210.png', '/media/icons/the-learning-lens-apple-touch-icon-180.png'],
];

const assets = await readdir(join(dist, 'assets'));
const textFiles = [join(dist, 'index.html'), ...assets.filter((name) => /\.(css|js)$/.test(name)).map((name) => join(dist, 'assets', name))];

await rm(join(dist, '__manus__'), { recursive: true, force: true });
await mkdir(media, { recursive: true });
await cp(join(assetSource, 'brand'), join(media, 'brand'), { recursive: true });
await cp(join(assetSource, 'icons'), join(media, 'icons'), { recursive: true });
await cp(join(assetSource, 'images'), join(media, 'images'), { recursive: true });
await cp(join(root, 'assets', 'learning-lens', 'fonts'), join(media, 'fonts'), { recursive: true });

for (const file of textFiles) {
  let content = await readFile(file, 'utf8');
  for (const [from, to] of replacements) content = content.split(from).join(to);
  if (file.endsWith('index.html')) {
    content = content.split('\n').filter((line) => !line.includes('__manus__/debug-collector.js') && !line.includes('manus-analytics.com/umami')).join('\n');
  }
  await writeFile(file, content);
}

await writeFile(join(dist, '_redirects'), '/* /index.html 200\n');
