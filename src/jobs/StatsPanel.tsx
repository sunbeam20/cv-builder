import { useMemo } from 'react'
import { Award, Clock, MessagesSquare, Send, Target, TrendingUp, TriangleAlert } from 'lucide-react'
import type { Application, ApplicationStatus } from '../types'
import { APPLICATION_STATUSES, STATUS_LABELS } from '../lib/applications'
import { activityByWeek, computeStats } from './model'

const STATUS_BAR: Record<ApplicationStatus, string> = {
  wishlist: 'bg-slate-400',
  applied: 'bg-sky-500',
  interview: 'bg-amber-500',
  offer: 'bg-emerald-500',
  rejected: 'bg-rose-400',
}

function StatCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-slate-400">{label}</p>
        <p className="text-lg font-semibold leading-tight text-slate-800">{value}</p>
        {hint ? <p className="truncate text-[10px] text-slate-400">{hint}</p> : null}
      </div>
    </div>
  )
}

export function StatsPanel({
  apps,
  now,
  goal,
  onSetGoal,
}: {
  apps: Application[]
  now: Date
  goal: number
  onSetGoal: (goal: number) => void
}) {
  const stats = useMemo(() => computeStats(apps, now), [apps, now])
  const buckets = useMemo(() => activityByWeek(apps, 12, now), [apps, now])
  const maxBucket = Math.max(1, ...buckets)
  const statusCounts = useMemo(() => {
    const counts: Record<ApplicationStatus, number> = {
      wishlist: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    }
    for (const app of apps) if (!app.archived) counts[app.status] += 1
    return counts
  }, [apps])
  const liveTotal = APPLICATION_STATUSES.reduce((sum, s) => sum + statusCounts[s], 0)

  return (
    <section className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={<Send size={16} />}
          label="Submitted"
          value={String(stats.submitted)}
          hint={`${stats.wishlist} in wishlist`}
        />
        <StatCard
          icon={<MessagesSquare size={16} />}
          label="Interviews"
          value={String(stats.interviews)}
          hint={`${stats.interviewRate}% of submitted`}
        />
        <StatCard
          icon={<Award size={16} />}
          label="Offers"
          value={String(stats.offers)}
          hint={`${stats.offerRate}% of submitted`}
        />
        <StatCard
          icon={<TrendingUp size={16} />}
          label="Response rate"
          value={`${stats.responseRate}%`}
          hint="Replies ÷ submitted"
        />
        <StatCard
          icon={<Target size={16} />}
          label="This week"
          value={String(stats.thisWeek)}
          hint={`${stats.thisMonth} this month`}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Pipeline</h3>
          {liveTotal === 0 ? (
            <p className="text-xs text-slate-400">No active applications yet.</p>
          ) : (
            <>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                {APPLICATION_STATUSES.map((status) =>
                  statusCounts[status] > 0 ? (
                    <span
                      key={status}
                      className={STATUS_BAR[status]}
                      style={{ width: `${(statusCounts[status] / liveTotal) * 100}%` }}
                      title={`${STATUS_LABELS[status]}: ${statusCounts[status]}`}
                    />
                  ) : null,
                )}
              </div>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-slate-600">
                {APPLICATION_STATUSES.map((status) => (
                  <li key={status} className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${STATUS_BAR[status]}`} />
                    <span className="flex-1">{STATUS_LABELS[status]}</span>
                    <span className="font-semibold text-slate-800">{statusCounts[status]}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Applications per week
          </h3>
          <div className="flex h-20 items-end gap-1.5">
            {buckets.map((count, index) => (
              <div
                key={index}
                className="flex-1 rounded-t bg-indigo-500/80"
                style={{ height: `${Math.max(count === 0 ? 3 : (count / maxBucket) * 100, 3)}%` }}
                title={`${count} application${count === 1 ? '' : 's'}`}
              />
            ))}
          </div>
          <p className="mt-2 text-right text-[10px] text-slate-400">12 weeks ago → this week</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            30-day goal
          </h3>
          <label className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-500">
            Target
            <input
              type="number"
              min={0}
              max={999}
              aria-label="Application goal"
              value={goal}
              onChange={(e) => onSetGoal(Number(e.target.value))}
              className="w-16 rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-700 outline-none focus:border-indigo-500"
            />
          </label>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <span
              className={`block h-full rounded-full ${stats.thisMonth >= goal ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              style={{ width: `${goal > 0 ? Math.min(100, (stats.thisMonth / goal) * 100) : 0}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-700">
            {stats.thisMonth}
            <span className="font-normal text-slate-400"> / {goal}</span>
          </span>
        </div>
        <p className="mt-1.5 text-[10px] text-slate-400">
          {goal === 0
            ? 'Set a target to track your pace.'
            : stats.thisMonth >= goal
              ? 'Goal reached — nice work!'
              : `${goal - stats.thisMonth} more to reach your goal`}
        </p>
      </div>

      {stats.followUpsDue > 0 || stats.stale > 0 ? (
        <div className="flex flex-wrap gap-2 text-[11px]">
          {stats.followUpsDue > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
              <Clock size={12} />
              {stats.followUpsDue} follow-up{stats.followUpsDue === 1 ? '' : 's'} due
            </span>
          ) : null}
          {stats.stale > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 font-medium text-rose-700">
              <TriangleAlert size={12} />
              {stats.stale} going stale
            </span>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

export default StatsPanel
