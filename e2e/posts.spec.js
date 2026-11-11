import { expect, test } from '@playwright/test';

/** Register browser error listeners before the application is entered. */
function captureBrowserErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test('user registers, creates, reads, edits, and confirms deletion of a post', async ({ page }) => {
  const errors = captureBrowserErrors(page);
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');
  await page.screenshot({ path: 'test-results/post-journey-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Get Started', exact: true }).click();
  await page.getByLabel('Display Name').fill('Jamie Writer');
  await page.getByLabel('Username').fill('jamie');
  await page.getByLabel('Password', { exact: true }).fill('demo-pass');
  await page.getByLabel('Confirm Password').fill('demo-pass');
  await page.getByRole('button', { name: 'Get Started' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByRole('heading', { name: 'No blogs yet. Be the first to write one!' })).toBeVisible();

  await page.getByRole('link', { name: 'Write your first post' }).click();
  await page.getByLabel('Title').fill('Notes from a quiet morning');
  await page.getByLabel('Content').fill('The first cup of tea made the whole page feel possible.\nThen the words began to arrive.');
  await expect(page.getByText(/characters/)).toBeVisible();
  await page.getByRole('button', { name: 'Publish post' }).click();
  await expect(page).toHaveURL(/\/blog\/.+/);
  await expect(page.getByRole('heading', { name: 'Notes from a quiet morning' })).toBeVisible();
  await expect(page.getByText(/Then the words began to arrive/)).toBeVisible();
  await expect(page.getByRole('article').getByText('Jamie Writer', { exact: true })).toBeVisible();
  const postId = await page.evaluate(() => JSON.parse(localStorage.getItem('writespace_posts'))[0].id);
  expect(postId).toBeTruthy();

  await page.getByRole('link', { name: 'Edit post' }).click();
  await expect(page.getByLabel('Title')).toHaveValue('Notes from a quiet morning');
  await page.getByLabel('Title').fill('Notes from a brighter morning');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('heading', { name: 'Notes from a brighter morning' })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/blog/${postId}$`));

  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Delete post' }).click();
  await expect(page.getByRole('heading', { name: 'Notes from a brighter morning' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('writespace_posts')))).toHaveLength(1);

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete post' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByRole('heading', { name: 'No blogs yet. Be the first to write one!' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('writespace_posts')))).toEqual([]);
  expect(errors).toEqual([]);
});

test('a reader sees another author’s post without edit or delete controls', async ({ page }) => {
  const errors = captureBrowserErrors(page);
  await page.addInitScript(() => {
    localStorage.setItem('writespace_session', JSON.stringify({ userId: 'reader-1', username: 'reader', displayName: 'Reader', role: 'user' }));
    localStorage.setItem('writespace_posts', JSON.stringify([
      { id: 'owned-by-other', title: 'Other writer’s story', content: 'Shared reading is welcome.', createdAt: '2025-01-01T00:00:00.000Z', authorId: 'author-2', authorName: 'Other Writer', authorRole: 'user' },
    ]));
  });
  await page.goto('/blog/owned-by-other');
  await expect(page.getByRole('heading', { name: 'Other writer’s story' })).toBeVisible();
  await expect(page.getByText('Shared reading is welcome.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit post' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Delete post' })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('a reader opening another author’s edit route is redirected to posts', async ({ page }) => {
  const errors = captureBrowserErrors(page);
  await page.addInitScript(() => {
    localStorage.setItem('writespace_session', JSON.stringify({ userId: 'reader-1', username: 'reader', displayName: 'Reader', role: 'user' }));
    localStorage.setItem('writespace_posts', JSON.stringify([
      { id: 'owned-by-other', title: 'Other writer’s story', content: 'Shared reading is welcome.', createdAt: '2025-01-01T00:00:00.000Z', authorId: 'author-2', authorName: 'Other Writer', authorRole: 'user' },
    ]));
  });
  await page.goto('/edit/owned-by-other');
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByRole('heading', { name: 'All Blogs' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('invalid post ids show a not-found message with a route back to the list', async ({ page }) => {
  const errors = captureBrowserErrors(page);
  await page.addInitScript(() => localStorage.setItem('writespace_session', JSON.stringify({ userId: 'reader', username: 'reader', displayName: 'Reader', role: 'user' })));
  await page.goto('/blog/absent-post');
  await expect(page.getByRole('heading', { name: 'Post not found' })).toBeVisible();
  await page.getByRole('link', { name: /Back to All Posts/ }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  expect(errors).toEqual([]);
});
