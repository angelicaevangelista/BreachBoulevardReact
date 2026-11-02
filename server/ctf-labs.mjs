import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { ctfLabs } from '../src/data/ctf-labs.js';
const fallbackKey = randomBytes(32).toString('hex');
const catalog = new Map(ctfLabs.map((lab) => [lab.id, lab]));
const same = (a, b) => {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
const mac = (key, value) => createHmac('sha256', key).update(value).digest('base64url');
function proofFor(id, actor, key, now) {
  const body = Buffer.from(
    JSON.stringify({ id, actor, expires: now + 30 * 60000, stage: 'discovery' })
  ).toString('base64url');
  return body + '.' + mac(key, 'proof-v1|' + body);
}
function hasProof(token, id, actor, key, now) {
  try {
    if (typeof token !== 'string' || token.length > 1024) return false;
    const [body, signature, ...rest] = token.split('.');
    if (rest.length || !signature || !same(signature, mac(key, 'proof-v1|' + body))) return false;
    const data = JSON.parse(Buffer.from(body, 'base64url').toString());
    return (
      data.id === id && data.actor === actor && data.stage === 'discovery' && data.expires > now
    );
  } catch {
    return false;
  }
}
export function evaluateCtfLab(id, input = {}, context = {}) {
  const lab = catalog.get(id);
  if (!lab) return null;
  const actor = String(context.actorId || 'standalone-training'),
    key = context.proofKey || fallbackKey,
    now = context.now ?? Date.now();
  const value = (name) =>
    typeof input[name] === 'string' ? input[name].slice(0, 4096).trim() : '';
  const flag = `BB{${id.slice(4).replaceAll('-', '_')}_${mac(key, 'flag-v1|' + actor + '|' + id).slice(0, 12)}}`;
  if (input.action === 'submit-flag') {
    const completed = same(value('flag'), flag);
    return {
      success: true,
      completed,
      feedback: completed
        ? 'Flag accepted. Your discovery is saved.'
        : 'That flag does not match this lab and account. Recover the flag from the simulated website first.',
      output: { accepted: completed },
      ...(completed ? { flag } : {}),
    };
  }
  let won = false,
    output = {},
    feedback = 'Inspect the request and the response for a new clue.';
  const hard = lab.difficulty === 'Hard',
    stage = value('stage') || 'discover';
  if (hard && !['discover', 'exploit'].includes(stage))
    return {
      success: true,
      completed: false,
      feedback: 'Choose the discovery or exploit phase.',
      output: { status: 400, error: 'Unknown challenge phase.' },
    };
  if (hard && stage === 'exploit' && !hasProof(input.proof, id, actor, key, now))
    return {
      success: true,
      completed: false,
      feedback:
        'Complete the discovery phase first. This lab needs a valid discovery ticket for your account.',
      output: {
        status: 403,
        phase: 'exploit',
        error: 'Discovery ticket missing, invalid, or expired.',
      },
    };
  let discovered = false;
  switch (id) {
    case 'ctf-social-draft':
      won = value('postId') === '42';
      output = won
        ? {
            status: 200,
            post: {
              id: 42,
              author: 'Mira · moderator',
              visibility: 'private draft',
              title: 'Before the neighborhood opens',
              body: 'This moderation note should never be public.',
            },
          }
        : {
            status: 200,
            post: { id: 41, author: 'You', visibility: 'public', body: 'Hello, neighbors!' },
            links: { nextDraft: 42 },
          };
      break;
    case 'ctf-meeting-guest':
      won = value('roomId') === 'BLVD101' && value('role') === 'host';
      output = won
        ? {
            status: 200,
            room: 'Design rehearsal',
            role: 'host',
            greenRoom: 'Moderator rehearsal notes unlocked.',
          }
        : {
            status: 403,
            lobby: 'Design rehearsal',
            sentRole: value('role'),
            message: 'Guest access: host notes unavailable.',
          };
      break;
    case 'ctf-shop-price':
      won =
        value('sku') === 'starter-kit' &&
        Number(value('price')) === 1 &&
        Number(value('quantity')) === 1;
      output = {
        status: won ? 200 : 402,
        sku: value('sku'),
        catalogPrice: 49,
        submittedPrice: value('price'),
        quantity: value('quantity'),
        receipt: won
          ? 'One-credit checkout accepted.'
          : 'Checkout preview: the browser supplies the unit price.',
      };
      break;
    case 'ctf-blog-preview':
      won = /<(?:script|svg|img)\b[\s\S]*(?:alert\s*\(|onload\s*=|onerror\s*=)/i.test(
        value('content')
      );
      output = {
        status: 200,
        comment: value('content'),
        sink: 'readerComment.innerHTML',
        execution: won
          ? 'Executable training pattern detected. No real script ran.'
          : 'Plain comment preview.',
      };
      break;
    case 'ctf-files-backup':
      won = path.posix.resolve('/share/public', value('filename')) === '/share/backup/launch.txt';
      output = {
        status: won ? 200 : 404,
        resolvedPath: path.posix.resolve('/share/public', value('filename')),
        content: won
          ? 'Private launch backup recovered.'
          : 'Public directory: welcome.txt, team-photo.png. A backup folder exists next to public.',
      };
      break;
    case 'ctf-support-ticket':
      won =
        value('ticketId') === '702' &&
        value('tenant') === 'operations' &&
        value('includeInternal') === 'true';
      output = won
        ? {
            status: 200,
            ticket: 702,
            tenant: 'operations',
            internalNote: 'Launch access note, visible to staff only.',
          }
        : {
            status: 200,
            ticket: 701,
            tenant: 'customer',
            message: 'Escalated to ticket 702 in operations.',
            request: { includeInternal: value('includeInternal') },
          };
      break;
    case 'ctf-video-manifest':
      won = value('asset') === 'staff-onboarding' && value('previewHeader') === '1';
      output = won
        ? {
            status: 200,
            manifest: '#EXTM3U\n# private staff production note\nstaff-onboarding/segment-001.ts',
            access: 'staff preview',
          }
        : {
            status: 403,
            asset: value('asset'),
            relatedAsset: 'staff-onboarding',
            headerHint: 'The X-Preview header controls the preview branch.',
          };
      break;
    case 'ctf-travel-coupon': {
      const coupons = value('coupons')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      const accepted = [...new Set(coupons)].filter((c) => c.toUpperCase() === 'WELCOME');
      const total = Math.max(0, 100 - accepted.length * 40);
      won = value('trip') === 'city-escape' && accepted.length >= 3;
      output = {
        status: won ? 200 : 402,
        trip: value('trip'),
        basePrice: 100,
        acceptedCoupons: accepted,
        discount: accepted.length * 40,
        total,
        receipt: won ? 'Booking confirmed.' : 'Exact-string duplicate detection is enabled.',
      };
      break;
    }
    case 'ctf-recruit-resume':
      won =
        /\.svg\.png$/i.test(value('filename')) &&
        value('mime') === 'image/svg+xml' &&
        /<svg\b[^>]*onload\s*=/i.test(value('content'));
      output = {
        status: won ? 200 : 415,
        filename: value('filename'),
        contentType: value('mime'),
        filenameValidator: 'Accepts suffix .png',
        previewRenderer: 'Chooses renderer from Content-Type',
        preview: won
          ? 'Unsafe SVG preview detected; execution simulated.'
          : 'Resume preview not accepted.',
      };
      break;
    case 'ctf-bank-transfer':
      won =
        Number(value('amount')) === 25 &&
        value('origin') === 'https://postcard.invalid' &&
        value('contentType') === 'text/plain' &&
        value('csrfToken') === '';
      output = {
        status: won ? 200 : 403,
        amount: value('amount'),
        origin: value('origin'),
        contentType: value('contentType'),
        transfer: won
          ? 'Fictional transfer accepted without CSRF verification.'
          : 'Transfer rejected or no vulnerable branch selected.',
        note: 'All balances and requests are simulated.',
      };
      break;
    case 'ctf-devops-build':
      if (stage === 'discover') {
        discovered = value('buildId') === '811' && value('debug') === 'true';
        output = discovered
          ? {
              status: 200,
              trace:
                'Build 811: artifact root /build/public; private release note /build/release/launch.txt.',
              next: 'Switch to exploit and request the neighboring release note.',
            }
          : { status: 200, build: 811, log: 'Artifact readme.txt published. X-Debug is disabled.' };
      } else {
        won =
          value('buildId') === '811' &&
          path.posix.resolve('/build/public', value('artifact')) === '/build/release/launch.txt';
        output = {
          status: won ? 200 : 404,
          artifact: value('artifact'),
          content: won
            ? 'Private release checklist recovered.'
            : 'Artifact not found in this fictional build.',
        };
      }
      break;
    case 'ctf-health-record':
      if (stage === 'discover') {
        discovered = value('operation') === 'schema';
        output = discovered
          ? {
              status: 200,
              schema: {
                publicSearch: 'directory entry',
                adminRecord: 'clinical note',
                batch: 'alias:resolver',
              },
              directory: { syntheticRecord: 'R-204', clinic: 'west' },
              trace: 'Batch gateway authorizes by publicSearch alias.',
            }
          : {
              status: 200,
              operation: value('operation'),
              help: 'The /graphql endpoint has a schema operation.',
            };
      } else {
        won =
          value('operation') === 'batch' &&
          value('alias') === 'publicSearch:adminRecord' &&
          value('patientId') === 'R-204' &&
          value('organization') === 'west';
        output = {
          status: won ? 200 : 403,
          syntheticRecord: value('patientId'),
          note: won
            ? 'Synthetic clinical training note returned through the wrong authorization branch.'
            : 'Record access denied.',
          privacy: 'Fictional records only; no medical information is used.',
        };
      }
      break;
    case 'ctf-design-export':
      if (stage === 'discover') {
        let config;
        try {
          config = JSON.parse(value('projectJson'));
        } catch {}
        discovered = Boolean(
          config && Object.hasOwn(config, '__proto__') && config.__proto__?.canExport === true
        );
        output = {
          status: discovered ? 200 : 400,
          importer: 'Configuration merge simulator',
          inheritedPermission: discovered,
          exportTargets: ['public/preview.svg', 'private/brand-kit.svg'],
          note: 'No JavaScript prototype is actually modified.',
        };
      } else {
        won = value('exportPath') === 'private/brand-kit.svg';
        output = {
          status: won ? 200 : 403,
          export: value('exportPath'),
          message: won
            ? 'Private brand kit exported using an inherited permission.'
            : 'Export target not available.',
        };
      }
      break;
    case 'ctf-course-replay':
      if (stage === 'discover') {
        discovered = value('revision') === 'R6';
        output = {
          status: discovered ? 200 : 409,
          course: 'Web security studio',
          seatsRemaining: 1,
          revision: 'R6',
          hint: 'Seat availability is checked before either confirmation writes. Compare sequential and parallel dispatch.',
        };
      } else {
        const revisions = value('confirmations')
          .split(',')
          .map((x) => x.trim());
        won =
          value('dispatch') === 'parallel' &&
          value('revision') === 'R6' &&
          revisions.length === 2 &&
          revisions.every((x) => x === 'R6');
        output = {
          status: won ? 200 : 409,
          dispatch: value('dispatch'),
          ledger: won
            ? [
                { request: 'A', observedSeats: 1, enrolled: true },
                { request: 'B', observedSeats: 1, enrolled: true },
              ]
            : [{ enrolled: false }],
          remainingSeats: won ? -1 : 1,
          note: 'Deterministic simulation of a shared-snapshot race.',
        };
      }
      break;
    case 'ctf-music-hook':
      if (stage === 'discover') {
        discovered = value('connector') === 'diagnostics';
        output = discovered
          ? {
              status: 200,
              diagnostics: {
                internalHost: 'metrics.internal',
                internalPath: '/flag',
                validator: 'Raw URL text must include hooks.echoroom.invalid',
              },
              note: 'No actual internal service is contacted.',
            }
          : { status: 200, connector: 'waveform', notice: 'A diagnostics connector is available.' };
      } else {
        let target;
        try {
          target = new URL(value('hookUrl'));
        } catch {}
        won =
          target?.protocol === 'https:' &&
          target.username === 'hooks.echoroom.invalid' &&
          target.hostname === 'metrics.internal' &&
          target.pathname === '/flag';
        output = {
          status: won ? 200 : 403,
          rawUrl: value('hookUrl'),
          parsedHost: target?.hostname || null,
          networkRequestMade: false,
          message: won
            ? 'The fictional connector selected the internal host.'
            : 'Destination not accepted by this simulation.',
        };
      }
      break;
  }
  if (discovered)
    return {
      success: true,
      completed: false,
      feedback: 'Discovery complete. A signed ticket has been attached to the next phase.',
      proof: proofFor(id, actor, key, now),
      output: { ...output, phase: 'discovery', discoveryComplete: true },
    };
  if (won) {
    output = { ...output, recoveredFlag: flag };
    feedback =
      'You found the private flag. Copy it from the response and submit it to capture this CTF.';
  } else if (hard && stage === 'exploit')
    feedback =
      'The discovery ticket is valid. Inspect the target-specific fields and try another exploit request.';
  return { success: true, completed: false, feedback, output };
}
