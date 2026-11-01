import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]
  );

export class UploadStore {
  constructor(directory) {
    this.directory = path.resolve(directory);
  }
  async save(file, basePath = '', ownerId) {
    const id = randomUUID();
    const filename =
      path
        .basename(file.name.replaceAll('\\', '/'))
        .replace(/[\x00-\x1f\x7f]/g, '')
        .slice(0, 200) || 'upload';
    const contents = Buffer.from(await file.arrayBuffer());
    await fs.mkdir(this.directory, { recursive: true });
    const metadata = {
      ...(ownerId ? { ownerId } : {}),
      id,
      filename,
      type: file.type || 'application/octet-stream',
      size: contents.length,
    };
    await fs.writeFile(path.join(this.directory, `${id}.bin`), contents, { flag: 'wx' });
    await fs.writeFile(path.join(this.directory, `${id}.json`), JSON.stringify(metadata), {
      flag: 'wx',
    });
    return {
      ...metadata,
      url: `${basePath}/api/uploads/${id}/${encodeURIComponent(filename)}`,
      contents,
    };
  }
  async read(id) {
    if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/.test(id)) return null;
    try {
      const metadata = JSON.parse(
        await fs.readFile(path.join(this.directory, `${id}.json`), 'utf8')
      );
      return { ...metadata, contents: await fs.readFile(path.join(this.directory, `${id}.bin`)) };
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }
}

export function simulateFileExecution(contents) {
  const source = contents.toString('utf8').slice(0, 100000);
  const output = [];
  // Recognize a few literal echo statements for the teaching example only.
  // Uploaded source is never evaluated, imported, or passed to a process.
  for (const match of source.matchAll(/\becho\s+(["'])((?:\\.|(?!\1)[\s\S])*?)\1\s*;/g)) {
    output.push(
      match[2].replace(
        /\\([\\'"nrt])/g,
        (_, character) => ({ n: '\n', r: '\r', t: '\t' })[character] || character
      )
    );
  }
  if (/\bdate\s*\(/.test(source))
    output.push(`<p>The current server time is: ${new Date().toISOString()} (simulated)</p>`);
  if (/\bphpinfo\s*\(/.test(source))
    output.push(
      '<pre>JavaScript simulation: no PHP interpreter or server environment is exposed.</pre>'
    );
  return (
    '<h2>Simulated file execution</h2><p>This lab simulates the uploaded script; its source is not executed on the server.</p>' +
    (output.join('') || '<p>No literal output to simulate.</p>')
  );
}
