import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPosts, getUsers, savePosts, saveUsers, storageKeys } from './storage.js';

describe('local storage data helpers', () => {
  beforeEach(() => window.localStorage.clear());

  it('returns empty arrays when no post or user data has been saved', () => {
    expect(getPosts()).toEqual([]);
    expect(getUsers()).toEqual([]);
  });

  it('persists and returns valid post and user arrays', () => {
    const posts = [{ id: 'post-1', title: 'First' }];
    const users = [{ id: 'user-1', username: 'reader' }];
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
