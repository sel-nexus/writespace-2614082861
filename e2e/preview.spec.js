import { expect, test } from '@playwright/test';

const errors = [];

test.beforeEach(async ({ page }) => {
  errors.length = 0;
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.addInitScript(() => localStorage.setItem('writespace_posts', JSON.stringify([
    { id: 'preview-story', title: 'A story from this browser', content: 'A preview with content loaded from local storage.', createdAt: '2025-05-01T00:00:00.000Z', authorId: 'author-1', authorName: 'Local Author', authorRole: 'user' },
  ])));
});

test('public latest preview shows stored post content and guests authenticate before reading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'A story from this browser' })).toBeVisible();
  await expect(page.getByText('A preview with content loaded from local storage.')).toBeVisible();
  await page.getByRole('link', { name: 'Read preview: A story from this browser' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Log in to WriteSpace' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/public-preview-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});
