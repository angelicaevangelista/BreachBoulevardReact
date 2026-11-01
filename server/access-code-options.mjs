export class AccessCodeInputError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
  }
}

// Calendar months/years keep the day where possible and clamp at month-end.
function addMonths(date, months) {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)
  ).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

export function accessCodeOptions(input = {}, now = new Date()) {
  const duration = input.duration ?? '1-day';
  const codeMode = input.codeMode ?? 'random';
  if (!['random', 'custom'].includes(codeMode))
    throw new AccessCodeInputError('Choose a random or custom access code.');
  let code;
  if (codeMode === 'custom') {
    code = typeof input.code === 'string' ? input.code.trim() : '';
    if (!/^[A-Za-z0-9_-]{3,64}$/.test(code))
      throw new AccessCodeInputError(
        'Custom codes need 3–64 letters, numbers, hyphens, or underscores.'
      );
  }
  let expires;
  switch (duration) {
    case '1-day':
      expires = new Date(now.getTime() + 86400000);
      break;
    case '7-days':
      expires = new Date(now.getTime() + 7 * 86400000);
      break;
    case '1-month':
      expires = addMonths(now, 1);
      break;
    case '6-months':
      expires = addMonths(now, 6);
      break;
    case '1-year':
      expires = addMonths(now, 12);
      break;
    case 'custom': {
      if (
        typeof input.expiresAt !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(input.expiresAt)
      )
        throw new AccessCodeInputError('Choose a valid expiration date and time.');
      expires = new Date(input.expiresAt);
      if (
        !Number.isFinite(expires.getTime()) ||
        expires.toISOString().slice(0, 10) !== input.expiresAt.slice(0, 10)
      )
        throw new AccessCodeInputError('Choose a valid expiration date and time.');
      break;
    }
    default:
      throw new AccessCodeInputError('Choose one of the available expiration options.');
  }
  if (expires.getTime() <= now.getTime())
    throw new AccessCodeInputError('The expiration must be in the future.');
  return { code, expiresAt: expires.toISOString() };
}
