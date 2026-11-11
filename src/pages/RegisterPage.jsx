import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUsers, saveUsers } from '../utils/storage.js';
import { setSession } from '../utils/auth.js';

const initialValues = { displayName: '', username: '', password: '', confirmPassword: '' };

/**
 * Validate the required registration fields and unique username.
 * @param {object} values Submitted registration fields.
 * @param {Array} users Existing locally registered users.
 * @returns {object} Field-name-to-message validation map.
 */
function validateRegistration(values, users) {
  const errors = {};
  if (!values.displayName.trim()) errors.displayName = 'Display name is required.';
  if (!values.username.trim()) errors.username = 'Username is required.';
  else if (values.username.trim().toLowerCase() === 'admin' || users.some((user) => user.username.toLowerCase() === values.username.trim().toLowerCase())) errors.username = 'That username is already taken.';
  if (!values.password) errors.password = 'Password is required.';
  if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your password.';
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

/**
 * Render local account registration with field-level errors and automatic sign-in.
 * @returns {JSX.Element} User registration page.
 */
export default function RegisterPage() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [storageError, setStorageError] = useState('');
  const navigate = useNavigate();

  /** Update a form field and clear only its prior validation message. */
  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  /** Validate and persist a new user and session in browser storage. */
  function handleSubmit(event) {
    event.preventDefault();
    setStorageError('');
    const users = getUsers();
    const validationErrors = validateRegistration(values, users);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;
    const account = {
      id: crypto.randomUUID(),
      displayName: values.displayName.trim(),
      username: values.username.trim(),
      password: values.password,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    if (!saveUsers([...users, account])) {
      setStorageError('Unable to save your account. Check browser storage and try again.');
      return;
    }
    const session = { userId: account.id, username: account.username, displayName: account.displayName, role: account.role };
    if (!setSession(session)) {
      setStorageError('Your account was created, but the session could not be saved. Please log in.');
      return;
    }
    window.dispatchEvent(new Event('writespace-session-change'));
    navigate('/blogs', { replace: true });
  }

  const field = (name, label, type = 'text', autoComplete = name) => (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor={`register-${name}`}>{label}</label>
      <input aria-describedby={errors[name] ? `register-${name}-error` : undefined} aria-invalid={Boolean(errors[name])} aria-required="true" autoComplete={autoComplete} className={`w-full rounded-lg border px-3.5 py-3 text-slate-900 outline-none transition-colors focus:ring-2 ${errors[name] ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'}`} id={`register-${name}`} name={name} onChange={updateField} required type={type} value={values[name]} />
      {errors[name] && <p aria-live="assertive" className="mt-1.5 text-sm text-red-700" id={`register-${name}-error`} role="alert">{errors[name]}</p>}
    </div>
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 px-5 py-10">
      <section className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl sm:p-9">
        <Link aria-label="WriteSpace home" className="mx-auto block w-fit text-2xl font-extrabold tracking-tight text-indigo-700" to="/">WriteSpace</Link>
        <p className="mt-5 text-center text-sm font-semibold uppercase tracking-wider text-indigo-600">A fresh page</p>
        <h1 className="mt-2 text-center text-3xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-3 text-center text-slate-600">Join WriteSpace and make room for your next idea.</p>
        <form className="mt-7 space-y-4" noValidate onSubmit={handleSubmit}>
          {field('displayName', 'Display Name', 'text', 'name')}
          {field('username', 'Username', 'text', 'username')}
          {field('password', 'Password', 'password', 'new-password')}
          {field('confirmPassword', 'Confirm Password', 'password', 'new-password')}
          {storageError && <p aria-live="assertive" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">{storageError}</p>}
          <button className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2" type="submit">Get Started</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link className="font-semibold text-indigo-700 underline underline-offset-2" to="/login">Login</Link></p>
        <p className="mt-4 text-center text-xs text-slate-500">Local demo only. Do not use a real password.</p>
      </section>
    </main>
  );
}
