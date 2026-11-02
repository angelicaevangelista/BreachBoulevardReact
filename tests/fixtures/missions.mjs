export function memoryMissionStore() {
  const rows = new Map();
  return {
    async list(user) {
      return [...rows.entries()]
        .filter(([k]) => k.startsWith(user + '|'))
        .map(([, v]) => structuredClone(v));
    },
    async save(user, caseId, revision, state) {
      const key = user + '|' + caseId,
        previous = rows.get(key);
      if ((previous?.revision || 0) !== revision) return null;
      const row = { case_id: caseId, revision: revision + 1, state: structuredClone(state) };
      rows.set(key, row);
      return structuredClone(row);
    },
  };
}
