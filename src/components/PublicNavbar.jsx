import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { getRoleHome } from '../utils/auth.js';

/**
 * Render public navigation and role-aware dashboard links.
 * @param {{ session?: object|null }} props Current signed-in identity, when present.
 * @returns {JSX.Element} Public or authenticated entry navigation.
 */
export default function PublicNavbar({ session = null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link aria-label="WriteSpace home" className="text-xl font-bold tracking-tight text-indigo-700" to="/">
          Write<span className="text-slate-800">Space</span>
        </Link>
        {session ? (
          <div className="flex items-center gap-3">
            <Avatar role={session.role} />
            <span className="hidden text-sm font-semibold text-slate-800 sm:inline">{session.displayName}</span>
            <Link className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2" to={getRoleHome(session)}>
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" to="/login">
              Login
            </Link>
            <Link className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2" to="/register">
              Get Started
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

PublicNavbar.propTypes = {
  session: PropTypes.shape({ role: PropTypes.string.isRequired, displayName: PropTypes.string.isRequired }),
};
