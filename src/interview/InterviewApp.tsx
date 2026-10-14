import { useEffect, useMemo, useState } from 'react'
import { Check, Copy, MessagesSquare, Play, RefreshCw, Trash2 } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { useInterviewStore } from './store'
import {
  CATEGORY_LABELS,
  ROLE_PACKS,
  STAR_FIELDS,
  STAR_HINTS,
  composeStar,
  emptyAnswer,
  feedbackFor,
  filterQuestions,
  randomQuestion,
  type QuestionCategory,
  type RolePack,
  type StarAnswer,
} from './model'

const inputClass =
  'w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500'

const PRACTICE_SECONDS = 90

export function InterviewApp() {
  const answers = useInterviewStore((s) => s.answers)
  const practiced = useInterviewStore((s) => s.practiced)
  const addAnswer = useInterviewStore((s) => s.addAnswer)
  const updateAnswer = useInterviewStore((s) => s.updateAnswer)
  const removeAnswer = useInterviewStore((s) => s.removeAnswer)
  const markPracticed = useInterviewStore((s) => s.markPracticed)
  const notes = useInterviewStore((s) => s.notes)
  const setNote = useInterviewStore((s) => s.setNote)

  const [category, setCategory] = useState<QuestionCategory | 'all'>('all')
  const [pack, setPack] = useState<RolePack | 'all'>('all')
  const [prompt, setPrompt] = useState(() => randomQuestion().text)
  const [remaining, setRemaining] = useState(PRACTICE_SECONDS)
  const [running, setRunning] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [editing, setEditing] = useState<StarAnswer | null>(null)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  const questions = useMemo(() => filterQuestions(category, pack), [category, pack])

  const feedback = useMemo(
    () => (editing && composeStar(editing) ? feedbackFor(editing) : null),
    [editing],
  )

  const passingAnswers = useMemo(
    () => answers.filter((answer) => feedbackFor(answer).score >= 4).length,
    [answers],
  )

  const nextQuestion = () => {
    setPrompt(randomQuestion(prompt).text)
    setRemaining(PRACTICE_SECONDS)
    setRunning(false)
  }

  const startAnswer = (question: string) => setEditing(emptyAnswer(question))

  const saveAnswer = () => {
    if (!editing) return
    if (!editing.question.trim()) {
      toast.error('Choose a question first')
      return
    }
    const exists = answers.some((answer) => answer.id === editing.id)
    if (exists) updateAnswer(editing.id, editing)
    else addAnswer(editing)
    setEditing(null)
    toast.success('Answer saved')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-800">
      <ToolHeader icon={MessagesSquare} title="Interview Prep" subtitle="Practice common questions and build STAR answers." />

      <main className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Practice mode</span>
            <span aria-label="Practice time remaining" className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">
              {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
            </span>
          </div>
          <p className="text-base font-medium text-slate-800 dark:text-slate-100">{prompt}</p>
          {showHints ? (
            <ul className="grid gap-1 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
              {STAR_FIELDS.map((field) => (
                <li key={field}>
                  <span className="font-semibold capitalize">{field}:</span> {STAR_HINTS[field]}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setRunning((value) => !value)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              <Play size={14} /> {running ? 'Pause' : 'Start timer'}
            </button>
            <button
              type="button"
              onClick={nextQuestion}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <RefreshCw size={14} /> Next question
            </button>
            <button
              type="button"
              onClick={() => setShowHints((value) => !value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {showHints ? 'Hide hints' : 'Show hints'}
            </button>
            <button
              type="button"
              onClick={() => markPracticed(prompt)}
              className="ml-auto inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              <Check size={14} /> Mark practiced
            </button>
          </div>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
            Practice notes
            <textarea
              aria-label="Practice notes"
              rows={2}
              placeholder="Jot down talking points for this question."
              className={`${inputClass} resize-y`}
              value={notes[prompt] ?? ''}
              onChange={(e) => setNote(prompt, e.target.value)}
            />
          </label>
        </section>

        <section className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Question bank</span>
              <div className="flex items-center gap-1.5">
                <select
                  aria-label="Role pack"
                  className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs text-slate-600 dark:text-slate-300"
                  value={pack}
                  onChange={(e) => setPack(e.target.value as RolePack | 'all')}
                >
                  <option value="all">All roles</option>
                  {ROLE_PACKS.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Category"
                  className="rounded-md border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs text-slate-600 dark:text-slate-300"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as QuestionCategory | 'all')}
                >
                  <option value="all">All</option>
                  {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <ul className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
              {questions.map((question) => (
                <li key={question.id}>
                  <button
                    type="button"
                    onClick={() => startAnswer(question.text)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-left text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span className="mr-1 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase text-slate-400 dark:text-slate-500">
                      {CATEGORY_LABELS[question.category]}
                    </span>
                    {question.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            {editing ? (
              <>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">STAR answer</span>
                <input
                  aria-label="Question"
                  className={inputClass}
                  value={editing.question}
                  onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                />
                {STAR_FIELDS.map((field) => (
                  <label key={field} className="flex flex-col gap-1 text-xs font-medium capitalize text-slate-600 dark:text-slate-300">
                    {field}
                    <textarea
                      aria-label={field}
                      rows={2}
                      placeholder={STAR_HINTS[field]}
                      className={`${inputClass} resize-y`}
                      value={editing[field]}
                      onChange={(e) => setEditing({ ...editing, [field]: e.target.value })}
                    />
                  </label>
                ))}
                {feedback ? (
                  <div className="flex flex-col gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500 dark:text-slate-400">Answer feedback</span>
                      <span aria-label="Feedback score" className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                        {feedback.score}/{feedback.max}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${(feedback.score / feedback.max) * 100}%` }}
                      />
                    </div>
                    {feedback.tips.length > 0 ? (
                      <ul className="list-disc pl-4 text-xs text-slate-500 dark:text-slate-400">
                        {feedback.tips.map((tip) => (
                          <li key={tip}>{tip}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Strong answer — keep it up.</p>
                    )}
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={saveAnswer}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
                  >
                    Save answer
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <p className="grid flex-1 place-items-center text-center text-xs text-slate-400 dark:text-slate-500">
                Pick a question to build a STAR answer.
              </p>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {practiced.length} practiced · {passingAnswers} passing answer(s)
          </p>
          {answers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-6 text-center text-sm text-slate-400 dark:text-slate-500">
              No saved answers yet. {practiced.length > 0 ? `You've practiced ${practiced.length} question(s).` : ''}
            </p>
          ) : (
            answers.map((answer) => {
              const answerFeedback = feedbackFor(answer)
              return (
              <div key={answer.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <p className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">{answer.question}</p>
                  <span className="rounded bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {answerFeedback.score}/{answerFeedback.max}
                  </span>
                  <button
                    type="button"
                    aria-label="Copy answer"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(composeStar(answer))
                        toast.success('Copied')
                      } catch {
                        toast.error('Clipboard unavailable')
                      }
                    }}
                    className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="Edit answer"
                    onClick={() => setEditing(answer)}
                    className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete answer"
                    onClick={() => removeAnswer(answer.id)}
                    className="text-slate-400 dark:text-slate-500 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {composeStar(answer) ? (
                  <p className="mt-1 whitespace-pre-wrap text-xs text-slate-500 dark:text-slate-400">{composeStar(answer)}</p>
                ) : null}
              </div>
              )
            })
          )}
        </section>
      </main>
    </div>
  )
}

export default InterviewApp
