import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminDashboard from './AdminDashboard.jsx';
import UserManagement from './UserManagement.jsx';
import App from '../App.jsx';
import { setSession } from '../utils/auth.js';
import { getPosts, getUsers, savePosts, saveUsers } from '../utils/storage.js';

const admin = { userId: 'admin', username: 'admin', displayName: 'Admin', role: 'admin' };
const sampleUser = { id: 'reader-1', displayName: 'Reader One', username: 'reader', password: 'demo-pass', role: 'user', createdAt: '2025-01-01T00:00:00.000Z' };
const samplePost = { id: 'post-1', title: 'A local story', content: 'Story text.', createdAt: '2025-01-02T00:00:00.000Z', authorId: 'reader-1', authorName: 'Reader One', authorRole: 'user' };

function renderRoute(path, page) {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route element={page} path={path} /><Route element={<p>Blogs destination</p>} path="/blogs" /><Route element={<p>Login destination</p>} path="/login" /></Routes></MemoryRouter>);
}

describe('administrator oversight', () => {
  beforeEach(() => {
    window.localStorage.clear();
    setSession(admin);
    window.confirm = vi.fn(() => true);
  });

  it('shows the four PRD-labelled counts, two quick actions, and five newest posts', () => {
    saveUsers([sampleUser, { ...sampleUser, id: 'admin-created', username: 'co-admin', role: 'admin' }]);
    savePosts(Array.from({ length: 7 }, (_, index) => ({ ...samplePost, id: `post-${index}`, title: `Story ${index}`, createdAt: `2025-01-0${index + 1}T00:00:00.000Z` })));
    renderRoute('/admin', <AdminDashboard />);
    const stats = screen.getByRole('region', { name: 'Blog and account statistics' });
    expect(within(stats).getByRole('article', { name: 'Total Posts: 7' })).toBeInTheDocument();
    expect(within(stats).getByRole('article', { name: 'Total Users: 2' })).toBeInTheDocument();
    expect(within(stats).getByRole('article', { name: 'Total Admins: 2' })).toBeInTheDocument();
    expect(within(stats).getByRole('article', { name: 'Total users: 2' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Write New Post/ })).toHaveAttribute('href', '/write');
    expect(screen.getByRole('link', { name: /Manage Users/ })).toHaveAttribute('href', '/users');
    for (let index = 2; index < 7; index += 1) expect(screen.getByRole('link', { name: `Story ${index}` })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Story 1' })).not.toBeInTheDocument();
  });

  it('cancels dashboard post deletion without changing stored records', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => false);
    savePosts([samplePost]);
    renderRoute('/admin', <AdminDashboard />);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(window.confirm).toHaveBeenCalledOnce();
    expect(getPosts()).toEqual([samplePost]);
  });

  it('removes a dashboard post after confirmation and updates the displayed list', async () => {
    const user = userEvent.setup();
    savePosts([samplePost]);
    renderRoute('/admin', <AdminDashboard />);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(getPosts()).toEqual([]);
    expect(screen.getByText('No posts yet — create the first one.')).toBeInTheDocument();
  });

  it('shows an empty recent state when there are no posts', () => {
    renderRoute('/admin', <AdminDashboard />);
    expect(screen.getByText('No posts yet — create the first one.')).toBeInTheDocument();
  });

  it('validates required, reserved and duplicate account fields', async () => {
    const user = userEvent.setup();
    saveUsers([sampleUser]);
    renderRoute('/users', <UserManagement />);
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByText('Display name is required.')).toBeInTheDocument();
    expect(screen.getByText('Username is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Display Name'), 'New User');
    await user.type(screen.getByLabelText('Username'), 'ADMIN');
    await user.type(screen.getByLabelText('Password'), 'new-pass');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByText('That username is already taken.')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Username'));
    await user.type(screen.getByLabelText('Username'), 'READER');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByText('That username is already taken.')).toBeInTheDocument();
    expect(getUsers()).toEqual([sampleUser]);
  });

  it('creates a UUID-backed account with selected admin role and persists it', async () => {
    const user = userEvent.setup();
    renderRoute('/users', <UserManagement />);
    await user.type(screen.getByLabelText('Display Name'), 'Casey Admin');
    await user.type(screen.getByLabelText('Username'), 'casey');
    await user.type(screen.getByLabelText('Password'), 'local-pass');
    await user.selectOptions(screen.getByLabelText('Role'), 'admin');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByRole('status')).toHaveTextContent('Casey Admin was added.');
    expect(getUsers()).toEqual([expect.objectContaining({ id: expect.any(String), displayName: 'Casey Admin', username: 'casey', password: 'local-pass', role: 'admin', createdAt: expect.any(String) })]);
  });

  it('disables the default admin deletion and confirms removal of another account', async () => {
    const user = userEvent.setup();
    saveUsers([sampleUser, { id: 'second-user', displayName: 'Second User', username: 'second', password: 'demo', role: 'user', createdAt: '2025-02-01T00:00:00.000Z' }]);
    renderRoute('/users', <UserManagement />);
    expect(screen.getAllByRole('button', { name: 'Default admin cannot be deleted.' }).every((button) => button.disabled)).toBe(true);
    const targetCard = screen.getAllByRole('article').find((article) => article.textContent.includes('Reader One'));
    await user.click(within(targetCard).getByRole('button', { name: 'Delete', exact: true }));
    expect(window.confirm).toHaveBeenCalledWith('Delete the account for Reader One?');
    expect(getUsers().some((entry) => entry.id === 'reader-1')).toBe(false);
  });

  it('does not allow an administrator to delete their own created account', () => {
    const currentAdmin = { id: 'co-admin', displayName: 'Co Admin', username: 'coadmin', password: 'demo', role: 'admin', createdAt: '2025-01-03T00:00:00.000Z' };
    setSession({ userId: currentAdmin.id, username: currentAdmin.username, displayName: currentAdmin.displayName, role: 'admin' });
    saveUsers([currentAdmin]);
    renderRoute('/users', <UserManagement />);
    const selfCard = screen.getAllByRole('article').find((article) => article.textContent.includes('Co Admin'));
    expect(within(selfCard).getByRole('button', { name: 'You cannot delete your own account.' })).toBeDisabled();
  });

  it('rejects an unsupported role passed through an invalid form event', async () => {
    const user = userEvent.setup();
    renderRoute('/users', <UserManagement />);
    await user.type(screen.getByLabelText('Display Name'), 'Invalid Role');
    await user.type(screen.getByLabelText('Username'), 'invalid-role');
    await user.type(screen.getByLabelText('Password'), 'demo');
    fireEvent.change(screen.getByLabelText('Role'), { target: { name: 'role', value: 'owner' } });
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByText('Choose a valid role.')).toBeInTheDocument();
    expect(getUsers()).toEqual([]);
  });

  it('reports account-storage write failures without claiming the account was created', async () => {
    const user = userEvent.setup();
    renderRoute('/users', <UserManagement />);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('quota'); });
    await user.type(screen.getByLabelText('Display Name'), 'Storage Error');
    await user.type(screen.getByLabelText('Username'), 'storage-error');
    await user.type(screen.getByLabelText('Password'), 'demo');
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByRole('status')).toHaveTextContent('Unable to save this account.');
    expect(screen.queryByText('Storage Error was added.')).not.toBeInTheDocument();
  });

  it('reports post-moderation persistence failures and keeps the post visible', async () => {
    const user = userEvent.setup();
    savePosts([samplePost]);
    expect(getPosts()).toEqual([samplePost]);
    renderRoute('/admin', <AdminDashboard />);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('quota'); });
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('link', { name: 'A local story' })).toBeInTheDocument();
    expect(getPosts()).toEqual([samplePost]);
  });

  it('retains an account after the delete confirmation is cancelled', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => false);
    saveUsers([sampleUser]);
    renderRoute('/users', <UserManagement />);
    const readerCard = screen.getAllByRole('article').find((article) => article.textContent.includes('Reader One'));
    await user.click(within(readerCard).getByRole('button', { name: 'Delete', exact: true }));
    expect(window.confirm).toHaveBeenCalledOnce();
    expect(getUsers()).toEqual([sampleUser]);
  });

  it('redirects a regular account away from both administrator routes', () => {
    window.localStorage.clear();
    window.localStorage.setItem('writespace_session', JSON.stringify({ userId: sampleUser.id, username: sampleUser.username, displayName: sampleUser.displayName, role: 'user' }));
    render(<MemoryRouter initialEntries={['/admin']}><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'All Blogs' })).toBeInTheDocument();
  });

  it('guards dashboard and account management for guests', () => {
    window.localStorage.clear();
    render(<MemoryRouter initialEntries={['/admin']}><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Log in to WriteSpace' })).toBeInTheDocument();
  });
});
