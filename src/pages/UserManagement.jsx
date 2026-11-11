import { useState } from 'react';
import UserRow from '../components/UserRow.jsx';
import { getSession } from '../utils/auth.js';
import { getUsers, saveUsers } from '../utils/storage.js';

const blankForm = { displayName: '', username: '', password: '', role: 'user' };
const defaultAdmin = { id: 'admin', displayName: 'Admin', username: 'admin', role: 'admin', createdAt: '2000-01-01T00:00:00.000Z' };

/**
 * Render local user administration with account validation and delete safeguards.
 * @returns {JSX.Element} User list, account creation form, and feedback.
 */
export default function UserManagement() {
  const session = getSession();
  const [users, setUsers] = useState(() => [defaultAdmin, ...getUsers()]);
  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');

  /** Update a field while clearing its current validation feedback. */
  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  /** Validate account values and save a UUID-backed administrator-created account. */
  function createUser(event) {
    event.preventDefault();
    setNotice('');
    const nextErrors = {};
    if (!form.displayName.trim()) nextErrors.displayName = 'Display name is required.';
    if (!form.username.trim()) nextErrors.username = 'Username is required.';
    else if (form.username.trim().toLowerCase() === 'admin' || users.some((user) => user.username.toLowerCase() === form.username.trim().toLowerCase())) nextErrors.username = 'That username is already taken.';
    if (!form.password) nextErrors.password = 'Password is required.';
    if (!['admin', 'user'].includes(form.role)) nextErrors.role = 'Choose a valid role.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const account = { id: crypto.randomUUID(), displayName: form.displayName.trim(), username: form.username.trim(), password: form.password, role: form.role, createdAt: new Date().toISOString() };
    const nextUsers = [...users.filter((user) => user.username !== 'admin'), account];
    if (!saveUsers(nextUsers)) {
      setNotice('Unable to save this account. Check browser storage and try again.');
      return;
    }
    setUsers([defaultAdmin, ...nextUsers.filter((user) => user.username !== 'admin')]);
    setForm(blankForm);
    setNotice(`${account.displayName} was added.`);
  }

  /** Require confirmation and prevent removal of default/current accounts. */
  function deleteUser(account) {
    if (account.username === 'admin' || account.id === session?.userId) return;
    if (!window.confirm(`Delete the account for ${account.displayName}?`)) return;
    const nextUsers = users.filter((user) => user.id !== account.id);
    if (!saveUsers(nextUsers.filter((user) => user.username !== 'admin'))) {
      setNotice('Unable to delete this account. Check browser storage and try again.');
      return;
    }
    setUsers([defaultAdmin, ...nextUsers.filter((user) => user.username !== 'admin')]);
    setNotice(`${account.displayName} was removed.`);
  }

  const fieldError = (name) =>
    errors[name] && (
      <p
        aria-live="assertive"
        className="mt-1 text-sm text-red-700"
        id={`create-${name}-error`}
        role="alert"
      >
        {errors[name]}
      </p>
    );

  return (
    <main
      className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-10 sm:px-6"
    >
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-600">
          Account administration
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
          Manage Users
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          Create local demo accounts and manage access in this browser. Passwords are stored as
          plain text; use demo-only credentials.
        </p>
      </div>
      <section
        aria-labelledby="create-user-heading"
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
      >
        <h2 className="text-2xl font-bold text-slate-900" id="create-user-heading">
          Create User
        </h2>
        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          noValidate
          onSubmit={createUser}
        >
          <div>
            <label
              className="mb-1.5 block text-sm font-semibold text-slate-700"
              htmlFor="create-displayName"
            >
              Display Name
            </label>
            <input
              aria-describedby={errors.displayName ? 'create-displayName-error' : undefined}
              aria-invalid={Boolean(errors.displayName)}
              aria-required="true"
              autoComplete="name"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              id="create-displayName"
              name="displayName"
              onChange={updateForm}
              required
              value={form.displayName}
            />
            {fieldError('displayName')}
          </div>
          <div>
            <label
              className="mb-1.5 block text-sm font-semibold text-slate-700"
              htmlFor="create-username"
            >
              Username
            </label>
            <input
              aria-describedby={errors.username ? 'create-username-error' : undefined}
              aria-invalid={Boolean(errors.username)}
              aria-required="true"
              autoComplete="username"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              id="create-username"
              name="username"
              onChange={updateForm}
              required
              value={form.username}
            />
            {fieldError('username')}
          </div>
          <div>
            <label
              className="mb-1.5 block text-sm font-semibold text-slate-700"
              htmlFor="create-password"
            >
              Password
            </label>
            <input
              aria-describedby={errors.password ? 'create-password-error' : undefined}
              aria-invalid={Boolean(errors.password)}
              aria-required="true"
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              id="create-password"
              name="password"
              onChange={updateForm}
              required
              type="password"
              value={form.password}
            />
            {fieldError('password')}
          </div>
          <div>
            <label
              className="mb-1.5 block text-sm font-semibold text-slate-700"
              htmlFor="create-role"
            >
              Role
            </label>
            <select
              aria-describedby={errors.role ? 'create-role-error' : undefined}
              aria-invalid={Boolean(errors.role)}
              aria-required="true"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              id="create-role"
              name="role"
              onChange={updateForm}
              value={form.role}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {fieldError('role')}
          </div>
          <div className="sm:col-span-2">
            <button
              className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              type="submit"
            >
              Create Account
            </button>
          </div>
        </form>
        {notice && (
          <p
            aria-live="polite"
            className="mt-4 rounded-lg bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-800"
            role="status"
          >
            {notice}
          </p>
        )}
      </section>
      <section
        aria-labelledby="account-list-heading"
        className="mt-9"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">
              The people who write here
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900" id="account-list-heading">
              Registered Accounts
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {users.length} local {users.length === 1 ? 'account' : 'accounts'}
          </p>
        </div>
        {users.length ? (
          <>
            <div className="mt-5 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3" scope="col">
                      Account
                    </th>
                    <th className="px-5 py-3" scope="col">
                      Username
                    </th>
                    <th className="px-5 py-3" scope="col">
                      Role
                    </th>
                    <th className="px-5 py-3" scope="col">
                      Created
                    </th>
                    <th className="px-5 py-3 text-right" scope="col">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((account) => (
                    <UserRow
                      account={account}
                      currentUserId={session?.userId ?? ''}
                      key={account.id}
                      layout="desktop"
                      onDelete={deleteUser}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 grid gap-3 md:hidden">
              {users.map((account) => (
                <UserRow
                  account={account}
                  currentUserId={session?.userId ?? ''}
                  key={account.id}
                  layout="mobile"
                  onDelete={deleteUser}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-9 text-center text-slate-600">
            No user-created accounts yet.
          </p>
        )}
      </section>
    </main>
  );
}
