import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { readServerConfig } from './config.mjs';
import { DatabaseError, SupabaseAccessCodes } from './supabase.mjs';

export class SupabaseUploadStore {
  constructor({ config, bucket = 'breach-uploads', fetch: transport = globalThis.fetch } = {}) {
    this.config = config;
    this.bucket = bucket;
    this.fetch = transport;
  }
  client() {
    return new SupabaseAccessCodes(this.config || readServerConfig());
  }
  async request(method, endpoint, body, type = 'application/json', { allowMissing = false } = {}) {
    const client = this.client();
    const headers = { apikey: client.key, 'Content-Type': type };
    if (!client.key.startsWith('sb_secret_')) headers.Authorization = `Bearer ${client.key}`;
    let response;
    try {
      response = await this.fetch(`${client.url}/storage/v1/${endpoint}`, {
        method,
        headers,
        body,
        redirect: 'error',
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new DatabaseError('Unable to connect to upload storage.');
    }
    if (allowMissing && [400, 404].includes(response.status)) return null;
    if (!response.ok) throw new DatabaseError('Upload storage request failed.');
    return response;
  }
  async ensureBucket() {
    if (!this.ready)
      this.ready = (async () => {
        if (
          await this.request('GET', `bucket/${this.bucket}`, undefined, undefined, {
            allowMissing: true,
          })
        )
          return;
        await this.request(
          'POST',
          'bucket',
          JSON.stringify({
            id: this.bucket,
            name: this.bucket,
            public: false,
            file_size_limit: 4194304,
          })
        );
      })().catch((error) => {
        this.ready = null;
        throw error;
      });
    await this.ready;
  }
  async save(file, basePath = '') {
    await this.ensureBucket();
    const id = randomUUID();
    const filename =
      path
        .basename(file.name.replaceAll('\\', '/'))
        .replace(/[\x00-\x1f\x7f]/g, '')
        .slice(0, 200) || 'upload';
    const contents = Buffer.from(await file.arrayBuffer());
    const metadata = {
      id,
      filename,
      type: file.type || 'application/octet-stream',
      size: contents.length,
    };
    await this.request(
      'POST',
      `object/${this.bucket}/${id}/content`,
      contents,
      'application/octet-stream'
    );
    try {
      await this.request(
        'POST',
        `object/${this.bucket}/${id}/metadata.json`,
        JSON.stringify(metadata)
      );
    } catch (error) {
      await this.remove(id).catch(() => {});
      throw error;
    }
    return {
      ...metadata,
      contents,
      url: `${basePath}/api/uploads/${id}/${encodeURIComponent(filename)}`,
    };
  }
  async read(id) {
    if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/.test(id)) return null;
    const response = await this.request(
      'GET',
      `object/authenticated/${this.bucket}/${id}/metadata.json`,
      undefined,
      undefined,
      { allowMissing: true }
    );
    if (!response) return null;
    const metadata = await response.json();
    const content = await this.request(
      'GET',
      `object/authenticated/${this.bucket}/${id}/content`,
      undefined,
      undefined,
      { allowMissing: true }
    );
    return content ? { ...metadata, contents: Buffer.from(await content.arrayBuffer()) } : null;
  }
  async remove(id) {
    if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/.test(id)) throw new Error('Invalid upload ID');
    await this.request(
      'DELETE',
      `object/${this.bucket}`,
      JSON.stringify({ prefixes: [`${id}/content`, `${id}/metadata.json`] })
    );
  }
}
