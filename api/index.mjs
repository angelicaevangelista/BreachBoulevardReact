import { createApiHandler } from '../server/api.mjs';
import { AdminAuth } from '../server/admin-auth.mjs';
import { readServerConfig } from '../server/config.mjs';
import { SupabaseUploadStore } from '../server/supabase-uploads.mjs';
import { SupabaseCommunityStore } from '../server/community.mjs';
const handler = createApiHandler({
  uploadStore: new SupabaseUploadStore(),
  communityStore: new SupabaseCommunityStore(),
  maxUploadBytes: 4 * 1024 * 1024,
  adminAuth: new AdminAuth({ password: readServerConfig().adminPassword, required: true }),
});
export default async function vercelHandler(req, res) {
  const url = new URL(req.url, 'https://localhost');
  const route = req.query?.__route || url.searchParams.get('__route');
  if (typeof route === 'string') {
    url.searchParams.delete('__route');
    req.url = '/api/' + route + (url.searchParams.size ? '?' + url.searchParams.toString() : '');
  }
  if (!(await handler(req, res))) {
    res.statusCode = 404;
    res.end('API route not found.');
  }
}
