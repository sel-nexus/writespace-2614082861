import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPosts, getUsers, savePosts, saveUsers, storageKeys } from './storage.js';

describe('local storage data helpers', () => {
  beforeEach(() => window.localStorage.clear());

  it('returns empty arrays when no post or user data has been saved', () => {
    expect(getPosts()).toEqual([]);
    expect(getUsers()).toEqual([]);
  });

  it('persists and returns valid post and user arrays', () => {
    const posts = [{ id: 'post-1', title: 'First', content: 'Words', createdAt: '2025-01-01T00:00:00.000Z', authorId: 'user-1', authorName: 'Reader' }];
    const users = [{ id: 'user-1', username: 'reader', displayName: 'Reader', password: 'local-only', role: 'user', createdAt: '2025-01-01T00:00:00.000Z' }];
    expect(savePosts(posts)).toBe(true);
    expect(saveUsers(users)).toBe(true);
    expect(getPosts()).toEqual(posts);
    expect(getUsers()).toEqual(users);
    expect(window.localStorage.getItem(storageKeys.posts)).toBe(JSON.stringify(posts));
  });

  it('uses empty arrays when the stored JSON is corrupt or not an array', () => {
    window.localStorage.setItem(storageKeys.posts, '{not-json');
    window.localStorage.setItem(storageKeys.users, JSON.stringify({ username: 'reader' }));
    expect(getPosts()).toEqual([]);
    expect(getUsers()).toEqual([]);
  });

  it('filters null, primitive, and malformed records from stored arrays', () => {
    const validPost = { id: 'p-1', title: 'Story', content: 'Text', createdAt: '2025-01-01T00:00:00.000Z', authorId: 'u-1', authorName: 'Reader' };
    const validUser = { id: 'u-1', username: 'reader', displayName: 'Reader', password: 'local-only', role: 'user', createdAt: '2025-01-01T00:00:00.000Z' };
    window.localStorage.setItem(storageKeys.posts, JSON.stringify([validPost, null, 17, { ...validPost, createdAt: 42 }]));
    window.localStorage.setItem(storageKeys.users, JSON.stringify([validUser, null, 'bad-record', { ...validUser, role: 'superuser' }]));
    expect(getPosts()).toEqual([validPost]);
    expect(getUsers()).toEqual([validUser]);
  });

  it('returns an empty array when browser storage throws during a read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('blocked'); });
    expect(getPosts()).toEqual([]);
    expect(getUsers()).toEqual([]);
  });

  it('rejects non-array writes and reports storage write failures', () => {
    expect(savePosts({ id: 'not-an-array' })).toBe(false);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('quota'); });
    expect(saveUsers([{ id: 'user-1' }])).toBe(false);
  });
});
