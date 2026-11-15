import { expect, test } from '@playwright/test';
import { setApplicationStatus } from './support/job-applications';
import { signInAsDemoUser } from './support/sign-in';

test.describe('kanban board', () => {
  test.beforeEach(async ({ page }) => {
    await signInAsDemoUser(page);
  });

  test('moves a card to the next column with the keyboard', async ({ page }) => {
    const appliedColumn = page.getByRole('region', { name: /^applied/i });
    const dragHandle = page.getByRole('button', { name: 'Move React Developer at Initech' });
    const dragAnnouncements = page.locator('[id^="DndLiveRegion"]');
    await setApplicationStatus(
      page,
      { positionTitle: 'React Developer', companyName: 'Initech' },
      'WISHLIST',
    );
    await page.reload();
    await expect(
      page
        .getByRole('region', { name: /^wishlist/i })
        .getByRole('article', { name: 'React Developer', exact: true }),
    ).toBeVisible();

    // The keyboard sensor starts listening only after the pick-up has been processed, so
    // each key waits for the screen reader announcement of the previous step, as a
    // keyboard user would. Once the card is up, the board announces its current column.
    await dragHandle.focus();
    await page.keyboard.press('Space');
    await expect(dragAnnouncements).toHaveText('Over Wishlist.');
    await page.keyboard.press('ArrowRight');
    await expect(dragAnnouncements).toHaveText('Over Applied.');
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
