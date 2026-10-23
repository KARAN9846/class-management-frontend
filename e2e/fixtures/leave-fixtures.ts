import { appendFile, readFile } from 'node:fs/promises';
import { expect, type Page } from '@playwright/test';

export type LeaveRole = 'admin' | 'teacher' | 'restrictedTeacher' | 'student';
const environment = (globalThis as typeof globalThis & { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};

const credentials: Record<LeaveRole, string> = {
  admin: 'LEAVE_BROWSER_ADMIN_EMAIL',
  teacher: 'LEAVE_BROWSER_TEACHER_EMAIL',
  restrictedTeacher: 'LEAVE_BROWSER_RESTRICTED_TEACHER_EMAIL',
  student: 'LEAVE_BROWSER_STUDENT_EMAIL',
};

export async function loginAs(page: Page, role: LeaveRole): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill(environment[credentials[role]]!);
  await page.getByLabel('Password', { exact: true }).fill(environment.LEAVE_BROWSER_TEST_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).not.toHaveURL(/\/login$/);
}

export function testDate(name: string, fallback: string): string {
  return environment[name] ?? fallback;
}

export async function recordCreatedLeaveRequest(id: unknown): Promise<void> {
  const marker = environment.LEAVE_BROWSER_RUN_MARKER;
  const email = environment.LEAVE_BROWSER_STUDENT_EMAIL;
  const manifestFile = environment.LEAVE_BROWSER_MANIFEST_FILE;
  if (!marker || !email || !manifestFile) {
    throw new Error('Browser-test manifest inputs are incomplete; refusing to record a created request.');
  }
  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id < 1) {
    throw new Error('Leave submission did not return a valid request ID; refusing unscoped cleanup.');
  }

  const current = await readFile(manifestFile, 'utf8');
  const row = `browser-request|${id}|${marker}|${email}`;
  if (current.split('\n').some(line => line === row)) {
    throw new Error('The created request is already recorded in the run manifest.');
  }
  await appendFile(manifestFile, `${row}\n`, 'utf8');
}
