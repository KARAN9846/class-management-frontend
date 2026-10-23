import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const environment = (globalThis as typeof globalThis & { process?: NodeJS.Process }).process?.env ?? {};

function required(name: string): string {
  const value = environment[name];
  if (!value) throw new Error(`Missing required browser-test cleanup input: ${name}`);
  return value;
}

export default async function globalTeardown(): Promise<void> {
  if (environment.LEAVE_BROWSER_CLEANUP_AFTER_TESTS !== 'true') {
    return;
  }

  const cleanupScript = required('LEAVE_BROWSER_FIXTURE_SCRIPT');
  required('LEAVE_BROWSER_DB_URL');
  required('LEAVE_BROWSER_RUN_MARKER');
  required('LEAVE_BROWSER_MANIFEST_DIR');
  required('LEAVE_BROWSER_MANIFEST_FILE');

  await run('bash', [cleanupScript, 'cleanup'], {
    env: { ...environment },
    windowsHide: true,
  });
}
