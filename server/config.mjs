import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));

export function readServerConfig({ env = process.env, root = projectRoot } = {}) {
  const values = {};
  const filename = env.SUPABASE_CONFIG_FILE || path.join(root, '.env.server');
  if (fs.existsSync(filename)) {
    for (const line of fs.readFileSync(filename, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
      if (match) values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
  return {
    siteUrl: env.SITE_URL || values.SITE_URL || '',
    publishableKey: env.SUPABASE_PUBLISHABLE_KEY || values.SUPABASE_PUBLISHABLE_KEY || '',
    adminPassword: env.ADMIN_PASSWORD || values.ADMIN_PASSWORD || '',
    url: (env.SUPABASE_URL || values.SUPABASE_URL || '').trim(),
    key: (
      env.SUPABASE_SECRET_KEY ||
      env.SUPABASE_SERVICE_ROLE_KEY ||
      values.SUPABASE_SECRET_KEY ||
      values.SUPABASE_SERVICE_ROLE_KEY ||
      ''
    ).trim(),
  };
}
