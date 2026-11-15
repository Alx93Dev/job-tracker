import { expect, test } from '@playwright/test';

const testPassword = 'e2e-test-password-123';

test.describe('authentication', () => {
  test('sends signed-out visitors to the login page and back after signing up', async ({
    page,
  }) => {
    const email = `e2e-${Date.now()}@example.test`;

    await page.goto('/?view=list');
    await expect(page).toHaveURL(/\/login\?next=%2F%3Fview%3Dlist$/);

    await page.getByRole('link', { name: 'Create an account' }).click();
    await page.getByLabel('Name').fill('E2E Tester');
    await page.getByRole('textbox', { name: /^email/i }).fill(email);
    await page.getByLabel(/^password/i).fill(testPassword);
    await page.getByLabel(/^confirm password/i).fill(testPassword);
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('E2E Tester')).toBeVisible();

    await page.getByRole('button', { name: 'List' }).click();
    await expect(page.getByText(/no applications yet/i)).toBeVisible();

    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page).toHaveURL('/login');

    await page.getByRole('textbox', { name: /^email/i }).fill(email);
    await page.getByLabel(/^password/i).fill(testPassword);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('heading', { name: 'Applications' })).toBeVisible();
  });

  test('rejects wrong credentials with a generic message', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: /^email/i }).fill('nobody@example.test');
    await page.getByLabel(/^password/i).fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Next.js adds its own empty role=alert route announcer, so match the message itself.
    await expect(
      page.getByRole('alert').filter({ hasText: 'Invalid email or password' }),
    ).toBeVisible();
  });
});
