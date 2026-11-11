import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
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

/**
 * Render the WriteSpace route table and synchronize local identity changes.
 * @returns {JSX.Element} Application routes and authenticated navigation.
 */
export default function App() {
  const [session, setSessionState] = useState(() => getSession());

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
