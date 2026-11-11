import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Home from './Home.jsx';
import ReadBlog from './ReadBlog.jsx';
import WriteBlog from './WriteBlog.jsx';
import { setSession, sessionKey } from '../utils/auth.js';
import { getPosts, savePosts, storageKeys } from '../utils/storage.js';

const owner = { userId: 'owner-1', username: 'writer', displayName: 'Wren Writer', role: 'user' };
const reader = { userId: 'reader-2', username: 'reader', displayName: 'Rory Reader', role: 'user' };
const admin = { userId: 'admin', username: 'admin', displayName: 'Admin', role: 'admin' };
const firstPost = { id: 'post-1', title: 'First reflection', content: 'A thoughtful first paragraph.\nAnd another line.', createdAt: '2025-01-01T00:00:00.000Z', authorId: owner.userId, authorName: owner.displayName, authorRole: owner.role };
const secondPost = { ...firstPost, id: 'post-2', title: 'Second reflection', createdAt: '2025-02-01T00:00:00.000Z' };

function renderRoute(path, element) {
  const routePattern = path.startsWith('/blog/') ? '/blog/:id' : path;
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={element} path={routePattern} />
        <Route element={<p>Blogs route</p>} path="/blogs" />
        <Route element={<p>Post route</p>} path="/blog/:id" />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEditor(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<WriteBlog />} path="/write" />
        <Route element={<WriteBlog />} path="/edit/:id" />
        <Route element={<ReadBlog />} path="/blog/:id" />
        <Route element={<Home />} path="/blogs" />
      </Routes>
    </MemoryRouter>,
  );
}

