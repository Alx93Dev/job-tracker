import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { signInAsDemoUser } from './support/sign-in';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function expectNoAccessibilityViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const violations = results.violations.map(({ id, help, nodes }) => ({
    id,
    help,
    targets: nodes.map((node) => node.target.join(' ')),
  }));
  expect(violations).toEqual([]);
}

test.describe('accessibility (axe, WCAG 2.1 AA)', () => {
  test('login page', async ({ page }) => {
    await page.goto('/login');
    await expectNoAccessibilityViolations(page);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`signed-in pages in ${colorScheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await signInAsDemoUser(page);
      await expectNoAccessibilityViolations(page);

      for (const path of ['/?view=list', '/analytics', '/applications/new', '/profile']) {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        await expectNoAccessibilityViolations(page);
      }
    });
  }
});
