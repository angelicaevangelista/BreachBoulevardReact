import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SupabaseUploadStore } from '../server/supabase-uploads.mjs';

test('serverless uploads persist in a private Supabase bucket and remain readable across instances', async () => {
  const objects = new Map();
  let bucketExists = false;
  const calls = [];
  const transport = async (url, options) => {
    const route = new URL(url).pathname.replace('/storage/v1/', '');
    calls.push({ route, ...options });
    if (route === 'bucket/breach-uploads')
      return new Response(bucketExists ? '{}' : '{}', { status: bucketExists ? 200 : 404 });
    if (route === 'bucket') {
      const data = JSON.parse(options.body);
      assert.equal(data.public, false);
      bucketExists = true;
      return new Response('{}');
    }
    if (options.method === 'POST' && route.startsWith('object/breach-uploads/')) {
      objects.set(route.replace('object/', ''), options.body);
      return new Response('{}');
    }
    if (options.method === 'GET' && route.startsWith('object/authenticated/')) {
      const value = objects.get(route.replace('object/authenticated/', ''));
      return new Response(value ?? '{}', { status: value === undefined ? 404 : 200 });
    }
    if (options.method === 'DELETE') {
      for (const key of JSON.parse(options.body).prefixes) objects.delete('breach-uploads/' + key);
      return new Response('{}');
    }
    return new Response('{}', { status: 404 });
  };
  const config = { url: 'https://example.supabase.co', key: 'sb_secret_test_only' };
  const first = new SupabaseUploadStore({ config, fetch: transport });
  const uploaded = await first.save({
    name: 'example.txt',
    type: 'text/plain',
    async arrayBuffer() {
      return Buffer.from('persistent upload');
    },
  });
  const second = new SupabaseUploadStore({ config, fetch: transport });
  const restored = await second.read(uploaded.id);
  assert.equal(restored.contents.toString(), 'persistent upload');
  assert.equal(restored.filename, 'example.txt');
  await second.remove(uploaded.id);
  assert.equal(await second.read(uploaded.id), null);
  assert.ok(calls.every((call) => call.headers.apikey === 'sb_secret_test_only'));
  assert.ok(calls.every((call) => !call.headers.Authorization));
});
