import { expect, test } from '@playwright/test';

test('resident submits a repair request and resolves it', async ({ page }) => {
  await page.goto('/');
  await page.locator('#reporter').fill('Yang Li Si');
  await page.locator('#area').selectOption('Utility');
  await page.locator('#priority').selectOption('urgent');
  await page.locator('#summary').fill('Dryer stops before the cycle ends');
  await page.getByRole('button', { name: 'Submit request' }).click();

  await expect(page.getByRole('status')).toHaveText('Repair request saved.');
  await expect(page.getByText('Dryer stops before the cycle ends')).toBeVisible();
  await page.getByRole('button', { name: 'Mark resolved' }).click();
  await expect(page.locator('.ticket-state')).toHaveText('Resolved');
});
