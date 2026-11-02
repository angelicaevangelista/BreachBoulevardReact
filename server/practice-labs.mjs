import { evaluateCtfLab } from './ctf-labs.mjs';
import path from 'node:path';
export function evaluatePracticeLab(id, input = {}, context = {}) {
  if (id.startsWith('ctf-')) return evaluateCtfLab(id, input, context);
  const value = (name) => (typeof input[name] === 'string' ? input[name].slice(0, 4096) : '');
  let completed = false,
    output,
    feedback,
    flag;
  switch (id) {
    case 'sql-injection': {
      const username = value('username'),
        password = value('password');
      const injected = (text) => /'\s*(?:or\s+(?:'1'\s*=\s*'1|1\s*=\s*1)|or\s+true)/i.test(text);
      completed = injected(username) || injected(password);
      output = {
        query: `SELECT * FROM users WHERE username = '${username}' AND password = '${password}';`,
        authenticated: completed,
      };
      feedback = completed
        ? 'The input changed the query condition. The simulated login was bypassed.'
        : 'Login failed. Inspect the query and try changing its logic.';
      flag = 'BB{query_logic_changed}';
      break;
    }
    case 'xss': {
      const payload = value('payload');
      completed =
        /<script\b[^>]*>[\s\S]*?alert\s*\(/i.test(payload) ||
        /\bon(?:error|load|click)\s*=\s*["']?[^>]*alert\s*\(/i.test(payload) ||
        /javascript:\s*alert\s*\(/i.test(payload);
      output = {
        reflectedHtml: payload,
        sink: 'comment.innerHTML',
        simulatedExecution: completed
          ? 'alert(...) would run in an unsafe renderer.'
          : 'No executable training pattern detected.',
      };
      feedback = completed
        ? 'The unsafe sink would interpret your markup as script. Execution is simulated in this lab.'
        : 'The comment was reflected. Try a script tag or an event-handler attribute.';
      flag = 'BB{unsafe_comment_sink}';
      break;
    }
    case 'authentication': {
      completed =
        value('username').toLowerCase() === 'trainee' && value('password') === 'welcome123';
      output = { account: value('username'), authenticated: completed };
      feedback = completed
        ? 'The unchanged default password allowed access to the fictional account.'
        : 'Incorrect training credentials. Check the hints for the default-password clue.';
      flag = 'BB{defaults_are_credentials}';
      break;
    }
    case 'idor': {
      const invoices = {
        101: { id: 101, owner: 'trainee', item: 'Web security workshop', amount: '49.00' },
        102: { id: 102, owner: 'trainer', item: 'Instructor materials', amount: '129.00' },
      };
      const invoice = invoices[value('invoiceId')];
      completed = Boolean(invoice && invoice.owner !== 'trainee');
      output = invoice || { error: 'Fictional invoice not found.' };
      feedback = completed
        ? 'The lookup returned another account’s invoice without checking ownership.'
        : invoice
          ? 'This invoice belongs to your own training account. Try another ID.'
          : 'Try an invoice ID close to the one already provided.';
      flag = 'BB{object_ids_are_not_permissions}';
      break;
    }
    case 'path-traversal': {
      const requested = path.posix.resolve('/app/public', value('filename'));
      const files = {
        '/app/public/welcome.txt': 'Welcome to the fictional file viewer.',
        '/app/secrets/mission.txt': 'Training mission: enforce the allowed directory boundary.',
      };
      completed = requested === '/app/secrets/mission.txt';
      output = {
        resolvedPath: requested,
        content: files[requested] || 'Fictional file not found. No real server file is read.',
      };
      feedback = completed
        ? 'The path escaped the simulated public directory and reached the mission file.'
        : 'Use a parent-directory segment to leave /app/public.';
      flag = 'BB{directory_boundary_missing}';
      break;
    }
    case 'data-exposure': {
      let endpoint;
      try {
        endpoint = new URL(value('endpoint'), 'https://training.invalid');
      } catch {}
      completed =
        endpoint?.pathname === '/profile' && endpoint.searchParams.get('debug') === 'true';
      output =
        endpoint?.pathname === '/profile'
          ? {
              id: 1001,
              name: 'Training Student',
              ...(completed
                ? { debug: true, api_key: 'demo_training_key_7', note: 'Fictional data only.' }
                : {}),
            }
          : { error: 'Fictional endpoint not found.' };
      feedback = completed
        ? 'Debug mode exposed a demo-only API key in the profile response.'
        : 'Inspect optional profile query parameters.';
      flag = 'BB{debug_fields_leak_data}';
      break;
    }
    default:
      return null;
  }
  return { success: true, completed, feedback, output, ...(completed ? { flag } : {}) };
}
