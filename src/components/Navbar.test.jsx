import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import { sessionKey } from '../utils/auth.js';

const userSession = { userId: 'user-1', username: 'reader', displayName: 'Reader', role: 'user' };
const adminSession = { userId: 'admin', username: 'admin', displayName: 'Admin', role: 'admin' };

function renderNavigation(session, onLogout = vi.fn()) {
  return render(
    <MemoryRouter initialEntries={['/blogs']}>
      <Routes>
        <Route element={<><Navbar onLogout={onLogout} session={session} /><p>Blogs destination</p></>} path="/blogs" />
        <Route element={<p>Home destination</p>} path="/" />
        <Route element={<p>Users destination</p>} path="/users" />
        <Route element={<p>Write destination</p>} path="/write" />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Navbar', () => {
  it('shows only user navigation and opens the menu by keyboard', async () => {
    const user = userEvent.setup();
    renderNavigation(userSession);
    expect(screen.getByRole('link', { name: 'All Blogs' })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'Users' })).not.toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: 'Open menu' });
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Write' })).toBeVisible();
  });

  it('shows admin-only navigation and logs out by clearing session and navigating home', async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    renderNavigation(adminSession, onLogout);
    expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Admin admin/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Log out' }));
    expect(window.localStorage.getItem(sessionKey)).toBeNull();
    expect(onLogout).toHaveBeenCalledOnce();
    expect(screen.getByText('Home destination')).toBeInTheDocument();
  });
});
