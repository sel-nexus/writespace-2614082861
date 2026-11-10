const POSTS_KEY = 'writespace_posts';
const USERS_KEY = 'writespace_users';

/**
 * Read a JSON array from browser storage without allowing malformed data to crash the app.
 * @param {string} key Storage key to read.
 * @returns {Array} Parsed array or an empty array when storage is unavailable or invalid.
 */
function readArray(key) {
  try {
    const serialized = window.localStorage.getItem(key);
    if (serialized === null) return [];
    const value = JSON.parse(serialized);
    return Array.isArray(value) ? value : [];
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