describe('post listing, reading, and authoring', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.confirm = vi.fn(() => true);
  });

  it('renders newest-first cards with 120-character excerpts, dates, author and ownership edit link', () => {
    setSession(owner);
    savePosts([firstPost, secondPost, { ...firstPost, id: 'long-post', title: 'Long story', content: 'x'.repeat(125) }]);
    renderRoute('/blogs', <Home />);
    const cards = screen.getByRole('region', { name: 'Blog posts' });
    expect(cards).toHaveTextContent('Second reflection');
    expect(cards).toHaveTextContent('Feb 01, 2025');
    expect(cards).toHaveTextContent('Wren Writer');
    expect(screen.getByRole('link', { name: 'Edit Second reflection' })).toHaveAttribute('href', '/edit/post-2');
    expect(screen.getByText(`${'x'.repeat(120)}…`)).toBeInTheDocument();
    expect(getPosts()[0].id).toBe('post-1');
  });

  it('shows the specified empty state and write action for an empty local list', () => {
    setSession(owner);
    renderRoute('/blogs', <Home />);
    expect(screen.getByRole('heading', { name: 'No blogs yet. Be the first to write one!' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Write your first post' })).toHaveAttribute('href', '/write');
  });

  it('shows full content and hides edit/delete actions from a reader of another author’s post', () => {
    setSession(reader);
    savePosts([firstPost]);
    renderRoute('/blog/post-1', <ReadBlog />);
    expect(screen.getByRole('heading', { name: 'First reflection' })).toBeInTheDocument();
    expect(screen.getByText(/A thoughtful first paragraph/)).toHaveClass('whitespace-pre-wrap');
    expect(screen.getByRole('link', { name: /Back to All Posts/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete post' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Edit post' })).not.toBeInTheDocument();
  });

  it('shows a not-found state for an invalid post id', () => {
    setSession(owner);
    renderRoute('/blog/missing', <ReadBlog />);
    expect(screen.getByRole('heading', { name: 'Post not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to All Posts/ })).toHaveAttribute('href', '/blogs');
  });

  it('rejects content above the 10000-character boundary before persistence', async () => {
    const user = userEvent.setup();
    setSession(owner);
    renderEditor('/write');
    const contentField = screen.getByLabelText('Content');
    await user.type(screen.getByLabelText('Title'), 'Boundary story');
    fireEvent.change(contentField, { target: { value: 'x'.repeat(10001) } });
    expect(contentField).toHaveAttribute('maxLength', '10000');
    await user.click(screen.getByRole('button', { name: 'Publish post' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Content must be 10000 characters or fewer.');
    expect(getPosts()).toEqual([]);
  });

  it('renders markup-like post content as text, not executable markup', async () => {
    const user = userEvent.setup();
    setSession(owner);
    renderEditor('/write');
    await user.type(screen.getByLabelText('Title'), 'Literal markup');
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: '<script>alert(1)</script>' } });
    await user.click(screen.getByRole('button', { name: 'Publish post' }));
    expect(await screen.findByRole('heading', { name: 'Literal markup' })).toBeInTheDocument();
    expect(screen.getByText('<script>alert(1)</script>')).toBeInTheDocument();
    expect(document.querySelector('script')).toBeNull();
  });

  it('requires title and content and reports field-level errors', async () => {
    const user = userEvent.setup();
    setSession(owner);
    renderEditor('/write');
    await user.click(screen.getByRole('button', { name: 'Publish post' }));
    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(screen.getByText('Content is required.')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveAttribute('aria-invalid', 'true');
    expect(getPosts()).toEqual([]);
  });

  it('refuses to persist a post when a session is unavailable', async () => {
    const user = userEvent.setup();
    renderEditor('/write');
    await user.type(screen.getByLabelText('Title'), 'No session');
    await user.type(screen.getByLabelText('Content'), 'This must not be persisted.');
    await user.click(screen.getByRole('button', { name: 'Publish post' }));
    expect(getPosts()).toEqual([]);
    expect(screen.getByRole('heading', { name: 'Write a post' })).toBeInTheDocument();
  });

  it('creates a UUID-backed post with session identity and persists it', async () => {
    const user = userEvent.setup();
    setSession(owner);
    renderEditor('/write');
    await user.type(screen.getByLabelText('Title'), 'A new page');
    await user.type(screen.getByLabelText('Content'), 'Words worth keeping.');
    expect(screen.getByText((text, element) => element?.tagName === 'SPAN' && text.includes('20') && text.includes('characters'))).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Publish post' }));
    expect(await screen.findByRole('heading', { name: 'A new page' })).toBeInTheDocument();
    expect(getPosts()).toEqual([expect.objectContaining({ id: expect.any(String), title: 'A new page', content: 'Words worth keeping.', authorId: owner.userId, authorName: owner.displayName, authorRole: 'user', createdAt: expect.any(String) })]);
  });

  it('updates an owned post and leaves the creation timestamp unchanged', async () => {
    const user = userEvent.setup();
    setSession(owner);
    savePosts([firstPost]);
    renderEditor('/edit/post-1');
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated reflection' } });
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Revised story.' } });
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByRole('heading', { name: 'Updated reflection' })).toBeInTheDocument();
    expect(getPosts()[0]).toMatchObject({ ...firstPost, title: 'Updated reflection', content: 'Revised story.', updatedAt: expect.any(String) });
  });

  it('redirects another user away from an owner’s edit form', () => {
    setSession(reader);
    savePosts([firstPost]);
    renderEditor('/edit/post-1');
    expect(screen.getByRole('heading', { name: 'All Blogs' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
  });

  it('lets an admin edit another author’s post', () => {
    setSession(admin);
    savePosts([firstPost]);
    renderEditor('/edit/post-1');
    expect(screen.getByRole('heading', { name: 'Edit post' })).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue(firstPost.title);
  });

  it('requires confirmation before removing an owned post and leaves it when cancelled', async () => {
    const user = userEvent.setup();
    setSession(owner);
    savePosts([firstPost, secondPost]);
    window.confirm = vi.fn(() => false);
    renderRoute('/blog/post-1', <ReadBlog />);
    await user.click(screen.getByRole('button', { name: 'Delete post' }));
    expect(window.confirm).toHaveBeenCalledOnce();
    expect(getPosts()).toHaveLength(2);
  });

  it('deletes after confirmation and persists the new list', async () => {
    const user = userEvent.setup();
    setSession(owner);
    savePosts([firstPost, secondPost]);
    render(
      <MemoryRouter initialEntries={['/blog/post-1']}>
        <Routes>
          <Route element={<ReadBlog />} path="/blog/:id" />
          <Route element={<p>Blog list destination</p>} path="/blogs" />
        </Routes>
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: 'Delete post' }));
    expect(await screen.findByText('Blog list destination')).toBeInTheDocument();
    expect(getPosts()).toEqual([secondPost]);
    expect(window.localStorage.getItem(storageKeys.posts)).toContain('post-2');
  });

  it('leaves stored data intact when browser storage refuses a post write', async () => {
    const user = userEvent.setup();
    setSession(owner);
    const existing = [firstPost];
    savePosts(existing);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('quota'); });
    renderEditor('/write');
    await user.type(screen.getByLabelText('Title'), 'Storage blocked');
    await user.type(screen.getByLabelText('Content'), 'This cannot be saved.');
    await user.click(screen.getByRole('button', { name: 'Publish post' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to save this post.');
    expect(window.localStorage.getItem(sessionKey)).not.toBeNull();
  });
});
