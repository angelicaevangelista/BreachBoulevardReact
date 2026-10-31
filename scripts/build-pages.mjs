import fs from 'node:fs';
import path from 'node:path';
const pages = JSON.parse(fs.readFileSync('src/pages.json', 'utf8'));
const output = process.argv[2] || 'dist';
const shell = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
for (const page of pages) {
  if (page.path === 'index.html') continue;
  const target = path.join(output, page.path);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, shell);
}
console.log('React build ready. The Node.js server handles API requests and SPA route fallback.');
