import PropTypes from 'prop-types';

/**
 * Return the role-specific, decorative avatar required by WriteSpace.
 * @param {string} role Account role.
 * @returns {JSX.Element} Avatar element with an accessible role label.
 */
export function getAvatar(role) {
  const isAdmin = role === 'admin';
  return (
    <span
      aria-label={isAdmin ? 'Admin avatar' : 'User avatar'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-lg text-white ${isAdmin ? 'bg-violet-600' : 'bg-indigo-500'}`}
      role="img"
    >
      {isAdmin ? '♛' : '▤'}
    </span>
  );
}

/**
 * Render a role avatar for navigation and author details.
 * @param {{ role: string }} props Avatar presentation properties.
 * @returns {JSX.Element} Role-specific avatar.
 */
export default function Avatar({ role }) {
  return getAvatar(role);
}

Avatar.propTypes = { role: PropTypes.string.isRequired };
