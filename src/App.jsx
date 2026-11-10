import { useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { getRoleHome, getSession } from './utils/auth.js';

/**
 * Render the foundational authenticated shell and role-protected route map.
 * @returns {JSX.Element} WriteSpace application shell.
 */
export default function App() {
  const [session, setSessionState] = useState(() => getSession());

  /** Refresh the shell after the navbar removes the persisted session. */
  function handleLogout() {
    setSessionState(null);
  }

  return (
    <>
      {session && <Navbar onLogout={handleLogout} session={session} />}
      <Routes>
        <Route element={<Landing />} path="/" />
        <Route element={<SessionRedirect session={session} />} path="/login" />
        <Route element={<SessionRedirect session={session} />} path="/register" />
        <Route element={<ProtectedRoute session={session}><Workspace /></ProtectedRoute>} path="/blogs" />
        <Route element={<ProtectedRoute session={session}><Workspace /></ProtectedRoute>} path="/blog/:id" />
        <Route element={<ProtectedRoute session={session}><Workspace /></ProtectedRoute>} path="/write" />
        <Route element={<ProtectedRoute session={session}><Workspace /></ProtectedRoute>} path="/edit/:id" />
        <Route element={<ProtectedRoute adminOnly session={session}><Workspace /></ProtectedRoute>} path="/admin" />
        <Route element={<ProtectedRoute adminOnly session={session}><Workspace /></ProtectedRoute>} path="/users" />
        <Route element={<RouteNotFound />} path="*" />
      </Routes>
    </>
  );
}

/**
 * Render the foundational public entry surface.
 * @returns {JSX.Element} Public introduction and entry links.
 */
function Landing() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-6 py-16">
      <section className="w-full max-w-3xl rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 px-8 py-16 text-center text-white shadow-xl sm:px-16">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">A local space for words</p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">WriteSpace</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/90">Your thoughts. Your space. Beautifully simple.</p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-violet-600" to="/login">Start reading</Link>
          <Link className="rounded-xl border border-white/70 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" to="/register">Get started</Link>
        </div>
      </section>
    </main>
  );
}

/**
 * Send an already-authenticated visitor to their role-specific home.
 * @param {{ session: object|null }} props Current application session.
 * @returns {JSX.Element} Redirect or public-entry link.
 */
function SessionRedirect({ session }) {
  if (session) return <Navigate replace to={getRoleHome(session)} />;
  return <LoginEntry />;
}

/**
 * Render a focused sign-in entry for routes that require authentication.
 * @returns {JSX.Element} Sign-in prompt for a guest.
 */
function LoginEntry() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 px-5 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">WriteSpace</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Sign in to continue</h1>
        <p className="mt-3 text-slate-600">This page will provide account access in the next feature slice.</p>
        <Link className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2" to="/">Return to WriteSpace</Link>
      </section>
    </main>
  );
}

/**
 * Render the shared authenticated workspace base.
 * @returns {JSX.Element} Authenticated route surface.
 */
function Workspace() {
  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-12 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">WriteSpace</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Your writing space</h1>
        <p className="mt-3 max-w-xl leading-7 text-slate-600">Your signed-in space is ready. Explore posts, write something new, or manage the local blog from the navigation above.</p>
      </section>
    </main>
  );
}

/**
 * Show a useful public fallback for unknown paths.
 * @returns {JSX.Element} Not-found message and home link.
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
