import PropTypes from 'prop-types';

const tones = {
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  teal: 'bg-teal-50 text-teal-700 ring-teal-200',
  pink: 'bg-pink-50 text-pink-700 ring-pink-200',
};

/**
 * Present one administrator dashboard count with its metric label.
 * @param {{ label: string, value: number, tone?: string }} props Metric details.
 * @returns {JSX.Element} Dashboard statistic card.
 */
export default function StatCard({ label, value, tone = 'indigo' }) {
  return (
    <article aria-label={`${label}: ${value}`} className="rounded-2xl border border-slate-200 bg-white p-5">
      <span aria-hidden="true" className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${tones[tone] ?? tones.indigo}`}>▦</span>
      <p className="mt-5 text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{value}</p>
    </article>
  );
}

StatCard.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.number.isRequired, tone: PropTypes.string };
