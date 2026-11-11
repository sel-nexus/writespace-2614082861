import { expect, test } from '@playwright/test';

test('public entry works on direct access and sends guests to login', async ({ page }) => {
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Your thoughts.' })).toBeVisible();
  await page.getByRole('link', { name: 'Start reading' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Log in to WriteSpace' })).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test('protected route direct access sends a guest to the login entry', async ({ page }) => {
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  await page.goto('/blogs');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Log in to WriteSpace' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/foundation-mobile-login.png', fullPage: true });
  expect(browserErrors).toEqual([]);
});
