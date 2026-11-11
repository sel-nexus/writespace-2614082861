import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';

const accents = ['border-indigo-500', 'border-violet-500', 'border-pink-500', 'border-teal-500'];

/**
 * Format a stored timestamp for a readable post card.
 * @param {string} value Post timestamp.
 * @returns {string} Display date or a safe fallback.
 */
export function formatPostDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

/**
 * Render a post preview with author identity and role-aware edit access.
 * @param {{ post: object, index: number, session: object }} props Post and viewing identity.
 * @returns {JSX.Element} Clickable post card.
 */
export default function BlogCard({ post, index, session }) {
  const canEdit = session.role === 'admin' || post.authorId === session.userId;
  return (
    <article
      className={`relative flex min-h-64 flex-col rounded-2xl border border-slate-200 border-t-4 ${accents[index % accents.length]} bg-white p-6 transition-transform hover:-translate-y-1 hover:shadow-lg`}
    >
      <Link
        aria-label={`Read ${post.title}`}
        className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        to={`/blog/${post.id}`}
      />
      <div className="relative z-10 flex items-start justify-between gap-3 pointer-events-none">
        <time
          className="text-xs font-semibold uppercase tracking-wider text-slate-500"
          dateTime={post.createdAt}
        >
          {formatPostDate(post.createdAt)}
        </time>
        {canEdit && (
          <Link
            aria-label={`Edit ${post.title}`}
            className="pointer-events-auto rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            onClick={(event) => event.stopPropagation()}
            to={`/edit/${post.id}`}
          >
            Edit
          </Link>
        )}
      </div>
      <Link
        className="relative z-10 mt-5 text-2xl font-bold leading-tight text-slate-900 hover:text-indigo-700 focus-visible:outline-none focus-visible:underline"
        to={`/blog/${post.id}`}
      >
        {post.title}
      </Link>
      <p className="mt-3 flex-1 whitespace-pre-wrap leading-7 text-slate-600">
        {post.content.slice(0, 120)}
        {post.content.length > 120 ? '…' : ''}
      </p>
      <div className="relative z-10 mt-6 flex items-center gap-3 border-t border-slate-100 pt-4 pointer-events-none">
        <Avatar role={post.authorRole ?? 'user'} />
        <span className="text-sm font-semibold text-slate-700">{post.authorName}</span>
      </div>
    </article>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({ id: PropTypes.string.isRequired, title: PropTypes.string.isRequired, content: PropTypes.string.isRequired, createdAt: PropTypes.string.isRequired, authorId: PropTypes.string.isRequired, authorName: PropTypes.string.isRequired, authorRole: PropTypes.string }).isRequired,
  index: PropTypes.number.isRequired,
  session: PropTypes.shape({ userId: PropTypes.string.isRequired, role: PropTypes.string.isRequired }).isRequired,
};
