import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BlogCard from './BlogCard.jsx';

const post = { id: 'post-1', title: 'A careful story', content: 'x'.repeat(125), createdAt: '2025-01-02T00:00:00.000Z', authorId: 'author-1', authorName: 'Alex Author', authorRole: 'user' };

function renderCard(session) {
  return render(<MemoryRouter><BlogCard index={0} post={post} session={session} /></MemoryRouter>);
}

describe('BlogCard', () => {
  it('renders formatted metadata, a 120-character excerpt, and links to detail', () => {
    renderCard({ userId: 'reader-1', role: 'user' });
    expect(screen.getByRole('link', { name: 'Read A careful story' })).toHaveAttribute('href', '/blog/post-1');
    expect(screen.getByText(`${'x'.repeat(120)}…`)).toBeInTheDocument();
    expect(screen.getByText('Jan 02, 2025')).toBeInTheDocument();
    expect(screen.getByText('Alex Author')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Edit A careful story' })).not.toBeInTheDocument();
  });

  it('shows an edit link only for the owner or administrator', () => {
    const { unmount } = renderCard({ userId: 'author-1', role: 'user' });
    expect(screen.getByRole('link', { name: 'Edit A careful story' })).toHaveAttribute('href', '/edit/post-1');
    unmount();
    renderCard({ userId: 'admin', role: 'admin' });
    expect(screen.getByRole('link', { name: 'Edit A careful story' })).toBeInTheDocument();
  });
});
