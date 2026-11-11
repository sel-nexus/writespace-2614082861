import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from '../App.jsx';
import LandingPage from './LandingPage.jsx';
import LoginPage from './LoginPage.jsx';
import RegisterPage from './RegisterPage.jsx';
import { savePosts, saveUsers } from '../utils/storage.js';
import { sessionKey } from '../utils/auth.js';

function renderPage(page) {
  return render(<MemoryRouter><>{page}</></MemoryRouter>);
}

describe('public discovery and account access', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('shows required public hero, features, latest empty state, and footer destinations', () => {
    renderPage(<LandingPage />);
    expect(screen.getByRole('heading', { name: /Your thoughts\./ })).toBeInTheDocument();
    expect(screen.getByText('Your thoughts. Your space. Beautifully simple.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Write Freely' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Private & Local' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Instant & Fast' })).toBeInTheDocument();
    expect(screen.getByText('No posts yet — check back soon!')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Footer navigation' })).toHaveTextContent('Register');
  });

  it('orders latest landing preview by creation date and limits it to three posts', () => {
    savePosts([
      { id: 'old', title: 'Old story', content: 'Old content', createdAt: '2024-01-01T00:00:00.000Z', authorId: 'author', authorName: 'Author' },
      { id: 'new-1', title: 'Newest story', content: 'First newest', createdAt: '2025-01-03T00:00:00.000Z', authorId: 'author', authorName: 'Author' },
      { id: 'new-2', title: 'Second story', content: 'Second newest', createdAt: '2025-01-02T00:00:00.000Z', authorId: 'author', authorName: 'Author' },
      { id: 'new-3', title: 'Third story', content: 'Third newest', createdAt: '2025-01-01T00:00:00.000Z', authorId: 'author', authorName: 'Author' },
      { id: 'new-4', title: 'Fourth story', content: 'Fourth newest', createdAt: '2024-12-31T00:00:00.000Z', authorId: 'author', authorName: 'Author' },
    ]);
    renderPage(<LandingPage />);
    expect(screen.getByRole('heading', { name: 'Newest story' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Second story' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Third story' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Fourth story' })).not.toBeInTheDocument();
  });

  it('accepts the demo admin and saves the admin session', async () => {
    const user = userEvent.setup();
    renderPage(<LoginPage />);
    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'admin');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(JSON.parse(window.localStorage.getItem(sessionKey))).toMatchObject({ username: 'admin', role: 'admin' });
  });

  it('rejects invalid credentials with the specified inline feedback', async () => {
    const user = userEvent.setup();
    renderPage(<LoginPage />);
    await user.type(screen.getByLabelText('Username'), 'unknown');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid username or password.');
    expect(window.localStorage.getItem(sessionKey)).toBeNull();
  });

  it('creates and signs in a user account with normalized identity', async () => {
    const user = userEvent.setup();
    renderPage(<RegisterPage />);
    await user.type(screen.getByLabelText('Display Name'), '  Dana Writer  ');
    await user.type(screen.getByLabelText('Username'), 'dana');
    await user.type(screen.getByLabelText('Password'), 'demo-pass');
    await user.type(screen.getByLabelText('Confirm Password'), 'demo-pass');
    await user.click(screen.getByRole('button', { name: 'Get Started' }));
    expect(JSON.parse(window.localStorage.getItem('writespace_users'))).toEqual([
      expect.objectContaining({ displayName: 'Dana Writer', username: 'dana', role: 'user', password: 'demo-pass' }),
    ]);
    expect(JSON.parse(window.localStorage.getItem(sessionKey))).toMatchObject({ displayName: 'Dana Writer', username: 'dana', role: 'user' });
  });

  it('reports required fields, mismatched passwords, and reserved or duplicate usernames', async () => {
    const user = userEvent.setup();
    renderPage(<RegisterPage />);
    await user.click(screen.getByRole('button', { name: 'Get Started' }));
    expect(screen.getByText('Display name is required.')).toBeInTheDocument();
    expect(screen.getByText('Username is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your password.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Display Name'), 'Dana');
    await user.type(screen.getByLabelText('Username'), 'ADMIN');
    await user.type(screen.getByLabelText('Password'), 'first');
    await user.type(screen.getByLabelText('Confirm Password'), 'different');
    await user.click(screen.getByRole('button', { name: 'Get Started' }));
    expect(screen.getByText('That username is already taken.')).toBeInTheDocument();
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    saveUsers([{ id: 'existing', displayName: 'Dana', username: 'dana', password: 'pass', role: 'user', createdAt: '2025-01-01T00:00:00.000Z' }]);
    await user.clear(screen.getByLabelText('Username'));
    await user.type(screen.getByLabelText('Username'), 'DANA');
    await user.click(screen.getByRole('button', { name: 'Get Started' }));
    expect(screen.getByText('That username is already taken.')).toBeInTheDocument();
  });

  it('reports an account persistence error and does not create a session when user storage fails', async () => {
    const user = userEvent.setup();
    const originalSetItem = Storage.prototype.setItem;
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function setItem(key, value) {
      if (key === 'writespace_users') throw new DOMException('quota exceeded');
      return originalSetItem.call(this, key, value);
    });
    renderPage(<RegisterPage />);
    await user.type(screen.getByLabelText('Display Name'), 'Dana Writer');
    await user.type(screen.getByLabelText('Username'), 'dana');
    await user.type(screen.getByLabelText('Password'), 'demo-pass');
    await user.type(screen.getByLabelText('Confirm Password'), 'demo-pass');
    await user.click(screen.getByRole('button', { name: 'Get Started' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to save your account.');
    expect(window.localStorage.getItem('writespace_users')).toBeNull();
    expect(window.localStorage.getItem(sessionKey)).toBeNull();
    setItemSpy.mockRestore();
  });

  it('reports a session persistence error when account storage succeeds but session storage fails', async () => {
    const user = userEvent.setup();
    const originalSetItem = Storage.prototype.setItem;
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function setItem(key, value) {
      if (key === sessionKey) throw new DOMException('quota exceeded');
      return originalSetItem.call(this, key, value);
    });
    renderPage(<RegisterPage />);
    await user.type(screen.getByLabelText('Display Name'), 'Dana Writer');
    await user.type(screen.getByLabelText('Username'), 'dana');
    await user.type(screen.getByLabelText('Password'), 'demo-pass');
    await user.type(screen.getByLabelText('Confirm Password'), 'demo-pass');
    await user.click(screen.getByRole('button', { name: 'Get Started' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Your account was created, but the session could not be saved.');
    expect(JSON.parse(window.localStorage.getItem('writespace_users'))).toEqual([
      expect.objectContaining({ username: 'dana', displayName: 'Dana Writer', role: 'user' }),
    ]);
    expect(window.localStorage.getItem(sessionKey)).toBeNull();
    setItemSpy.mockRestore();
  });

  it('renders the complete login route, updates navigation after authentication, and sends admin to its home', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<App />} path="*" />
        </Routes>
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'admin');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByRole('heading', { name: 'Good to see you, Admin.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument();
  });
});
