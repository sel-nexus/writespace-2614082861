import { Link } from 'react-router-dom';
import { useState } from 'react';
import StatCard from '../components/StatCard.jsx';
import { getSession } from '../utils/auth.js';
import { getPosts, getUsers, savePosts } from '../utils/storage.js';
import { formatPostDate } from '../components/BlogCard.jsx';

/**
 * Render account/content counts and quick access to administrator tasks.
 * @returns {JSX.Element} Administrator dashboard.
 */
export default function AdminDashboard() {
  const session = getSession();
  const [posts, setPosts] = useState(() => getPosts().sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)));
  const users = getUsers();
  const adminCount = users.filter((user) => user.role === 'admin').length + 1;
  const stats = [
    { label: 'Total Posts', value: posts.length, tone: 'indigo' },
    { label: 'Total Users', value: users.length, tone: 'violet' },
    { label: 'Total Admins', value: adminCount, tone: 'teal' },
    { label: 'Total users', value: users.length, tone: 'pink' },
  ];

  /** Confirm and persist removal of any post from the dashboard. */
  function deletePost(postId) {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    const nextPosts = posts.filter((post) => post.id !== postId);
    if (savePosts(nextPosts)) setPosts(nextPosts);
  }

  return (
    <main
      className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-10 sm:px-6"
    >
      <section
        className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-10 text-white shadow-lg sm:px-9"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
          Administrator overview
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Good to see you, {session?.displayName ?? 'Admin'}.
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-white/90">
          A clear view of the stories and accounts in your local WriteSpace.
        </p>
      </section>
      <section
        aria-label="Blog and account statistics"
        className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>
      <section
        aria-label="Administrator quick actions"
        className="mt-7 grid gap-4 sm:grid-cols-2"
      >
        <Link
          className="group rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-indigo-300 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          to="/write"
        >
          <span aria-hidden="true" className="text-2xl text-indigo-600">
            ＋
          </span>
          <h2 className="mt-3 text-xl font-bold text-slate-900">
            Write New Post
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Share a new story with your readers.
          </p>
        </Link>
        <Link
          className="group rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-violet-300 hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          to="/users"
        >
          <span aria-hidden="true" className="text-2xl text-violet-600">
            ◎
          </span>
          <h2 className="mt-3 text-xl font-bold text-slate-900">
            Manage Users
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Create accounts and review local membership.
          </p>
        </Link>
      </section>
      <section
        aria-labelledby="recent-posts-heading"
        className="mt-10"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">
              The latest activity
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900" id="recent-posts-heading">
              Recent Posts
            </h2>
          </div>
          <Link
            className="font-semibold text-indigo-700 underline underline-offset-4"
            to="/blogs"
          >
            View all posts
          </Link>
        </div>
        {posts.length ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {posts.slice(0, 5).map((post) => (
              <article
                className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 last:border-b-0"
                key={post.id}
              >
                <div className="min-w-0 flex-1">
                  <Link
                    className="block truncate font-semibold text-slate-900 hover:text-indigo-700"
                    to={`/blog/${post.id}`}
                  >
                    {post.title}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">
                    {post.authorName} · {formatPostDate(post.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    className="rounded-lg border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                    to={`/edit/${post.id}`}
                  >
                    Edit
                  </Link>
                  <button
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                    onClick={() => deletePost(post.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-9 text-center text-slate-600">
            No posts yet — create the first one.
          </p>
        )}
      </section>
    </main>
  );
}
