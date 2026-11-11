const POSTS_KEY = 'writespace_posts';
const USERS_KEY = 'writespace_users';

/**
 * Read a JSON array from browser storage without allowing malformed data to crash the app.
 * @param {string} key Storage key to read.
 * @returns {Array} Parsed array or an empty array when storage is unavailable or invalid.
 */
function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Reject stored entries whose fields are unsafe for the app's consumers. */
function isValidRecord(key, value) {
  if (!isRecord(value)) return false;
  if (key === POSTS_KEY) {
    return ['id', 'title', 'content', 'createdAt', 'authorId', 'authorName']
      .every((field) => typeof value[field] === 'string');
  }
  return ['id', 'username', 'displayName', 'password', 'createdAt']
    .every((field) => typeof value[field] === 'string')
    && ['admin', 'user'].includes(value.role);
}

function readArray(key) {
  try {
    const serialized = window.localStorage.getItem(key);
    if (serialized === null) return [];
    const value = JSON.parse(serialized);
    return Array.isArray(value) ? value.filter((record) => isValidRecord(key, record)) : [];
  } catch {
    return [];
  }
}

/**
 * Persist an array as JSON in browser storage.
 * @param {string} key Storage key to write.
 * @param {Array} value Array value to persist.
 * @returns {boolean} Whether the value was stored successfully.
 */
function writeArray(key, value) {
  if (!Array.isArray(value)) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Return the stored posts, using an empty array for unavailable or invalid storage.
 * @returns {Array} Stored post records.
 */
export function getPosts() {
  return readArray(POSTS_KEY);
}

/**
 * Save a post array to browser storage.
 * @param {Array} posts Post records to save.
 * @returns {boolean} Whether persistence succeeded.
 */
export function savePosts(posts) {
  return writeArray(POSTS_KEY, posts);
}

/**
 * Return locally registered accounts, using an empty array for unavailable or invalid storage.
 * @returns {Array} Stored account records.
 */
export function getUsers() {
  return readArray(USERS_KEY);
}

/**
 * Save locally registered accounts to browser storage.
 * @param {Array} users Account records to save.
 * @returns {boolean} Whether persistence succeeded.
 */
export function saveUsers(users) {
  return writeArray(USERS_KEY, users);
}

export const storageKeys = Object.freeze({ posts: POSTS_KEY, users: USERS_KEY });
