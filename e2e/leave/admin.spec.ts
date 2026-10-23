import { expect, test } from '@playwright/test';
import { loginAs } from '../fixtures/leave-fixtures';

test.describe('Admin Leave Management', () => {
  test('lists requests, filters, and exposes reports', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/leave');
    await expect(page.getByRole('heading', { name: 'Leave Management' })).toBeVisible();
    await page.getByRole('button', { name: 'Apply filters' }).click();
    await expect(page.getByRole('heading', { name: 'Leave requests', exact: true, level: 2 })).toBeVisible();
  });

  test('shows request history when a request is opened', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/leave');
    const review = page.getByRole('button', { name: 'Review' }).first();
    await expect(review).toBeVisible();
    await review.click();
    await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();
  });
});
