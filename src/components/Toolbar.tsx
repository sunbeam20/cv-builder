import { useEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import {
  Download,
  FileText,
  Home,
  Image,
  KeyRound,
  Loader2,
  MoreHorizontal,
  Palette,
  Printer,
  Redo2,
  RotateCcw,
  Sparkles,
  Undo2,
  Upload,
} from 'lucide-react'
import { useResumeStore } from '../store/resumeStore'
import { useJobsStore } from '../jobs/store'
import { bundleSchema, resumeSchema } from '../lib/schema'
import { downloadBlob, resumeHasContent, slug } from '../lib/helpers'
import { isTemplateId } from '../lib/templates'
import { useResolvedTheme } from '../lib/useResolvedTheme'
import { toast } from '../lib/toast'
import { goHome } from '../home/navigation'
import { ToolMenu } from '../home/ToolMenu'
import { BRAND } from '../home/config'
import { TemplatePicker } from './ui/TemplatePicker'
import { SaveIndicator } from './ui/SaveIndicator'

type Busy = 'pdf' | 'png' | null

const buttonBase =
  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60'

const iconButton =
  'inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40'

interface ToolbarProps {
  pageRef: RefObject<HTMLDivElement | null>
}

export function Toolbar({ pageRef }: ToolbarProps) {
  const resume = useResumeStore((s) => s.resume)
  const template = useResumeStore((s) => s.template)
  const customization = useResumeStore((s) => s.customization)
  const customPresets = useResumeStore((s) => s.customPresets)
  const setTemplate = useResumeStore((s) => s.setTemplate)
  const setCustomization = useResumeStore((s) => s.setCustomization)
  const setCustomPresets = useResumeStore((s) => s.setCustomPresets)
  const replace = useResumeStore((s) => s.replace)
  const applications = useJobsStore((s) => s.applications)
  const setApplications = useJobsStore((s) => s.setApplications)
  const loadSample = useResumeStore((s) => s.loadSample)
  const reset = useResumeStore((s) => s.reset)
  const openAiSettings = useResumeStore((s) => s.openAiSettings)
  const openDesign = useResumeStore((s) => s.openDesign)
  const undo = useResumeStore((s) => s.undo)
  const redo = useResumeStore((s) => s.redo)
  const canUndo = useResumeStore((s) => s.past.length > 0)
  const canRedo = useResumeStore((s) => s.future.length > 0)
  const [busy, setBusy] = useState<Busy>(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const theme = useResolvedTheme()

  const hasContent = resumeHasContent(resume) || applications.length > 0

  useEffect(() => {
    if (!moreOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [moreOpen])

  const run = async (kind: Busy, label: string, fn: () => Promise<void>) => {
    setBusy(kind)
    const toastId = toast.loading(`Preparing ${label}…`, { key: 'export' })
    try {
      await fn()
      toast.update(toastId, {
        variant: 'success',
        message: `${label} downloaded`,
        duration: 2500,
      })
    } catch (err) {
      toast.update(toastId, {
        variant: 'error',
        message: err instanceof Error ? err.message : `Couldn’t export ${label}`,
        duration: 5000,
      })
    } finally {
      setBusy(null)
    }
  }

  const handleImport = async (file: File) => {
    let raw: unknown
    try {
      raw = JSON.parse(await file.text())
    } catch {
      toast.error('That file isn’t a valid CV backup')
      return
    }

    const bundle = bundleSchema.safeParse(raw)
    const single = bundle.success ? null : resumeSchema.safeParse(raw)
    if (!bundle.success && !single?.success) {
      toast.error('Invalid CV file')
      return
    }

    const apply = () => {
      if (bundle.success) {
        replace(bundle.data.resume)
        if (bundle.data.applications) setApplications(bundle.data.applications)
        if (bundle.data.template && isTemplateId(bundle.data.template)) {
          setTemplate(bundle.data.template)
        }
        if (bundle.data.customization) setCustomization(bundle.data.customization)
        if (bundle.data.customPresets) setCustomPresets(bundle.data.customPresets)
      } else if (single && single.success) {
        replace(single.data)
      }
      toast.success('CV imported', { key: 'import' })
    }

    if (hasContent) {
      toast.confirm({
        message: 'Replace your current CV?',
        description: 'Importing a backup overwrites your resume and tracker.',
        confirmLabel: 'Replace',
        tone: 'error',
        onConfirm: apply,
      })
    } else {
      apply()
    }
  }

  const handleReset = () => {
    toast.confirm({
      message: 'Clear all CV data?',
      description: 'This cannot be undone.',
      confirmLabel: 'Clear everything',
      tone: 'error',
      onConfirm: () => {
        reset()
        toast.success('Cleared', { key: 'cleared' })
      },
    })
  }

  const handleSample = () => {
    const load = () => {
      loadSample()
      toast.success('Example data loaded', { key: 'sample' })
    }
    if (!hasContent) {
      load()
      return
    }
    toast.confirm({
      message: 'Load example data?',
      description: 'This replaces your current CV with sample content.',
      confirmLabel: 'Load example',
      onConfirm: load,
    })
  }

  const handleExportJson = () => {
    const json = JSON.stringify(
      { resume, applications, template, customization, customPresets },
      null,
      2,
    )
    downloadBlob(
      new Blob([json], { type: 'application/json' }),
      `${slug(resume.profile.fullName)}.json`,
    )
    toast.success('Backup downloaded', { key: 'backup' })
  }

  const secondaryActions: ReactNode = (
    <>
      <button
        type="button"
        className={`${buttonBase} border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800`}
        disabled={busy !== null}
        onClick={() =>
          run('png', 'PNG', async () => {
            const node = pageRef.current
            if (!node) return
            const { exportPng } = await import('../export/exportPng')
            await exportPng(node, resume.profile.fullName, 'CV')
          })
        }
      >
        {busy === 'png' ? <Loader2 size={15} className="animate-spin" /> : <Image size={15} />}
        {busy === 'png' ? 'Preparing…' : 'PNG'}
      </button>
      <button
        type="button"
        className={`${buttonBase} border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800`}
        onClick={() => window.print()}
      >
        <Printer size={15} />
        Print
      </button>
      <button
        type="button"
        className={`${buttonBase} border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800`}
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={15} />
        Import
      </button>
      <button
        type="button"
        className={`${buttonBase} border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800`}
        onClick={handleExportJson}
      >
        <Download size={15} />
        Backup
      </button>
      <button
        type="button"
        className={`${buttonBase} border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800`}
        onClick={openAiSettings}
      >
        <KeyRound size={15} />
        AI
      </button>
      <button
        type="button"
        className={`${buttonBase} border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800`}
        onClick={handleSample}
      >
        <Sparkles size={15} />
        Example
      </button>
      <button
        type="button"
        className={`${buttonBase} border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950`}
        onClick={handleReset}
      >
        <RotateCcw size={15} />
        Reset
      </button>
    </>
  )

  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur no-print">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-4 py-2.5">
        <div className="mr-auto flex items-center gap-2">
          <button
            type="button"
            aria-label={`Go to ${BRAND} home`}
            title="All tools"
            onClick={() => goHome()}
            className={iconButton}
          >
            <Home size={15} />
          </button>
          <button
            type="button"
            onClick={() => goHome()}
            className="text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            CV Builder
          </button>
          <div className="hidden sm:block">
            <TemplatePicker />
          </div>
          <button
            type="button"
            aria-label="Customize design"
            title="Customize design"
            onClick={openDesign}
            className={iconButton}
          >
            <Palette size={15} />
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
              onClick={undo}
              disabled={!canUndo}
              className={iconButton}
            >
              <Undo2 size={15} />
            </button>
            <button
              type="button"
              aria-label="Redo"
              title="Redo (Ctrl+Shift+Z)"
              onClick={redo}
              disabled={!canRedo}
              className={iconButton}
            >
              <Redo2 size={15} />
            </button>
          </div>
          <SaveIndicator />
        </div>

        <ToolMenu />

        <button
          type="button"
          className={`${buttonBase} bg-indigo-600 text-white hover:bg-indigo-700`}
          disabled={busy !== null}
          onClick={() =>
            run('pdf', 'PDF', async () => {
              const { exportPdf } = await import('../export/exportPdf')
              await exportPdf(resume, theme)
            })
          }
        >
          {busy === 'pdf' ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <FileText size={15} />
          )}
          {busy === 'pdf' ? 'Preparing…' : 'Download PDF'}
        </button>

        <div className="hidden items-center gap-2 lg:flex">{secondaryActions}</div>

        <button
          type="button"
          aria-label="More actions"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((v) => !v)}
          className={`${buttonBase} border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 lg:hidden`}
        >
          <MoreHorizontal size={15} />
          More
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleImport(file)
            e.target.value = ''
          }}
        />
      </div>

      {moreOpen ? (
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 lg:hidden">
          {secondaryActions}
        </div>
      ) : null}
    </div>
  )
}