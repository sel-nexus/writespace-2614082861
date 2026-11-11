import { expect, test } from '@playwright/test';

function captureBrowserErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

test('guest discovers the landing page and is guided to the login and registration forms', async ({ page }) => {
  const errors = captureBrowserErrors(page);
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Your thoughts. Your space.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Write Freely' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Private & Local' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Instant & Fast' })).toBeVisible();
  await expect(page.getByText('No posts yet — check back soon!')).toBeVisible();
  await page.getByRole('link', { name: 'Start Reading' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel('Username')).toBeVisible();
  await page.getByRole('link', { name: 'Register', exact: true }).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByLabel('Confirm Password')).toBeVisible();
  expect(errors).toEqual([]);
});

test('registration persists an account/session and remains signed in after reload', async ({ page }) => {
  const errors = captureBrowserErrors(page);
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.getByRole('link', { name: 'Get Started', exact: true }).click();
  await page.getByLabel('Display Name').fill('Morgan Pages');
  await page.getByLabel('Username').fill('morgan');
  await page.getByLabel('Password', { exact: true }).fill('local-demo-pass');
  await page.getByLabel('Confirm Password').fill('local-demo-pass');
  await page.getByRole('button', { name: 'Get Started' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByRole('button', { name: /Morgan Pages user/ })).toBeVisible();
  const dataBeforeReload = await page.evaluate(() => ({
    session: JSON.parse(localStorage.getItem('writespace_session')),
    users: JSON.parse(localStorage.getItem('writespace_users')),
  }));
  expect(dataBeforeReload.session).toMatchObject({ username: 'morgan', displayName: 'Morgan Pages', role: 'user' });
  expect(dataBeforeReload.users).toHaveLength(1);
  await page.reload();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByRole('button', { name: /Morgan Pages user/ })).toBeVisible();
  await page.getByRole('button', { name: /Morgan Pages user/ }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => localStorage.getItem('writespace_session'))).toBeNull();
  expect(errors).toEqual([]);
});

test('admin demo login reaches the admin route while invalid login reports an error', async ({ page }) => {
  const errors = captureBrowserErrors(page);
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Login' }).click();
  await page.getByLabel('Username').fill('guest');
  await page.getByLabel('Password').fill('wrong');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('alert')).toContainText('Invalid username or password.');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('button', { name: /Admin admin/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test('guest direct access to a preview route returns to login', async ({ page }) => {
  const errors = captureBrowserErrors(page);
  await page.addInitScript(() => localStorage.setItem('writespace_posts', JSON.stringify([
    { id: 'public-sample', title: 'A real local story', content: 'Preview text from storage.', createdAt: '2025-01-01T00:00:00.000Z', authorId: 'u-1', authorName: 'Author' },
  ])));
  await page.goto('/blog/public-sample');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Log in to WriteSpace' })).toBeVisible();
  expect(errors).toEqual([]);
});
