import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar.jsx';
import { getPosts } from '../utils/storage.js';
import { getRoleHome, getSession } from '../utils/auth.js';

const features = [
  { title: 'Write Freely', description: 'A plain-text writing space that keeps your attention on the words.' },
  { title: 'Private & Local', description: 'Your demo posts and account data stay in this browser profile.' },
  { title: 'Instant & Fast', description: 'A lightweight experience with no server standing between you and a new idea.' },
];

/**
 * Format an ISO date as the blog's compact display date.
 * @param {string} value Stored creation timestamp.
 * @returns {string} Human-readable month, day, and year.
 */
function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);
}

/**
 * Render public discovery, recent post previews, and the site footer.
 * @returns {JSX.Element} Public WriteSpace landing page.
 */
export default function LandingPage() {
  const session = getSession();
  const posts = getPosts().sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PublicNavbar session={session} />
      <main>
        <section className="relative isolate flex min-h-[82vh] items-center overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 px-5 py-20 text-white sm:px-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-2xl">
              <p className="mb-5 text-sm font-bold uppercase tracking-[0.22em] text-white/80">A calm corner of the internet</p>
              <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">Your thoughts.<br />Your space.</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/90 sm:text-xl">Your thoughts. Your space. Beautifully simple.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link className="rounded-xl bg-white px-6 py-3.5 text-center font-semibold text-indigo-700 shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-violet-600" to={session ? getRoleHome(session) : '/login'}>
                  Start Reading
                </Link>
                <Link className="rounded-xl border border-white/70 px-6 py-3.5 text-center font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" to="/register">
                  Get Started Free
                </Link>
              </div>
            </div>
            <div aria-label="Preview of a WriteSpace post" className="mx-auto w-full max-w-md rotate-1 rounded-3xl border border-white/30 bg-white/15 p-4 shadow-2xl backdrop-blur-sm" role="img">
              <div className="rounded-2xl bg-white p-6 text-slate-800 sm:p-8">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-pink-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
                  <span className="ml-auto text-xs font-semibold uppercase tracking-wider text-slate-400">Your next story</span>
                </div>
                <p className="mt-7 text-sm font-semibold text-indigo-600">MONDAY, SOMEWHERE</p>
                <h2 className="mt-3 font-serif text-3xl font-bold leading-tight">A little room<br />to think.</h2>
                <p className="mt-4 leading-7 text-slate-500">Start with a sentence. Stay for the thought you did not know you had.</p>
                <div className="mt-8 h-1.5 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-pink-400" />
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="features-heading" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">A simpler way to share</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl" id="features-heading">Make space for the words that matter.</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <article className={`rounded-2xl border border-slate-200 bg-white p-7 ${index === 1 ? 'md:-translate-y-3 md:shadow-lg' : ''}`} key={feature.title}>
                <span aria-hidden="true" className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-700">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="latest-heading" className="bg-white px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Freshly written</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900" id="latest-heading">Latest from the Blog</h2>
              </div>
              <Link className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 hover:text-indigo-900" to={session ? '/blogs' : '/login'}>Explore all posts</Link>
            </div>
            {posts.length ? (
              <div className="mt-9 grid gap-5 md:grid-cols-3">
                {posts.map((post) => (
                  <Link aria-label={`Read preview: ${post.title}`} className="group rounded-2xl border border-slate-200 p-6 transition-transform hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" key={post.id} to={`/blog/${post.id}`}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{formatDate(post.createdAt)}</p>
                    <h3 className="mt-4 text-xl font-bold text-slate-900 group-hover:text-indigo-700">{post.title}</h3>
                    <p className="mt-3 leading-7 text-slate-600">{post.content.slice(0, 120)}{post.content.length > 120 ? '…' : ''}</p>
                    <span className="mt-5 inline-block text-sm font-semibold text-indigo-700">Read the story →</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-600">No posts yet — check back soon!</p>
            )}
          </div>
        </section>
      </main>
      <footer className="bg-slate-900 px-5 py-10 text-slate-200 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link className="text-lg font-bold text-white" to="/">WriteSpace</Link>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Link className="hover:text-white" to="/">Home</Link>
            <Link className="hover:text-white" to={session ? '/blogs' : '/login'}>All Blogs</Link>
            <Link className="hover:text-white" to="/login">Login</Link>
            <Link className="hover:text-white" to="/register">Register</Link>
          </nav>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} WriteSpace</p>
        </div>
      </footer>
    </div>
  );
}
