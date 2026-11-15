import { expect, type Page } from '@playwright/test';

export async function signInAsDemoUser(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByRole('button', { name: /try the demo/i }).click();
  await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible();
}
