import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { getSession } from '../utils/auth.js';
import { getPosts, savePosts } from '../utils/storage.js';

const MAX_CONTENT_LENGTH = 10000;

/**
 * Render the new/edit post form and persist authorized local post changes.
 * @returns {JSX.Element} Validated editor form.
 */
export default function WriteBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const existingPosts = getPosts();
  const existingPost = id ? existingPosts.find((post) => post.id === id) : null;
  const canEdit = Boolean(existingPost && (session?.role === 'admin' || existingPost.authorId === session?.userId));
  const [title, setTitle] = useState(existingPost?.title ?? '');
  const [content, setContent] = useState(existingPost?.content ?? '');
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');

  if (id && !canEdit) return <Navigate replace to="/blogs" />;

  /** Validate required fields and persist a new or updated post record. */
  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = 'Title is required.';
    if (!content.trim()) nextErrors.content = 'Content is required.';
    else if (content.length > MAX_CONTENT_LENGTH) nextErrors.content = `Content must be ${MAX_CONTENT_LENGTH} characters or fewer.`;
    setErrors(nextErrors);
    setSaveError('');
    if (Object.keys(nextErrors).length) return;
    if (!session) return;
    const timestamp = new Date().toISOString();
    const record = existingPost
      ? { ...existingPost, title: title.trim(), content: content.trim(), updatedAt: timestamp }
      : {
          id: crypto.randomUUID(),
          title: title.trim(),
          content: content.trim(),
          createdAt: timestamp,
          authorId: session.userId,
          authorName: session.displayName,
          authorRole: session.role,
        };
    const nextPosts = existingPost ? existingPosts.map((post) => post.id === id ? record : post) : [record, ...existingPosts];
    if (!savePosts(nextPosts)) {
      setSaveError('Unable to save this post. Check browser storage and try again.');
      return;
    }
    navigate(`/blog/${record.id}`, { replace: true });
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-4xl px-5 py-12 sm:px-8">
      <Link className="text-sm font-semibold text-indigo-700 hover:underline" to={existingPost ? `/blog/${existingPost.id}` : '/blogs'}>← Cancel</Link>
      <div className="mt-7">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">{existingPost ? 'Refine your story' : 'A blank page'}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{existingPost ? 'Edit post' : 'Write a post'}</h1>
        <p className="mt-3 text-slate-600">Keep it simple. Give your words room to breathe.</p>
      </div>
      <form
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
        noValidate
        onSubmit={handleSubmit}
      >
        <div>
          <label
            className="mb-2 block text-sm font-semibold text-slate-700"
            htmlFor="post-title"
          >
            Title
          </label>
          <input
            aria-describedby={errors.title ? 'post-title-error' : undefined}
            aria-invalid={Boolean(errors.title)}
            aria-required="true"
            className={
              'w-full rounded-lg border px-4 py-3 text-lg font-semibold text-slate-900 '
              + 'outline-none transition-colors focus:ring-2 '
              + (errors.title
                ? 'border-red-500 focus:ring-red-100'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100')
            }
            id="post-title"
            maxLength={160}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give your story a title"
            required
            value={title}
          />
          {errors.title && (
            <p
              aria-live="assertive"
              className="mt-2 text-sm text-red-700"
              id="post-title-error"
              role="alert"
            >
              {errors.title}
            </p>
          )}
        </div>
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-slate-700" htmlFor="post-content">
              Content
            </label>
            <span className="text-xs tabular-nums text-slate-500">{content.length} characters</span>
          </div>
          <textarea
            aria-describedby={errors.content ? 'post-content-error' : undefined}
            aria-invalid={Boolean(errors.content)}
            aria-required="true"
            className={
              'min-h-64 w-full resize-y rounded-lg border px-4 py-3 leading-7 text-slate-800 '
              + 'outline-none transition-colors focus:ring-2 '
              + (errors.content
                ? 'border-red-500 focus:ring-red-100'
                : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100')
            }
            id="post-content"
            maxLength={MAX_CONTENT_LENGTH}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Start with a thought..."
            required
            value={content}
          />
          {errors.content && (
            <p
              aria-live="assertive"
              className="mt-2 text-sm text-red-700"
              id="post-content-error"
              role="alert"
            >
              {errors.content}
            </p>
          )}
        </div>
        {saveError && (
          <p
            aria-live="assertive"
            className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {saveError}
          </p>
        )}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            className={
              'rounded-lg px-4 py-3 text-center font-semibold text-slate-600 hover:bg-slate-100 '
              + 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400'
            }
            to={existingPost ? `/blog/${existingPost.id}` : '/blogs'}
          >
            Cancel
          </Link>
          <button
            className={
              'rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm '
              + 'transition-colors hover:bg-indigo-700 focus-visible:outline-none '
              + 'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
            }
            type="submit"
          >
            {existingPost ? 'Save changes' : 'Publish post'}
          </button>
        </div>
      </form>
    </main>
  );
}
