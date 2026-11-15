import { expect, test } from '@playwright/test';
import { signInAsDemoUser } from './support/sign-in';

test.describe('kanban board', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsDemoUser(page);
  });

  test('moves a card to the next column with the keyboard', async ({ page }) => {
    const appliedColumn = page.getByRole('region', { name: /^applied/i });
    const dragHandle = page.getByRole('button', { name: 'Move React Developer at Initech' });
    await expect(
      page
        .getByRole('region', { name: /^wishlist/i })
        .getByRole('article', { name: 'React Developer', exact: true }),
    ).toBeVisible();

    await dragHandle.focus();
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');

    await expect(
      appliedColumn.getByRole('article', { name: 'React Developer', exact: true }),
    ).toBeVisible();

    await page.reload();
    await expect(
      page
        .getByRole('region', { name: /^applied/i })
        .getByRole('article', { name: 'React Developer', exact: true }),
    ).toBeVisible();
  });

  test('flags overdue follow-ups on their cards', async ({ page }) => {
    const acmeCard = page
      .getByRole('article')
      .filter({ has: page.getByRole('button', { name: 'Move Frontend Developer at Acme Corp' }) });

    await expect(acmeCard.getByText('Follow up')).toBeVisible();
  });

  test('filters applications with the search box', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search applications' }).fill('globex');

    await expect(
      page.getByRole('button', { name: 'Move Angular Developer at Globex' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Move UI Engineer at Umbrella' })).toBeHidden();
  });
});
