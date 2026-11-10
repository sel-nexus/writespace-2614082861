const SESSION_KEY = 'writespace_session';

/**
 * Read the current session and reject malformed or unsupported role data.
 * @returns {object|null} Valid session or null when no usable session exists.
 */
export function getSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || typeof session !== 'object' || !['admin', 'user'].includes(session.role)) return null;
    if (typeof session.userId !== 'string' || typeof session.username !== 'string') return null;
    if (typeof session.displayName !== 'string') return null;
    return session;
  } catch {
    return null;
  }
}

/**
 * Persist a session only when it contains the identity and role fields the app consumes.
 * @param {object} session Session details to persist.
 * @returns {boolean} Whether the session was stored.
 */
export function setSession(session) {
  if (!session || typeof session !== 'object' || !['admin', 'user'].includes(session.role)) return false;
  if (![session.userId, session.username, session.displayName].every((value) => typeof value === 'string')) return false;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove the active browser session.
 * @returns {boolean} Whether storage was cleared or already empty.
 */
export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Select the authenticated home route for a supported role.
 * @param {object|null} session Current session.
 * @returns {string} Role home route, or the login route for an absent/invalid session.
 */
export function getRoleHome(session) {
  if (session?.role === 'admin') return '/admin';
  if (session?.role === 'user') return '/blogs';
  return '/login';
}

export const sessionKey = SESSION_KEY;
