import { spawnSync } from 'node:child_process';
import { createServer as createViteServer } from 'vite';
import { createAppServer } from '../server/index.mjs';
const css = spawnSync(
  process.execPath,
  [
    'node_modules/tailwindcss/lib/cli.js',
    '-i',
    'src/styles.css',
    '-o',
    'public/styles/tailwind.css',
    '--minify',
  ],
  { stdio: 'inherit', windowsHide: true }
);
if (css.status !== 0) process.exit(css.status || 1);
const port = Number(process.env.PORT || 5173);
const basePath = (process.env.VITE_BASE_PATH || '').replace(/\/$/, '');
const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
const server = createAppServer({ middleware: vite.middlewares, basePath });
server.listen(port, '127.0.0.1', () =>
  console.log(`Breach Boulevard: http://127.0.0.1:${port}${basePath}/ (React + Node.js + Supabase)`)
);
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  await vite.close();
  server.closeAllConnections();
  server.close();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
server.on('error', async (error) => {
  console.error(error.message);
  await stop();
  process.exitCode = 1;
});
