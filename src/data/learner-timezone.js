export function learnerTimeZoneHeaders() {
  try {
    return { 'X-Learner-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone };
  } catch {
    return {};
  }
}
