import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { clearSession } from '../utils/auth.js';

const navigation = {
  admin: [
    { label: 'All Blogs', to: '/blogs' },
    { label: 'Write', to: '/write' },
    { label: 'Users', to: '/users' },
  ],
  user: [
    { label: 'All Blogs', to: '/blogs' },
    { label: 'Write', to: '/write' },
  ],
};

/**
 * Render authenticated navigation with role-aware links and a mobile menu.
 * @param {{ session: object, onLogout?: Function }} props Navigation identity and optional logout callback.
 * @returns {JSX.Element} Authenticated navigation bar.
 */
export default function Navbar({ session, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();
  const links = navigation[session.role] ?? navigation.user;

  /** Clear the local session and return the visitor to the public page. */
  function logout() {
    clearSession();
    onLogout?.();
    navigate('/', { replace: true });
  }

  const linkClass = ({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white shadow-sm">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link aria-label="WriteSpace home" className="text-xl font-bold tracking-tight text-indigo-700" to="/">
          Write<span className="text-slate-800">Space</span>
        </Link>
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="rounded-lg p-2 text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <span aria-hidden="true" className="text-xl">{menuOpen ? '×' : '☰'}</span>
        </button>
        <div className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-full flex-col gap-1 border-b border-slate-200 bg-white p-4 shadow-sm md:static md:flex md:flex-1 md:flex-row md:items-center md:justify-end md:border-0 md:p-0 md:shadow-none`}>
          {links.map((item) => (
            <NavLink className={linkClass} key={item.to} onClick={() => setMenuOpen(false)} to={item.to}>
              {item.label}
            </NavLink>
          ))}
          <div className="relative md:ml-3">
            <button
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 md:w-auto"
              onClick={() => setAccountOpen((open) => !open)}
              type="button"
            >
              <Avatar role={session.role} />
              <span className="min-w-0">
                <span className="block max-w-36 truncate text-sm font-semibold text-slate-800">{session.displayName}</span>
                <span className="block text-xs capitalize text-slate-500">{session.role}</span>
              </span>
              <span aria-hidden="true" className="text-slate-500">⌄</span>
            </button>
            {accountOpen && (
              <div className="absolute left-0 top-full z-40 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-lg md:left-auto md:right-0 md:w-44" role="menu">
                <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" onClick={logout} role="menuitem" type="button">
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

Navbar.propTypes = {
  session: PropTypes.shape({ role: PropTypes.string.isRequired, displayName: PropTypes.string.isRequired }).isRequired,
  onLogout: PropTypes.func,
};
