import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Require an authenticated session and optionally the administrator role.
 * @param {{ session: object|null, adminOnly?: boolean, children: React.ReactNode }} props Route gate inputs.
 * @returns {JSX.Element} Protected content or a role-appropriate redirect.
 */
export default function ProtectedRoute({ session, adminOnly = false, children }) {
  const location = useLocation();
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (adminOnly && session.role !== 'admin') return <Navigate to="/blogs" replace />;
  return children;
}

ProtectedRoute.propTypes = {
  session: PropTypes.shape({ role: PropTypes.string }),
  adminOnly: PropTypes.bool,
  children: PropTypes.node.isRequired,
};
