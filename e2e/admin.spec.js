import { expect, test } from '@playwright/test';

const consoleErrors = [];

test.beforeEach(async ({ page }) => {
  consoleErrors.length = 0;
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
});

test('admin reviews dashboard and moderates posts and accounts', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: /Good to see you, Admin/ })).toBeVisible();
  const statistics = page.getByRole('region', { name: 'Blog and account statistics' });
  await expect(statistics.getByText('Total Posts')).toBeVisible();
  await expect(statistics.getByText('Total Users', { exact: true })).toBeVisible();
  await expect(statistics.getByText('Total Admins')).toBeVisible();
  await expect(statistics.getByText('Total users', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Write New Post/ })).toBeVisible();
  await page.getByRole('link', { name: /Write New Post/ }).click();
  await page.getByLabel('Title').fill('Admin moderated story');
  await page.getByLabel('Content').fill('A post administered from the dashboard.');
  await page.getByRole('button', { name: 'Publish post' }).click();
  await expect(page.getByRole('heading', { name: 'Admin moderated story' })).toBeVisible();
  await page.getByRole('link', { name: 'Edit post' }).click();
  await page.getByLabel('Title').fill('Admin updated story');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('heading', { name: 'Admin updated story' })).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete post' }).click();
  await expect(page.getByText('No blogs yet. Be the first to write one!')).toBeVisible();
  await page.getByRole('link', { name: 'WriteSpace home' }).click();
  await page.getByRole('link', { name: /Go to Dashboard/ }).click();
  await page.getByRole('link', { name: /Manage Users/ }).click();
  await expect(page).toHaveURL(/\/users$/);
  await page.getByLabel('Display Name').fill('Avery New Account');
  await page.getByLabel('Username').fill('avery');
  await page.getByLabel('Password').fill('local-demo-only');
  await page.getByLabel('Role').selectOption('user');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByRole('status')).toHaveText('Avery New Account was added.');
  const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem('writespace_users')));
  expect(persisted).toHaveLength(1);
  expect(persisted[0]).toMatchObject({ username: 'avery', displayName: 'Avery New Account', role: 'user' });
  await expect(page.getByRole('button', { name: 'Default admin cannot be deleted.' })).toBeDisabled();

  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('row').filter({ hasText: 'avery' }).getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: 'avery' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('writespace_users')))).toHaveLength(1);

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('row').filter({ hasText: 'avery' }).getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: 'avery' })).toHaveCount(0);
  await expect(page.getByRole('row').filter({ hasText: 'admin' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('writespace_users')))).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('non-admin direct dashboard access redirects to the permitted home', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('writespace_session', JSON.stringify({ userId: 'reader-id', username: 'reader', displayName: 'Reader', role: 'user' })));
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByRole('heading', { name: 'All Blogs' })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('guest direct access to the admin dashboard redirects to login', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Log in to WriteSpace' })).toBeVisible();
  await page.screenshot({ path: 'test-results/admin-guest-login.png', fullPage: true });
  expect(consoleErrors).toEqual([]);
});

test('guest direct access to user management redirects to login', async ({ page }) => {
  await page.goto('/users');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Log in to WriteSpace' })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('regular user direct access to user management redirects to the permitted home', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('writespace_session', JSON.stringify({ userId: 'reader-id', username: 'reader', displayName: 'Reader', role: 'user' })));
  await page.goto('/users');
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByRole('heading', { name: 'All Blogs' })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
