import { Link } from 'react-router-dom';
import BlogCard from '../components/BlogCard.jsx';
import { getSession } from '../utils/auth.js';
import { getPosts } from '../utils/storage.js';

/**
 * Render all posts in descending creation order for an authenticated reader.
 * @returns {JSX.Element} Responsive blog listing and useful empty state.
 */
export default function Home() {
  const session = getSession();
  const posts = getPosts().sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Community stories</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">All Blogs</h1>
          <p className="mt-3 max-w-xl text-slate-600">Ideas, reflections, and small discoveries from your WriteSpace community.</p>
        </div>
        <Link
          className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          to="/write"
        >
          Write a post
        </Link>
      </div>
      {posts.length ? (
        <section aria-label="Blog posts" className="mt-9 grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => <BlogCard index={index} key={post.id} post={post} session={session} />)}
        </section>
      ) : (
        <section className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p
            aria-hidden="true"
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl font-bold text-indigo-600"
          >
            W
          </p>
          <h2 className="mt-5 text-2xl font-bold text-slate-900">No blogs yet. Be the first to write one!</h2>
          <p className="mt-3 text-slate-600">Start a story and give the community something new to read.</p>
          <Link
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            to="/write"
          >
            Write your first post
          </Link>
        </section>
      )}
    </main>
  );
}
