import PropTypes from 'prop-types';
import Avatar from './Avatar.jsx';

/**
 * Display a locally managed account and enforce non-deletable account rules.
 * @param {{ account: object, currentUserId: string, onDelete: Function }} props Account row inputs.
 * @returns {JSX.Element} Desktop row and mobile account card.
 */
export default function UserRow({ account, currentUserId, onDelete, layout = 'mobile' }) {
  const isDefaultAdmin = account.username === 'admin' && account.role === 'admin';
  const isCurrentUser = account.id === currentUserId;
  const blocked = isDefaultAdmin || isCurrentUser;
  const reason = isDefaultAdmin ? 'Default admin cannot be deleted.' : 'You cannot delete your own account.';
  const created = new Date(account.createdAt);
  const createdDate = Number.isNaN(created.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(created);

  if (layout === 'desktop') {
    return (
      <tr className="border-t border-slate-100">
        <td className="px-5 py-4">
          <div className="flex items-center gap-3"><Avatar role={account.role} /><span className="font-semibold text-slate-900">{account.displayName}</span></div>
        </td>
        <td className="px-5 py-4 text-slate-600">{account.username}</td>
        <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${account.role === 'admin' ? 'bg-violet-100 text-violet-800 ring-1 ring-violet-300' : 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-300'}`}>{account.role}</span></td>
        <td className="px-5 py-4 text-slate-500">{createdDate}</td>
        <td className="px-5 py-4 text-right"><DeleteControl blocked={blocked} onDelete={() => onDelete(account)} reason={reason} /></td>
      </tr>
    );
  }

  return (
      <article className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3"><Avatar role={account.role} /><div><h3 className="font-semibold text-slate-900">{account.displayName}</h3><p className="text-sm text-slate-500">@{account.username}</p></div></div>
        <div className="mt-4 flex items-center justify-between gap-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${account.role === 'admin' ? 'bg-violet-100 text-violet-800 ring-1 ring-violet-300' : 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-300'}`}>{account.role}</span><time className="text-xs text-slate-500" dateTime={account.createdAt}>{createdDate}</time></div>
        <div className="mt-4"><DeleteControl blocked={blocked} onDelete={() => onDelete(account)} reason={reason} /></div>
      </article>
  );
}

/**
 * Render an enabled delete action or an explanatory disabled control.
 * @param {{ blocked: boolean, reason: string, onDelete: Function }} props Deletion state.
 * @returns {JSX.Element} Delete button with accessible block explanation.
 */
function DeleteControl({ blocked, reason, onDelete }) {
  if (blocked) return <button aria-label={reason} className="cursor-not-allowed rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-400" disabled title={reason} type="button">Delete</button>;
  return <button className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" onClick={onDelete} type="button">Delete</button>;
}

UserRow.propTypes = {
  account: PropTypes.shape({ id: PropTypes.string.isRequired, displayName: PropTypes.string.isRequired, username: PropTypes.string.isRequired, role: PropTypes.string.isRequired, createdAt: PropTypes.string.isRequired }).isRequired,
  currentUserId: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  layout: PropTypes.oneOf(['desktop', 'mobile']),
};
DeleteControl.propTypes = { blocked: PropTypes.bool.isRequired, reason: PropTypes.string.isRequired, onDelete: PropTypes.func.isRequired };
