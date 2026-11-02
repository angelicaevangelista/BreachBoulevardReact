import { practiceLabs } from '../src/data/practice-labs.js';
import { honeyConversation } from './honey-conversation.mjs';

const MAX_MESSAGE_LENGTH = 500;
const OFF_TOPIC_REPLY =
  'My little bee brain knows Breach Boulevard, labs, streaks, and a little friendly chat. Try asking how I am, my favorite color, or for a lab hint!';
const IDENTITY_REPLY =
  "I'm Honey, the AI helper bee inside Breach Boulevard. I use built-in replies to chat, explain lab objectives, share hints one at a time, and cheer you on. Ask about my favorite color, the Streak Garden, or your next little discovery!";
const PLATFORM_REPLY =
  'Breach Boulevard is a hands-on practice platform for web security. Pick a lab, read its objective, and work through it. Use hints one at a time when you are stuck. Signed-in progress is saved to your account.';
const ANSWER_PREFIX = "I won't hand over the answer, but here's a nudge: ";
const NO_LAB_HINT =
  'Pick a lab first, then I can give you a hint for it. Ask me which labs there are.';
const NO_LAB_OBJECTIVE = "Pick a lab and I'll tell you its objective. Ask me which labs there are.";

const answerPattern =
  /\b(answer|solution|flag|password|payload|exact (input|string)|just tell me)\b/;
const intentPatterns = [
  [
    'identity',
    /\b(who are you|who is honey|what are you|what can you do|your name|introduce yourself)\b/,
  ],
  [
    'catalog',
    /\b(which labs|what labs|list (the )?labs|lab list|catalog|all labs|what can i (do|try|practice))\b/,
  ],
  ['objective', /\b(objective|goal|what am i (doing|supposed to do)|what do i need to do)\b/],
  [
    'help',
    /\b(stuck|hints?|clue|nudge|what now|what do i do|what should i do|confused|i'?m lost|i don'?t know|next hint|next step|what'?s next|another hint|more hints?|how do i (solve|start|beat|crack|get past))\b/,
  ],
  [
    'platform',
    /\b(platform|breach boulevard|this site|this website|progress|sign ?in|log ?in|account|how does (this|it) work)\b/,
  ],
];

const failure = (status, message) => ({ status, body: { success: false, message } });

function createRateLimiter({ limit, windowMs, now }) {
  const buckets = new Map();
  return (client) => {
    const current = now();
    const bucket = buckets.get(client);
    if (!bucket || current >= bucket.resetAt) {
      buckets.set(client, { count: 1, resetAt: current + windowMs });
      return true;
    }
    if (bucket.count >= limit) return false;
    bucket.count += 1;
    return true;
  };
}

function parseInput(input) {
  const message = typeof input.message === 'string' ? input.message.trim() : '';
  if (!message) return { error: 'Type a message for Honey.' };
  if (message.length > MAX_MESSAGE_LENGTH)
    return { error: `Keep messages under ${MAX_MESSAGE_LENGTH} characters.` };
  const labId = input.labId ?? '';
  if (labId !== '' && !practiceLabs.some((lab) => lab.id === labId))
    return { error: 'Honey does not know that practice lab.' };
  const hintIndex = input.hintIndex ?? 0;
  if (!Number.isInteger(hintIndex) || hintIndex < 0)
    return { error: 'hintIndex must be a non-negative whole number.' };
  return { message, labId: labId || null, hintIndex };
}

function respond({ message, labId, hintIndex }) {
  const text = message.toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, ' ');
  const lab = labId ? practiceLabs.find((item) => item.id === labId) : null;
  const lastHint = lab ? lab.hints.length - 1 : 0;
  const index = lab ? Math.min(hintIndex, lastHint) : 0;
  const intent = intentPatterns.find(([, pattern]) => pattern.test(text))?.[0] ?? null;
  const conversation = honeyConversation(text);
  const wantsHint = intent === 'help' || (!intent && !conversation && answerPattern.test(text));

  if (intent === 'identity')
    return { reply: IDENTITY_REPLY, nextHintIndex: index, hasMoreHints: false };
  if (intent === 'catalog') {
    const titles = practiceLabs.map((item) => item.title).join('; ');
    return {
      reply: `Breach Boulevard has ${practiceLabs.length} labs: ${titles}. Tell me which one you're on and I'll help with its objective or the next hint.`,
      nextHintIndex: index,
      hasMoreHints: false,
    };
  }
  if (intent === 'objective') {
    return {
      reply: lab ? `Objective: ${lab.objective}` : NO_LAB_OBJECTIVE,
      nextHintIndex: index,
      hasMoreHints: Boolean(lab) && index < lastHint,
    };
  }
  if (wantsHint) {
    if (!lab) return { reply: NO_LAB_HINT, nextHintIndex: 0, hasMoreHints: false };
    const prefix = answerPattern.test(text) ? ANSWER_PREFIX : '';
    return {
      reply: `${prefix}${lab.hints[index]}`,
      nextHintIndex: Math.min(index + 1, lastHint),
      hasMoreHints: index < lastHint,
    };
  }
  if (conversation)
    return {
      reply: conversation,
      nextHintIndex: index,
      hasMoreHints: Boolean(lab) && index < lastHint,
    };
  if (intent === 'platform')
    return { reply: PLATFORM_REPLY, nextHintIndex: index, hasMoreHints: false };
  return {
    reply: OFF_TOPIC_REPLY,
    nextHintIndex: index,
    hasMoreHints: Boolean(lab) && index < lastHint,
  };
}

export function createHoneyService({ now = Date.now, rateLimit = 20, windowMs = 60_000 } = {}) {
  const allowRequest = createRateLimiter({ limit: rateLimit, windowMs, now });
  return {
    async chat({ client, input }) {
      if (!allowRequest(client))
        return failure(429, 'Honey needs a short breather. Try again in a minute.');
      const parsed = parseInput(input);
      if (parsed.error) return failure(400, parsed.error);
      return { status: 200, body: { success: true, ...respond(parsed) } };
    },
  };
}
