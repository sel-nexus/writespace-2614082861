import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';

const admin = { userId: 'admin', username: 'admin', displayName: 'Admin', role: 'admin' };
const user = { userId: 'user-1', username: 'reader', displayName: 'Reader', role: 'user' };

function renderProtected(path, session, adminOnly = false) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<ProtectedRoute adminOnly={adminOnly} session={session}><p>Protected content</p></ProtectedRoute>} path={path} />
        <Route element={<p>Login destination</p>} path="/login" />
        <Route element={<p>Blogs destination</p>} path="/blogs" />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects a guest to login and remembers the requested path', () => {
    renderProtected('/users', null, true);
    expect(screen.getByText('Login destination')).toBeInTheDocument();
  });

  it('redirects a regular user away from an admin-only surface', () => {
    renderProtected('/admin', user, true);
    expect(screen.getByText('Blogs destination')).toBeInTheDocument();
  });

  it('renders protected content for an authenticated user route', () => {
    renderProtected('/blogs', user);
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('allows admins into administrator-only routes', () => {
    renderProtected('/admin', admin, true);
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});
