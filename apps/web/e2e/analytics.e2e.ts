import { expect, test } from '@playwright/test';
import { signInAsDemoUser } from './support/sign-in';

test('shows search metrics and the weekly chart as a table', async ({ page }) => {
  await signInAsDemoUser(page);
  await page.getByRole('link', { name: 'Analytics' }).click();

  await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible();
  await expect(page.getByText('Response rate')).toBeVisible();
  await expect(page.getByRole('list', { name: 'Application funnel' })).toBeVisible();

  await page.getByRole('button', { name: 'Show as table' }).click();
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(13);
});

test('opens the notifications panel from the header', async ({ page }) => {
  await signInAsDemoUser(page);

  await page.getByRole('button', { name: /^notifications/i }).click();
  await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Notifications' })).toBeHidden();
});
