import { Link, useNavigate, useParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import { getSession } from '../utils/auth.js';
import { getPosts, savePosts } from '../utils/storage.js';
import { formatPostDate } from '../components/BlogCard.jsx';

/**
 * Render a stored post with author/date metadata and owner-aware actions.
 * @returns {JSX.Element} Post detail or a not-found state.
 */
export default function ReadBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const posts = getPosts();
  const post = posts.find((entry) => entry.id === id);

  if (!post) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Post not found</h1>
        <p className="mt-3 text-slate-600">This post may have been removed or its link may be incorrect.</p>
        <Link className="mt-6 inline-flex font-semibold text-indigo-700 underline underline-offset-4" to="/blogs">Back to All Posts</Link>
      </main>
    );
  }

  const canManage = session?.role === 'admin' || post.authorId === session?.userId;

  /** Confirm, persist, and navigate after an authorized removal. */
  function handleDelete() {
    if (!canManage || !window.confirm('Are you sure you want to delete this post?')) return;
    if (!savePosts(posts.filter((entry) => entry.id !== id))) return;
    navigate('/blogs', { replace: true });
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900 focus-visible:outline-none focus-visible:underline" to="/blogs">← Back to All Posts</Link>
      <article className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">A WriteSpace story</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">{post.title}</h1>
        <div className="mt-7 flex flex-wrap items-center gap-3 border-b border-slate-100 pb-7">
          <Avatar role={post.authorRole ?? 'user'} />
          <span className="font-semibold text-slate-800">{post.authorName}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <time className="text-sm text-slate-500" dateTime={post.createdAt}>{formatPostDate(post.createdAt)}</time>
        </div>
        <div className="mt-8 whitespace-pre-wrap break-words text-lg leading-8 text-slate-700">{post.content}</div>
        {canManage && (
          <div className="mt-10 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            <Link className="rounded-lg border border-indigo-200 bg-white px-4 py-2.5 font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" to={`/edit/${post.id}`}>Edit post</Link>
            <button className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 font-semibold text-red-700 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" onClick={handleDelete} type="button">Delete post</button>
          </div>
        )}
      </article>
    </main>
  );
}
