import { missionCases, findMission, emptyMissionState } from '../src/data/missions.js';
import { SupabaseAccessCodes } from './supabase.mjs';
export class MissionError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const answers = {
  'paper-trail': 'id-permission',
  'staff-room': 'tenant-fields',
  'last-frame': 'server-preview',
  'one-credit': 'trusted-price',
  'three-welcomes': 'normalize-first',
  'unexpected-postcard': 'csrf-check',
  'build-scraps': 'trace-traversal',
  'borrowed-permission': 'inherited-permission',
  'wrong-destination': 'parsed-host',
};
function normalize(caseFile, raw = {}) {
  const allFiles = caseFile.chapters.flatMap((c) => c.evidence.map((e) => e.id));
  const allReplies = caseFile.chapters.flatMap((c) => c.replies.map((r) => r.id));
  const list = (value, allowed) =>
    Array.isArray(value) ? [...new Set(value.filter((v) => allowed.includes(v)))] : [];
  const solved = [],
    storedSolved = Array.isArray(raw.solved) ? raw.solved : [];
  for (const chapter of caseFile.chapters) {
    if (storedSolved.includes(chapter.id)) solved.push(chapter.id);
    else break;
  }
  return {
    pinned: list(raw.pinned, allFiles),
    replies: list(raw.replies, allReplies),
    solved,
    note: typeof raw.note === 'string' ? raw.note.slice(0, 1200) : '',
  };
}
export class SupabaseMissionStore {
  client() {
    return (this.database ||= SupabaseAccessCodes.fromEnvironment());
  }
  async list(userId) {
    return (
      (await this.client().request(
        'GET',
        'breach_mission_progress?select=case_id,revision,state&user_id=eq.' +
          encodeURIComponent(userId)
      )) || []
    );
  }
  async save(userId, caseId, revision, state) {
    const result = await this.client().request('POST', 'rpc/bb_save_mission_progress', {
      p_user_id: userId,
      p_case_id: caseId,
      p_revision: revision,
      p_state: state,
    });
    return result?.[0] || null;
  }
}
export function createMissionService({ store = new SupabaseMissionStore() } = {}) {
  const rowsFor = async (userId) => {
    const rows = await store.list(userId);
    return missionCases.map((c) => {
      const row = rows.find((r) => r.case_id === c.id);
      return {
        caseId: c.id,
        revision: row?.revision || 0,
        state: normalize(c, row?.state || emptyMissionState()),
      };
    });
  };
  return async ({ userId, completed = [], method = 'GET', input = {} }) => {
    if (!userId) throw new MissionError(401, 'Sign in to open your case desk.');
    const cases = await rowsFor(userId);
    if (method === 'GET') return { cases, completed };
    const caseFile = findMission(input.caseId);
    if (!caseFile) throw new MissionError(404, 'That case file was not found.');
    const current = cases.find((c) => c.caseId === caseFile.id);
    if (!Number.isSafeInteger(input.revision) || input.revision < 0)
      throw new MissionError(400, 'A valid case revision is required.');
    if (input.revision !== current.revision)
      throw new MissionError(
        409,
        'This case changed in another window. Your desk has refreshed; please try again.'
      );
    const state = structuredClone(current.state);
    let feedback = 'Case file saved.',
      correct;
    if (input.type === 'note') {
      if (typeof input.text !== 'string' || input.text.length > 1200)
        throw new MissionError(400, 'Keep your case note under 1,200 characters.');
      state.note = input.text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
      feedback = 'Notebook saved to your account.';
    } else {
      const index = caseFile.chapters.findIndex((c) => c.id === input.chapterId),
        chapter = caseFile.chapters[index];
      if (!chapter || index > state.solved.length)
        throw new MissionError(
          403,
          'Finish the previous chapter before opening this part of the case.'
        );
      if (input.type === 'pin') {
        const evidence = chapter.evidence.find((e) => e.id === input.evidenceId);
        if (!evidence) throw new MissionError(400, 'Choose an evidence file from this chapter.');
        if (evidence.afterLab && !completed.includes(chapter.labId))
          throw new MissionError(403, 'Complete the linked lab to recover this evidence.');
        if (typeof input.pinned !== 'boolean')
          throw new MissionError(400, 'Choose whether to pin this evidence.');
        if (!input.pinned && state.solved.includes(chapter.id))
          throw new MissionError(400, 'Evidence from a closed chapter stays filed.');
        state.pinned = input.pinned
          ? [...new Set([...state.pinned, evidence.id])]
          : state.pinned.filter((id) => id !== evidence.id);
        feedback = input.pinned ? 'Evidence pinned to your board.' : 'Evidence unpinned.';
      } else if (input.type === 'reply') {
        const reply = chapter.replies.find((r) => r.id === input.replyId);
        if (!reply) throw new MissionError(400, 'Choose a reply from this conversation.');
        state.replies = [...new Set([...state.replies, reply.id])];
        feedback = 'New message received.';
      } else if (input.type === 'deduce') {
        if (!chapter.choices.some((c) => c.id === input.choiceId))
          throw new MissionError(400, 'Choose one of the case deductions.');
        if (
          !completed.includes(chapter.labId) ||
          !chapter.evidence.every((e) => state.pinned.includes(e.id))
        )
          throw new MissionError(
            409,
            'Complete the linked lab and pin all three clues before filing your deduction.'
          );
        correct = input.choiceId === answers[chapter.id];
        if (!correct)
          return {
            case: current,
            correct: false,
            feedback:
              'That connection doesn’t explain all the evidence. Compare the request boundary with the recovered file, then try again.',
          };
        state.solved = [...new Set([...state.solved, chapter.id])];
        feedback =
          state.solved.length === caseFile.chapters.length
            ? 'Case closed. Your final report is ready.'
            : 'Connection confirmed. A new chapter and phone message are ready.';
      } else throw new MissionError(400, 'That case action is not supported.');
    }
    const saved = await store.save(userId, caseFile.id, current.revision, state);
    if (!saved)
      throw new MissionError(
        409,
        'This case changed in another window. Your desk has refreshed; please try again.'
      );
    return {
      case: {
        caseId: caseFile.id,
        revision: saved.revision,
        state: normalize(caseFile, saved.state),
      },
      feedback,
      ...(correct === undefined ? {} : { correct }),
    };
  };
}
