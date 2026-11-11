import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const baseUrl = 'http://127.0.0.1:4173';
const outputDirectory = 'test-results';

async function captureView(page, snapshots, label) {
  const accessibilityTree = await page.locator('body').ariaSnapshot();
  const computedStyles = await page.evaluate(() => {
    const surface = document.querySelector('#root > div, #root > main, #root > header') ?? document.body;
    const heading = document.querySelector('h1');
    const surfaceStyles = getComputedStyle(surface);
    return {
      title: document.title,
      surfaceTag: surface.tagName.toLowerCase(),
      surfaceClasses: surface.className,
      fontFamily: surfaceStyles.fontFamily,
      backgroundColor: surfaceStyles.backgroundColor,
      foregroundColor: surfaceStyles.color,
      headingFontFamily: heading ? getComputedStyle(heading).fontFamily : null,
      viewport: { width: innerWidth, height: innerHeight },
    };
  });
  const renderedHtml = await page.content();
  const screenshot = `${outputDirectory}/ui-${label}.png`;
  await page.screenshot({ path: screenshot, fullPage: true });
  snapshots.push({ label, url: page.url(), computedStyles, accessibilityTree, renderedHtml, screenshot });
}

test('captures representative rendered structures, accessibility trees, and computed styles', async ({ page }) => {
  const snapshots = [];
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  await mkdir(outputDirectory, { recursive: true });

  await page.addInitScript(() => localStorage.clear());
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Your thoughts. Your space.' })).toBeVisible();
  await expect(page).toHaveTitle('WriteSpace | Your thoughts. Your space.');
  await captureView(page, snapshots, 'landing-desktop');
  await page.setViewportSize({ width: 390, height: 844 });
  await captureView(page, snapshots, 'landing-mobile');

  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Login' }).click();
  await page.getByLabel('Username').fill('unknown');
  await page.getByLabel('Password').fill('invalid');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('alert')).toContainText('Invalid username or password.');
  await expect(page).toHaveTitle('Log in | WriteSpace');
  await captureView(page, snapshots, 'login-error-mobile');

  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Good to see you, Admin.' })).toBeVisible();
  await expect(page).toHaveTitle('Administrator overview | WriteSpace');
  await captureView(page, snapshots, 'admin-empty');

  await page.getByRole('link', { name: /Write New Post/ }).click();
  await expect(page.getByRole('heading', { name: 'Write a post' })).toBeVisible();
  await expect(page).toHaveTitle('Write a post | WriteSpace');
  await captureView(page, snapshots, 'editor-empty');

  expect(browserErrors).toEqual([]);
  await writeFile(`${outputDirectory}/ui-preflight.txt`, JSON.stringify(snapshots, null, 2), 'utf8');
});
