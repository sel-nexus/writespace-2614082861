import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUsers } from '../utils/storage.js';
import { getRoleHome, setSession } from '../utils/auth.js';

/**
 * Render the local demo login form and establish a role-specific session.
 * @returns {JSX.Element} Login page with field-level feedback.
 */
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  /** Validate credentials, persist a valid session, and route to the user's home. */
  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    let account = null;
    if (username === 'admin' && password === 'admin') {
      account = { userId: 'admin', username: 'admin', displayName: 'Admin', role: 'admin' };
    } else {
      account = getUsers().find((user) => user.username.toLowerCase() === username.trim().toLowerCase() && user.password === password) ?? null;
    }
    if (!account) {
      setError('Invalid username or password.');
      return;
    }
    const session = { userId: account.id ?? account.userId, username: account.username, displayName: account.displayName, role: account.role };
    if (!setSession(session)) {
      setError('Unable to save your session. Check browser storage and try again.');
      return;
    }
    window.dispatchEvent(new Event('writespace-session-change'));
    const requestedPath = location.state?.from;
    navigate(requestedPath && requestedPath !== '/admin' ? requestedPath : getRoleHome(session), { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 px-5 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl sm:p-9">
        <Link aria-label="WriteSpace home" className="mx-auto block w-fit text-2xl font-extrabold tracking-tight text-indigo-700" to="/">WriteSpace</Link>
        <p className="mt-5 text-center text-sm font-semibold uppercase tracking-wider text-indigo-600">Welcome back</p>
        <h1 className="mt-2 text-center text-3xl font-bold text-slate-900">Log in to WriteSpace</h1>
        <p className="mt-3 text-center text-slate-600">Sign in to read, write, and find your next idea.</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="login-username">Username</label>
            <input aria-invalid={Boolean(error)} aria-required="true" autoComplete="username" className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" id="login-username" onChange={(event) => setUsername(event.target.value)} required value={username} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="login-password">Password</label>
            <input aria-invalid={Boolean(error)} aria-required="true" autoComplete="current-password" className="w-full rounded-lg border border-slate-300 px-3.5 py-3 text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" id="login-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </div>
          {error && <p aria-live="assertive" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700" role="alert">{error}</p>}
          <button className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2" type="submit">Login</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">New to WriteSpace? <Link className="font-semibold text-indigo-700 underline underline-offset-2" to="/register">Register</Link></p>
        <p className="mt-4 rounded-lg bg-indigo-50 px-3 py-2 text-center text-xs text-indigo-800">Demo administrator: <strong>admin</strong> / <strong>admin</strong></p>
      </section>
    </main>
  );
}
