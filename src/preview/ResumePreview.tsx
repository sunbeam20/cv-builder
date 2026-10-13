import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode, RefObject } from 'react'
import type { Resume } from '../types'
import type { TemplateTheme } from '../lib/templates'
import { formatRange } from '../lib/helpers'

export const A4_WIDTH = 794
export const A4_HEIGHT = 1123

interface PreviewProps {
  resume: Resume
  pageRef: RefObject<HTMLDivElement | null>
  theme: TemplateTheme
}

function SectionTitle({ children, accent }: { children: ReactNode; accent: string }) {
  return (
    <h2
      className="mb-2 border-b pb-1 text-[11px] font-bold uppercase tracking-[0.14em]"
      style={{ color: accent, borderColor: accent }}
    >
      {children}
    </h2>
  )
}

function Bullets({ items }: { items: string[] }) {
  const bullets = items.map((b) => b.trim()).filter(Boolean)
  if (bullets.length === 0) return null
  return (
    <ul className="mt-1 list-disc space-y-0.5 pl-4">
      {bullets.map((bullet, i) => (
        <li key={i} className="text-[11px] leading-snug text-slate-700">
          {bullet}
        </li>
      ))}
    </ul>
  )
}

export function ResumePage({ resume, pageRef, theme }: PreviewProps) {
  const { profile, experience, education, skills, projects, certifications, languages } = resume

  const contactParts = [
    profile.location,
    profile.phone,
    profile.email,
    profile.website,
    ...profile.links.map((l) => l.url || l.label),
  ]
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <div ref={pageRef} className="resume-page relative shadow-xl ring-1 ring-slate-200">
      {theme.accentBar ? (
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: theme.accent }} />
      ) : null}
      <header>
        <h1
          className="text-[26px] font-bold leading-tight tracking-tight"
          style={{ color: theme.nameColor }}
        >
          {profile.fullName || 'Your Name'}
        </h1>
        {profile.headline ? (
          <p className="mt-0.5 text-[13px] font-medium text-slate-600">{profile.headline}</p>
        ) : null}
        {contactParts.length > 0 ? (
          <p className="mt-2 text-[10.5px] text-slate-600">{contactParts.join('  |  ')}</p>
        ) : null}
      </header>

      {profile.summary.trim() ? (
        <section className="mt-4">
          <SectionTitle accent={theme.accent}>Professional Summary</SectionTitle>
          <p className="text-[11px] leading-relaxed text-slate-700">{profile.summary}</p>
        </section>
      ) : null}

      {experience.length > 0 ? (
        <section className="mt-4">
          <SectionTitle accent={theme.accent}>Experience</SectionTitle>
          <div className="flex flex-col gap-3">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[11.5px] font-semibold text-slate-900">
                    {exp.role || 'Role'}
                  </p>
                  <p className="shrink-0 text-[10.5px] text-slate-500">
                    {formatRange(exp.start, exp.end, exp.current)}
                  </p>
                </div>
                <p className="text-[11px] italic text-slate-600">
                  {[exp.company, exp.location].map((s) => s.trim()).filter(Boolean).join(', ')}
                </p>
                <Bullets items={exp.bullets} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {education.length > 0 ? (
        <section className="mt-4">
          <SectionTitle accent={theme.accent}>Education</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[11.5px] font-semibold text-slate-900">
                    {edu.school || 'School'}
                  </p>
                  <p className="shrink-0 text-[10.5px] text-slate-500">
                    {formatRange(edu.start, edu.end, false)}
                  </p>
                </div>
                <p className="text-[11px] italic text-slate-600">
                  {[edu.degree, edu.field].map((s) => s.trim()).filter(Boolean).join(', ')}
                  {edu.location ? ` — ${edu.location}` : ''}
                </p>
                {edu.details.trim() ? (
                  <p className="text-[11px] leading-snug text-slate-700">{edu.details}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {skills.length > 0 ? (
        <section className="mt-4">
          <SectionTitle accent={theme.accent}>Skills</SectionTitle>
          <div className="flex flex-col gap-1">
            {skills.map((group) => (
              <p key={group.id} className="text-[11px] text-slate-700">
                {group.category ? (
                  <span className="font-semibold text-slate-900">{group.category}: </span>
                ) : null}
                {group.items.join(', ')}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {projects.length > 0 ? (
        <section className="mt-4">
          <SectionTitle accent={theme.accent}>Projects</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {projects.map((project) => (
              <div key={project.id}>
                <p className="text-[11.5px] font-semibold text-slate-900">
                  {project.name}
                  {project.link.trim() ? (
                    <span className="ml-2 text-[10.5px] font-normal text-slate-500">
                      {project.link}
                    </span>
                  ) : null}
                </p>
                {project.description.trim() ? (
                  <p className="text-[11px] text-slate-700">{project.description}</p>
                ) : null}
                <Bullets items={project.bullets} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {certifications.length > 0 ? (
        <section className="mt-4">
          <SectionTitle accent={theme.accent}>Certifications</SectionTitle>
          <div className="flex flex-col gap-1">
            {certifications.map((cert) => (
              <p key={cert.id} className="text-[11px] text-slate-700">
                {cert.name}
                {cert.issuer ? ` — ${cert.issuer}` : ''}
                {cert.date ? ` (${cert.date})` : ''}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {languages.length > 0 ? (
        <section className="mt-4">
          <SectionTitle accent={theme.accent}>Languages</SectionTitle>
          <p className="text-[11px] text-slate-700">
            {languages
              .map((l) => [l.name, l.proficiency].filter(Boolean).join(' '))
              .filter(Boolean)
              .join('  •  ')}
          </p>
        </section>
      ) : null}
    </div>
  )
}

export function ResumePreview({ resume, pageRef, theme }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const width = el.clientWidth
      if (width > 0) setScale(Math.min(1, width / A4_WIDTH))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const boxStyle: CSSProperties = {
    width: A4_WIDTH * scale,
    height: A4_HEIGHT * scale,
    position: 'relative',
  }

  const pageStyle: CSSProperties = {
    width: A4_WIDTH,
    minHeight: A4_HEIGHT,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    position: 'absolute',
    top: 0,
    left: 0,
  }

  return (
    <div ref={containerRef} className="w-full">
      <div className="preview-page-box mx-auto" style={boxStyle}>
        <div className="preview-scaler" style={pageStyle}>
          <ResumePage resume={resume} pageRef={pageRef} theme={theme} />
        </div>
      </div>
    </div>
  )
}
