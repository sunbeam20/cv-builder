import { useState } from 'react'
import { Copy, Mail, Plus, Trash2 } from 'lucide-react'
import { ToolHeader } from '../components/ui/ToolHeader'
import { toast } from '../lib/toast'
import { SOCIAL_PRESETS, emptySignature, signatureHtml, signatureText, uid, type SignatureInput } from './model'

const inputClass =
  'w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500'

export function SignatureApp() {
  const [input, setInput] = useState<SignatureInput>(emptySignature)
  const patch = (updater: Partial<SignatureInput>) => setInput((prev) => ({ ...prev, ...updater }))
  const html = signatureHtml(input)

  const copy = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(message)
    } catch {
      toast.error('Clipboard unavailable')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ToolHeader icon={Mail} title="Email Signature" subtitle="Build a table-based HTML signature that works in any mail client." />

      <main className="mx-auto grid max-w-4xl gap-4 px-4 py-6 md:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {(
            [
              ['name', 'Full name'],
              ['role', 'Role'],
              ['company', 'Company'],
              ['email', 'Email'],
              ['phone', 'Phone'],
              ['website', 'Website'],
              ['location', 'Location'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              {label}
              <input aria-label={label} className={inputClass} value={input[key]} onChange={(e) => patch({ [key]: e.target.value })} />
            </label>
          ))}

          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            Accent
            <input aria-label="Accent" type="color" className="h-8 w-16 rounded-md border border-slate-200" value={input.accent} onChange={(e) => patch({ accent: e.target.value })} />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-slate-400">Social links</span>
            {input.socials.map((social) => (
              <div key={social.id} className="flex gap-1.5">
                <select
                  aria-label="Network"
                  className="rounded-md border border-slate-200 px-2 text-sm text-slate-600"
                  value={social.label}
                  onChange={(e) =>
                    patch({ socials: input.socials.map((entry) => (entry.id === social.id ? { ...entry, label: e.target.value } : entry)) })
                  }
                >
                  {SOCIAL_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                </select>
                <input
                  aria-label="Social url"
                  className={inputClass}
                  value={social.url}
                  onChange={(e) =>
                    patch({ socials: input.socials.map((entry) => (entry.id === social.id ? { ...entry, url: e.target.value } : entry)) })
                  }
                />
                <button
                  type="button"
                  aria-label="Remove social"
                  onClick={() => patch({ socials: input.socials.filter((entry) => entry.id !== social.id) })}
                  className="px-1 text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => patch({ socials: [...input.socials, { id: uid(), label: 'GitHub', url: '' }] })}
              className="inline-flex items-center gap-1.5 self-start rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50"
            >
              <Plus size={13} /> Add social
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="text-xs font-medium text-slate-400">Preview</span>
            <div className="mt-3" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(html, 'HTML copied')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              <Copy size={15} /> Copy HTML
            </button>
            <button
              type="button"
              onClick={() => copy(signatureText(input), 'Text copied')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Copy size={15} /> Copy plain text
            </button>
          </div>
          <details className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-sm">
            <summary className="cursor-pointer font-medium text-slate-600">HTML source</summary>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[11px]">{html}</pre>
          </details>
        </section>
      </main>
    </div>
  )
}

export default SignatureApp
