import { expect, test } from '@playwright/test';
import { loginAs, recordCreatedLeaveRequest, testDate } from '../fixtures/leave-fixtures';

const environment = (globalThis as typeof globalThis & { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};

test.describe('Student Leave Management', () => {
  test('lists requests and submits a valid request', async ({ page }) => {
    await loginAs(page, 'student');
    await page.goto('/student/leave');
    await expect(page.getByRole('heading', { name: 'My Leave', exact: true, level: 1 })).toBeVisible();
    await page.getByLabel(/Start date/).fill(testDate('LEAVE_BROWSER_FUTURE_DATE', '2027-03-20'));
    await page.getByLabel(/Total leave days/).fill('1');
    await page.getByLabel(/Reason/).fill(`Browser test ${environment.LEAVE_BROWSER_RUN_MARKER}`);
    const submission = page.waitForResponse(response =>
      response.request().method() === 'POST' && response.url().endsWith('/api/v1/leave-requests')
    );
    await page.getByRole('button', { name: 'Submit leave request' }).click();
    const response = await submission;
    expect(response.ok()).toBe(true);
    const body = await response.json() as { data?: { id?: unknown } };
    await recordCreatedLeaveRequest(body.data?.id);
    await expect(page.getByText('Leave request submitted', { exact: true })).toBeVisible();
  });

  test('requires the form fields before submission', async ({ page }) => {
    await loginAs(page, 'student');
    await page.goto('/student/leave');
    await expect(page.getByRole('button', { name: 'Submit leave request' })).toBeDisabled();
  });
});
