import { useEffect, useMemo, useState } from 'react'
import { Pause, Play, RotateCcw, Timer } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { useFocusStore } from './store'
import {
  PHASE_LABELS,
  formatClock,
  nextPhase,
  phaseSeconds,
  summarise,
  type FocusSettings,
  type Phase,
} from './model'

const inputClass =
  'w-20 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500'

function chime() {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    const ctx = new Ctor()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.frequency.value = 660
    gain.gain.value = 0.12
    oscillator.connect(gain).connect(ctx.destination)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.2)
    oscillator.onended = () => void ctx.close()
  } catch {
    /* audio is a nicety; ignore failures */
  }
}

export function FocusApp() {
  const sessions = useFocusStore((s) => s.sessions)
  const settings = useFocusStore((s) => s.settings)
  const addSession = useFocusStore((s) => s.addSession)
  const updateSettings = useFocusStore((s) => s.updateSettings)
  const clearSessions = useFocusStore((s) => s.clearSessions)

  const [phase, setPhase] = useState<Phase>('work')
  const [remaining, setRemaining] = useState(() => phaseSeconds('work', settings))
  const [running, setRunning] = useState(false)
  const [completedWork, setCompletedWork] = useState(0)

  const summary = useMemo(() => summarise(sessions), [sessions])

  useEffect(() => {
    if (!running) setRemaining(phaseSeconds(phase, settings))
  }, [phase, settings, running])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setRemaining((prev) => Math.max(0, prev - 1)), 1000)
    return () => window.clearInterval(id)
  }, [running])

  useEffect(() => {
    if (!running || remaining > 0) return
    chime()
    let nextCount = completedWork
    if (phase === 'work') {
      nextCount += 1
      addSession('work', settings.workMin)
      setCompletedWork(nextCount)
    }
    const upcoming = nextPhase(phase, nextCount, settings)
    setPhase(upcoming)
    setRemaining(phaseSeconds(upcoming, settings))
    if (!settings.autoStart) setRunning(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, running])

  const reset = () => {
    setRunning(false)
    setRemaining(phaseSeconds(phase, settings))
  }

  const total = phaseSeconds(phase, settings)
  const progress = total === 0 ? 0 : ((total - remaining) / total) * 100
  const isWork = phase === 'work'

  const settingField = (
    key: keyof Pick<FocusSettings, 'workMin' | 'shortBreakMin' | 'longBreakMin' | 'cyclesBeforeLong'>,
    label: string,
    min = 1,
  ) => (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
      {label}
      <input
        aria-label={label}
        type="number"
        min={min}
        className={inputClass}
        value={settings[key]}
        onChange={(e) => updateSettings({ [key]: Math.max(min, Number(e.target.value) || min) })}
      />
    </label>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <ToolHeader icon={Timer} title="Focus Timer" subtitle="A Pomodoro timer that keeps a record of your deep work." />

      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
        <section className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isWork ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {PHASE_LABELS[phase]}
          </span>

          <div className="relative grid h-48 w-48 place-items-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={isWork ? '#6366f1' : '#10b981'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
              />
            </svg>
            <span className="text-4xl font-bold tabular-nums text-slate-800" aria-label="Time remaining">
              {formatClock(remaining)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRunning((value) => !value)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white ${
                running ? 'bg-slate-600 hover:bg-slate-500' : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {running ? <Pause size={15} /> : <Play size={15} />}
              {running ? 'Pause' : 'Start'}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>
          <p className="text-xs text-slate-400">
            {completedWork} focus session{completedWork === 1 ? '' : 's'} this sitting
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Focus today', value: `${summary.todayMinutes}m` },
            { label: 'Sessions today', value: String(summary.todaySessions) },
            { label: 'Total hours', value: `${summary.totalHours}h` },
            { label: 'Day streak', value: `${summary.streak}d` },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
              <p className="text-lg font-bold text-slate-800">{card.value}</p>
              <p className="text-[11px] text-slate-400">{card.label}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {settingField('workMin', 'Focus min')}
          {settingField('shortBreakMin', 'Short break')}
          {settingField('longBreakMin', 'Long break')}
          {settingField('cyclesBeforeLong', 'Cycles')}
          <label className="inline-flex items-center gap-1.5 pb-2 text-xs text-slate-600">
            <input
              type="checkbox"
              aria-label="Auto-start next phase"
              checked={settings.autoStart}
              onChange={(e) => updateSettings({ autoStart: e.target.checked })}
            />
            Auto-start
          </label>
          <button
            type="button"
            onClick={clearSessions}
            className="ml-auto pb-1 text-xs text-slate-400 hover:text-red-500"
          >
            Clear history
          </button>
        </section>
      </main>
    </div>
  )
}

export default FocusApp
