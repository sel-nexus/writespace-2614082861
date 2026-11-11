import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import Home from './pages/Home.jsx';
import ReadBlog from './pages/ReadBlog.jsx';
import WriteBlog from './pages/WriteBlog.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import UserManagement from './pages/UserManagement.jsx';
import { getRoleHome, getSession } from './utils/auth.js';
import { getPosts } from './utils/storage.js';

/**
 * Render the WriteSpace route table and synchronize local identity changes.
 * @returns {JSX.Element} Application routes and authenticated navigation.
 */
export default function App() {
  const [session, setSessionState] = useState(() => getSession());
  const { pathname } = useLocation();
  const pageTitle = resolvePageTitle(pathname);

  useEffect(() => {
    const syncSession = () => setSessionState(getSession());
    window.addEventListener('writespace-session-change', syncSession);
    return () => window.removeEventListener('writespace-session-change', syncSession);
  }, []);

  /** Clear the shell identity after the navbar removes the stored session. */
  function handleLogout() {
    setSessionState(null);
  }

  return (
    <>
      <PageTitle title={pageTitle} />
      {session && <Navbar onLogout={handleLogout} session={session} />}
      <Routes>
        <Route element={<LandingPage />} path="/" />
        <Route element={session ? <RouteRedirect session={session} /> : <LoginPage />} path="/login" />
        <Route element={session ? <RouteRedirect session={session} /> : <RegisterPage />} path="/register" />
        <Route element={<ProtectedRoute session={session}><Home /></ProtectedRoute>} path="/blogs" />
        <Route element={<ProtectedRoute session={session}><ReadBlog /></ProtectedRoute>} path="/blog/:id" />
        <Route element={<ProtectedRoute session={session}><WriteBlog /></ProtectedRoute>} path="/write" />
        <Route element={<ProtectedRoute session={session}><WriteBlog /></ProtectedRoute>} path="/edit/:id" />
        <Route element={<ProtectedRoute adminOnly session={session}><AdminDashboard /></ProtectedRoute>} path="/admin" />
        <Route element={<ProtectedRoute adminOnly session={session}><UserManagement /></ProtectedRoute>} path="/users" />
        <Route element={<RouteNotFound />} path="*" />
      </Routes>
    </>
  );
}

/** Resolve a meaningful document title for the current route and stored resource. */
function resolvePageTitle(pathname) {
  if (pathname === '/') return 'WriteSpace | Your thoughts. Your space.';
  if (pathname === '/login') return 'Log in | WriteSpace';
  if (pathname === '/register') return 'Create account | WriteSpace';
  if (pathname === '/blogs') return 'All Blogs | WriteSpace';
  if (pathname === '/write') return 'Write a post | WriteSpace';
  if (pathname === '/admin') return 'Administrator overview | WriteSpace';
  if (pathname === '/users') return 'Manage Users | WriteSpace';
  const postMatch = pathname.match(/^\/blog\/([^/]+)$/);
  if (postMatch) {
    const post = getPosts().find((entry) => entry.id === decodeURIComponent(postMatch[1]));
    return post ? `${post.title} | WriteSpace` : 'Post not found | WriteSpace';
  }
  if (/^\/edit\/[^/]+$/.test(pathname)) return 'Edit post | WriteSpace';
  return 'Page not found | WriteSpace';
}

/** Keep the browser tab title synchronized with the active route. */
function PageTitle({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}

/**
 * Send a signed-in visitor to the landing route for their role.
 * @param {{ session: object }} props Current valid session.
 * @returns {JSX.Element} Role-specific redirect.
 */
function RouteRedirect({ session }) {
  return <Navigate replace to={getRoleHome(session)} />;
}

/**
 * Render the signed-in page shell while feature routes are being assembled.
 * @param {{ title: string }} props Current route heading.
 * @returns {JSX.Element} Authenticated workspace content.
 */
function Workspace({ title }) {
  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-12 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">WriteSpace</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">{title}</h1>
        <p className="mt-3 max-w-xl leading-7 text-slate-600">Your signed-in space keeps your writing and reading close at hand.</p>
      </section>
    </main>
  );
}

/**
 * Show a helpful fallback for unknown routes.
 * @returns {JSX.Element} Not-found content and a home link.
 */
function RouteNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 text-slate-600">That WriteSpace page does not exist.</p>
      <Link className="mt-6 inline-block font-semibold text-indigo-700 underline" to="/">Return home</Link>
    </main>
  );
}
