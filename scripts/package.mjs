import fs from 'node:fs/promises';
import path from 'node:path';
const output = path.resolve('release/BreachBoulevardReact-Node');
await fs.mkdir(output, { recursive: true });
for (const directory of ['dist', 'server'])
  await fs.cp(directory, path.join(output, directory), { recursive: true });
await fs.cp('src/data', path.join(output, 'src/data'), { recursive: true });
await fs.copyFile('SECURITY.md', path.join(output, 'SECURITY.md'));
await fs.copyFile('.env.server.example', path.join(output, '.env.server.example'));
await fs.copyFile('package-lock.json', path.join(output, 'package-lock.json'));
const sourcePackage = JSON.parse(await fs.readFile('package.json', 'utf8'));
await fs.writeFile(
  path.join(output, 'package.json'),
  JSON.stringify(
    {
      ...sourcePackage,
      private: true,
      type: 'module',
      devDependencies: undefined,
      scripts: { start: 'node server/index.mjs' },
    },
    null,
    2
  ) + '\n'
);
await fs.writeFile(
  path.join(output, 'README.md'),
  `# Breach Boulevard\n\nRequires Node.js 22 or newer. No PHP, Apache, or XAMPP is required. Run npm ci --omit=dev before npm start to install the Supabase Auth runtime.\n\nCopy .env.server.example to .env.server and configure the existing Supabase project URL and server secret key, or set server environment variables. Credentials are not included in this package.\n\nRun npm start and open http://127.0.0.1:5173/. React, the API, uploads, and route fallback run in one Node.js server. Uploaded files persist in .data/uploads. Uploaded script execution is an explicit teaching simulation.\n`
);
console.log(`Node runtime package prepared: ${output}`);
