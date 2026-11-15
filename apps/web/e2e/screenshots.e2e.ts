import { test } from '@playwright/test';
import path from 'node:path';
import { signInAsDemoUser } from './support/sign-in';

const screenshotsDirectory = path.resolve(__dirname, '../../../docs/screenshots');

/** Regenerates the README screenshots: `CAPTURE_SCREENSHOTS=1 pnpm test:e2e screenshots`. */
test.describe('README screenshots', () => {
  test.skip(!process.env.CAPTURE_SCREENSHOTS, 'Only runs when CAPTURE_SCREENSHOTS is set');
  test.use({ viewport: { width: 1280, height: 800 }, colorScheme: 'dark' });

  test('captures the main pages', async ({ page }) => {
    await signInAsDemoUser(page);
    await page.screenshot({ path: path.join(screenshotsDirectory, 'board.png') });

    await page.goto('/analytics');
    await page.getByText('Response rate').waitFor();
    await page.screenshot({
      path: path.join(screenshotsDirectory, 'analytics.png'),
      fullPage: true,
    });

    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/login');
    await page.screenshot({ path: path.join(screenshotsDirectory, 'login.png') });
  });
});
