import { expect, test } from '@playwright/test';
import { loginAs } from '../fixtures/leave-fixtures';

test.describe('Teacher Leave Review', () => {
  test('shows only the teacher review scope and available actions', async ({ page }) => {
    await loginAs(page, 'teacher');
    await page.goto('/teacher/leave/review');
    await expect(page.getByRole('heading', { name: 'Student Leave Requests', exact: true, level: 1 })).toBeVisible();
  });

  test('restricted teacher cannot use the review screen', async ({ page }) => {
    await loginAs(page, 'restrictedTeacher');
    await page.goto('/teacher/leave/review');
    await expect(page.getByText(/permission|access denied|unable to load/i).first()).toBeVisible();
  });
});
