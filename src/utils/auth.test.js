import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearSession, getRoleHome, getSession, sessionKey, setSession } from './auth.js';

const userSession = { userId: 'user-1', username: 'reader', displayName: 'Reader', role: 'user' };

describe('session helpers', () => {
  beforeEach(() => window.localStorage.clear());

  it('persists, reads, and clears a valid session', () => {
    expect(setSession(userSession)).toBe(true);
    expect(getSession()).toEqual(userSession);
    expect(window.localStorage.getItem(sessionKey)).toBe(JSON.stringify(userSession));
    expect(clearSession()).toBe(true);
    expect(getSession()).toBeNull();
  });

  it('rejects missing fields and unsupported roles when setting a session', () => {
    expect(setSession(null)).toBe(false);
    expect(setSession({ ...userSession, role: 'owner' })).toBe(false);
    expect(setSession({ role: 'user' })).toBe(false);
    expect(getSession()).toBeNull();
  });

  it('fails closed for corrupt data, wrong shape, or storage failures', () => {
    window.localStorage.setItem(sessionKey, 'bad json');
    expect(getSession()).toBeNull();
    window.localStorage.setItem(sessionKey, JSON.stringify({ ...userSession, userId: 4 }));
    expect(getSession()).toBeNull();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('blocked'); });
    expect(getSession()).toBeNull();
  });

  it('resolves role homes and sends absent or invalid sessions to login', () => {
    expect(getRoleHome({ role: 'admin' })).toBe('/admin');
    expect(getRoleHome(userSession)).toBe('/blogs');
    expect(getRoleHome(null)).toBe('/login');
    expect(getRoleHome({ role: 'visitor' })).toBe('/login');
  });
});
