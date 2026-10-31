import { SupabaseAccessCodes } from '../server/supabase.mjs';
try {
  await SupabaseAccessCodes.fromEnvironment().checkConnection();
  console.log('Supabase connection and access-code table verified.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
