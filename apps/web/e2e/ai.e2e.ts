import { expect, test } from '@playwright/test';
import { signInAsDemoUser } from './support/sign-in';

const jobPosting =
  'Globex busca Senior React Developer en Madrid (híbrido). 45-55k. React, TypeScript, testing.';

test('imports a posting, saves the application and compares it with the CV', async ({ page }) => {
  await signInAsDemoUser(page);

  await page.getByRole('link', { name: 'My CV' }).click();
  await page
    .getByLabel('CV (plain text)')
    .fill('Frontend developer. Angular finance dashboard with TypeScript. React job tracker.');
  await page.getByRole('button', { name: 'Save CV' }).click();
  await expect(page.getByText('CV saved.')).toBeVisible();

  await page.goto('/applications/new');
  await page.getByLabel('Job posting text').fill(jobPosting);
  await page.getByRole('button', { name: 'Extract details' }).click();
  await expect(page.getByText('Form filled in. Review it before saving.')).toBeVisible();
  await expect(page.getByRole('textbox', { name: /^company/i })).toHaveValue('Globex');
  await expect(page.getByRole('textbox', { name: /^location/i })).toHaveValue('Madrid (Hybrid)');

  await page.getByRole('button', { name: 'Create application' }).click();
  await expect(page).toHaveURL('/');

  await page.getByRole('link', { name: 'Edit Senior React Developer' }).click();
  await page.getByRole('button', { name: 'Compare with my CV' }).click();

  const matchPanel = page.getByRole('region', { name: /cv match/i });
  await expect(matchPanel.getByText('Partial match')).toBeVisible();
  await expect(matchPanel.getByText('72', { exact: true })).toBeVisible();
  await expect(matchPanel.getByText('No production React experience')).toBeVisible();
});
